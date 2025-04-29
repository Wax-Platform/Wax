const { logger, useTransaction, pubsubManager } = require('@coko/server')
const { NotFoundError, raw } = require('objection')
const config = require('config')
const findIndex = require('lodash/findIndex')
const find = require('lodash/find')
const pullAll = require('lodash/pullAll')
const map = require('lodash/map')
const clone = require('lodash/clone')
const assign = require('lodash/assign')
const cheerio = require('cheerio')

const {
  updateTeamMembership,
} = require('@coko/server/src/models/team/team.controller')

const {
  ApplicationParameter,
  BookComponentState,
  BookComponent,
  BookComponentTranslation,
  Division,
  Book,
  Lock,
} = require('../models').models

const { createTeam, getObjectTeam } = require('./team.controller')

const { STATUSES } = require('../api/graphql/bookComponent/constants')

const { TEAM_MEMBERS_UPDATED } = require('../api/graphql/team/constants')

const {
  YJS_CONTENT_UPDATED,
} = require('../api/graphql/bookComponent/constants')

const bookComponentContentCreator = require('./helpers/bookComponentContentCreator')

const { isEmptyString } = require('../utilities/generic')
const { isAdmin } = require('./user.controller')

const getBookComponent = async (bookComponentId, options = {}) => {
  const { trx } = options
  logger.info(`>>> fetching book component with id ${bookComponentId}`)

  const bookComponent = await useTransaction(
    async tr =>
      BookComponent.findOne(
        { id: bookComponentId, deleted: false },
        { trx: tr },
      ),
    { trx, passedTrxOnly: true },
  )

  if (!bookComponent) {
    throw new NotFoundError({
      message: `book component with id: ${bookComponentId} does not exist`,
      data: { BookComponentId: bookComponentId },
    })
  }

  return bookComponent
}

const getBookComponentAndAcquireLock = async (
  bookComponentId,
  userId,
  tabId,
  options = {},
) => {
  try {
    const { trx } = options
    logger.info(`>>> fetching book component with id ${bookComponentId}`)

    const bookComponent = await useTransaction(
      async tr => {
        const bc = await BookComponent.findOne(
          {
            id: bookComponentId,
            deleted: false,
          },
          { trx: tr },
        )

        const { result: locks } = await Lock.find({
          foreignId: bookComponentId,
        })

        if (locks.length === 0) {
          await Lock.insert({
            foreignId: bookComponentId,
            foreignType: 'bookComponent',
            tabId,
            userId,
          })

          logger.info(
            `lock acquired for book component with id ${bookComponentId} for the user with id ${userId} and tabId ${tabId}`,
          )
        }

        return bc
      },
      { trx },
    )

    if (!bookComponent) {
      throw new Error(
        `book component with id: ${bookComponentId} does not exist`,
      )
    }

    return bookComponent
  } catch (e) {
    throw new Error(e)
  }
}

const updateBookComponent = async (bookComponentId, patch, options = {}) => {
  try {
    const { trx } = options
    logger.info(`>>> updating book component with id ${bookComponentId}`)

    return useTransaction(
      async tr =>
        BookComponent.patchAndFetchById(bookComponentId, patch, { trx: tr }),
      {
        trx,
      },
    )
  } catch (e) {
    throw new Error(e)
  }
}

const addBookComponent = async (
  divisionId,
  bookId,
  componentType,
  afterId,
  userId,
  options = {},
) => {
  try {
    const pubsub = await pubsubManager.getPubsub()
    logger.info('bookComponent resolver: executing addBookComponent use case')
    const { trx } = options
    return useTransaction(
      async tr => {
        const applicationParameters = await ApplicationParameter.query(
          tr,
        ).findOne({
          context: 'bookBuilder',
          area: 'stages',
        })

        if (!applicationParameters) {
          throw new Error(`application parameters do not exist`)
        }

        const { config: workflowStages } = applicationParameters

        let bookComponentWorkflowStages

        const newBookComponent = {
          bookId,
          componentType,
          divisionId,
          archived: false,
          pagination: {
            left: false,
            right: false,
          },
          deleted: false,
        }

        if (afterId) {
          const previousComponent = await BookComponent.findById(afterId)

          if (previousComponent.parentComponentId) {
            newBookComponent.parentComponentId =
              previousComponent.parentComponentId
          } else if (previousComponent.componentType === 'part') {
            newBookComponent.parentComponentId = afterId
          }
        }

        const createdBookComponent = await BookComponent.insert(
          newBookComponent,
          { trx: tr },
        )

        logger.info(
          `new book component created with id ${createdBookComponent.id}`,
        )

        // const initialDoc = new Y.Doc()
        // const yState = Y.encodeStateAsUpdate(initialDoc)
        // const base64State = Buffer.from(yState).toString('base64')

        const translationData = {
          bookComponentId: createdBookComponent.id,
          yState: null,
          languageIso: 'en',
        }

        if (componentType === 'endnotes') {
          translationData.title = 'Notes'
        }

        const translation = await BookComponentTranslation.insert(
          translationData,
          { trx: tr },
        )

        logger.info(
          `new book component translation created with id ${translation.id}`,
        )

        if (afterId) {
          // update order, insert new chapter after the specified one
          const division = await Division.findById(divisionId)
          const chapterOrder = division.bookComponents

          chapterOrder.splice(
            chapterOrder.indexOf(afterId) + 1,
            0,
            createdBookComponent.id,
          )

          await Division.query(tr).where('id', divisionId).patch({
            bookComponents: chapterOrder,
          })
        } else {
          await Division.query(tr)
            .where('id', divisionId)
            .patch({
              book_components: raw(
                `book_components || '"${createdBookComponent.id}"'`,
              ),
            })
        }

        if (workflowStages) {
          bookComponentWorkflowStages = {
            workflowStages: map(workflowStages, stage => {
              if (
                config.has('featureBookStructure') &&
                ((config.get('featureBookStructure') &&
                  JSON.parse(config.get('featureBookStructure'))) ||
                  false)
              ) {
                if (stage.type === 'upload') {
                  return {
                    type: stage.type,
                    label: stage.title,
                    value: 1,
                  }
                }

                if (stage.type === 'file_prep') {
                  return {
                    type: stage.type,
                    label: stage.title,
                    value: 0,
                  }
                }
              }

              return {
                type: stage.type,
                label: stage.title,
                value: -1,
              }
            }),
          }
        }

        const bookComponentState = await BookComponentState.insert(
          assign(
            {},
            {
              bookComponentId: createdBookComponent.id,
              trackChangesEnabled: false,
              includeInToc: true,
              uploading: false,
            },
            bookComponentWorkflowStages,
          ),
          { trx: tr },
        )

        logger.info(
          `new state created with id ${bookComponentState.id} for the book component with id ${createdBookComponent.id}`,
        )

        if (
          config.has('featureBookStructure') &&
          ((config.get('featureBookStructure') &&
            JSON.parse(config.get('featureBookStructure'))) ||
            false)
        ) {
          const book = await Book.findById(bookId, { trx: tr })

          const levelIndex = findIndex(book.bookStructure.levels, {
            type: componentType,
          })

          if (levelIndex !== -1) {
            await bookComponentContentCreator(
              createdBookComponent,
              undefined,
              book.bookStructure,
              levelIndex,
              {},
              { trx: tr },
            )
          }
        }

        const configNonGlobalTeams = config.get('teams.nonGlobal')

        await Promise.all(
          Object.keys(configNonGlobalTeams).map(async k => {
            const teamData = configNonGlobalTeams[k]

            const exists = await getObjectTeam(
              teamData.role,
              createdBookComponent.id,
              false,
              {
                trx: tr,
              },
            )

            if (!exists) {
              const createdTeam = await createTeam(
                teamData.displayName,
                createdBookComponent.id,
                'bookComponent',
                teamData.role,
                false,
                {
                  trx: tr,
                },
              )

              pubsub.publish(TEAM_MEMBERS_UPDATED, {
                teamMembersUpdated: createdTeam.id,
              })

              if (teamData.role === 'owner') {
                await updateTeamMembership(createdTeam.id, [userId], {
                  trx: tr,
                })

                pubsub.publish(TEAM_MEMBERS_UPDATED, {
                  teamMembersUpdated: createdTeam.id,
                })
              }
            }
          }),
        )

        return createdBookComponent
      },
      {
        trx,
      },
    )
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const updateContent = async (bookComponentId, content, languageIso) => {
  try {
    const pubsub = await pubsubManager.getPubsub()

    const bookComponentTranslation = await BookComponentTranslation.findOne({
      bookComponentId,
      languageIso,
    })

    // parse content and convert any additional h1 tag to h2 (allow only the first h1 as title)
    const $ = cheerio.load(content)
    $('h1:not(:first-of-type)').replaceWith((_, e) => `<h2>${$(e).html()}</h2>`)
    const parsedContent = $.html('body > *')

    const { id: translationId } = bookComponentTranslation

    logger.info(
      `The translation entry found for the book component with id ${bookComponentId}. The entry's id is ${translationId}`,
    )

    const updatedContent = await BookComponentTranslation.patchAndFetchById(
      translationId,
      {
        content: parsedContent,
      },
    )

    logger.info(
      `The translation entry updated for the book component with id ${bookComponentId} and entry's id ${translationId}`,
    )

    let shouldNotifyWorkflowChange = false

    if (
      isEmptyString(bookComponentTranslation.content) &&
      !isEmptyString(content)
    ) {
      const hasWorkflowConfig = await ApplicationParameter.findOne({
        context: 'bookBuilder',
        area: 'stages',
      })

      if (hasWorkflowConfig) {
        logger.info(`should update also workflow`)

        const bookComponentState = await BookComponentState.findOne({
          bookComponentId,
        })

        if (!bookComponentState) {
          throw new Error(
            `state does not exist for the book component with id ${bookComponentId}`,
          )
        }

        const { id, workflowStages } = bookComponentState

        const uploadStepIndex = findIndex(workflowStages, { type: 'upload' })

        const filePrepStepIndex = findIndex(workflowStages, {
          type: 'file_prep',
        })

        workflowStages[uploadStepIndex].value = 1
        workflowStages[filePrepStepIndex].value = 0

        const updatedState = await BookComponentState.patchAndFetchById(id, {
          workflowStages,
        })

        if (!updatedState) {
          throw new Error(
            `workflow was not updated for the book component with id ${bookComponentId}`,
          )
        }

        shouldNotifyWorkflowChange = true
      }
    }

    pubsub.publish(YJS_CONTENT_UPDATED, {
      yjsContentUpdated: bookComponentId,
    })

    return { updatedContent, shouldNotifyWorkflowChange }
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const toggleIncludeInTOC = async bookComponentId => {
  try {
    const currentSate = await BookComponentState.findOne({
      bookComponentId,
    })

    if (!currentSate) {
      throw new Error(
        `no state info exists for the book component with id ${bookComponentId}`,
      )
    }

    const { id, includeInToc: currentTOC } = currentSate
    logger.info(
      `Current state for the book component with id ${bookComponentId} found with id ${id}`,
    )

    const updatedState = await BookComponentState.patchAndFetchById(id, {
      includeInToc: !currentTOC,
    })

    logger.info(
      `Include in TOC value changed from ${currentTOC} to ${updatedState.includeInToc} for the book component with id ${bookComponentId}`,
    )
    return updatedState
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const updateComponentType = async (bookComponentId, componentType) => {
  try {
    const currentBookComponent = await BookComponent.findById(bookComponentId)

    if (!currentBookComponent) {
      throw new Error(
        `book component with id ${bookComponentId} does not exists`,
      )
    }

    logger.info(`book component with id ${bookComponentId} found`)

    if (currentBookComponent.componentType === 'toc') {
      throw new Error(
        'You cannot change the component type of the Table of Contents',
      )
    }

    const updatedBookComponent = await BookComponent.patchAndFetchById(
      bookComponentId,
      {
        componentType,
      },
    )

    logger.info(
      `component type changed from ${currentBookComponent.componentType} to ${updatedBookComponent.componentType} for book component with id ${bookComponentId}`,
    )
    return updatedBookComponent
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const updateBookComponentParentId = async (
  bookComponentId,
  parentComponentId,
) => {
  try {
    return BookComponent.patchAndFetchById(bookComponentId, {
      parentComponentId,
    })
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const updateUploading = async (bookComponentId, uploading) => {
  try {
    const currentState = await BookComponentState.findOne({
      bookComponentId,
    })

    if (!currentState) {
      throw new Error(
        `no state info exists for the book component with id ${bookComponentId}`,
      )
    }

    const { id } = currentState

    logger.info(
      `Current state for the book component with id ${bookComponentId} found with id ${id}`,
    )

    const updatedState = await BookComponentState.patchAndFetchById(id, {
      uploading,
    })

    logger.info(
      `book component uploading state changed from ${currentState.uploading} to ${updatedState.uploading} for book component with id ${bookComponentId}`,
    )

    return updatedState
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const updateTrackChanges = async (bookComponentId, trackChangesEnabled) => {
  try {
    const currentState = await BookComponentState.findOne({
      bookComponentId,
    })

    if (!currentState) {
      throw new Error(
        `no state info exists for the book component with id ${bookComponentId}`,
      )
    }

    const { id } = currentState

    logger.info(
      `Current state for the book component with id ${bookComponentId} found with id ${id}`,
    )

    const updatedState = await BookComponentState.patchAndFetchById(id, {
      trackChangesEnabled,
    })

    logger.info(
      `book component track changes state changed from ${currentState.trackChangesEnabled} to ${updatedState.trackChangesEnabled} for book component with id ${bookComponentId}`,
    )

    return updatedState
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const setStatus = async (bookComponentId, status) => {
  try {
    const currentState = await BookComponentState.findOne({
      bookComponentId,
    })

    if (!currentState) {
      throw new Error(
        `no state info exists for the book component with id ${bookComponentId}`,
      )
    }

    const { id } = currentState

    logger.info(
      `Current state for the book component with id ${bookComponentId} found with id ${id}`,
    )

    const updatedState = await BookComponentState.patchAndFetchById(id, {
      status,
    })

    logger.info(
      `book component status changed from ${currentState.status} to ${updatedState.status} for book component with id ${bookComponentId}`,
    )

    return updatedState
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const updatePagination = async (bookComponentId, pagination) => {
  try {
    return BookComponent.patchAndFetchById(bookComponentId, {
      pagination,
    })
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const unlockBookComponent = async (
  bookComponentId,
  actingUserId = undefined,
) => {
  try {
    return useTransaction(async tr => {
      let status = STATUSES.UNLOCKED_BY_OWNER

      const { result: locks } = await Lock.find(
        {
          foreignId: bookComponentId,
          foreignType: 'bookComponent',
        },
        { trx: tr },
      )

      if (locks.length > 1) {
        status = STATUSES.UNLOCKED_WITH_MULTIPLE_LOCKS
        logger.info(
          `multiple locks found for book component with id ${bookComponentId} and deleted `,
        )
        await BookComponentState.query(tr)
          .patch({ status })
          .where({ bookComponentId })

        return Lock.query(tr).delete().where({
          foreignId: bookComponentId,
          foreignType: 'bookComponent',
        })
      }

      logger.info(`lock for book component with id ${bookComponentId} deleted `)

      if (actingUserId) {
        const adminUser = await isAdmin(actingUserId)

        if (adminUser && locks[0].userId !== actingUserId) {
          status = STATUSES.UNLOCKED_BY_ADMIN
        }
      }

      await BookComponentState.query(tr)
        .patch({ status })
        .where({ bookComponentId })

      return Lock.query(tr).delete().where({
        foreignId: bookComponentId,
        foreignType: 'bookComponent',
      })
    }, {})
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const lockBookComponent = async (bookComponentId, tabId, userAgent, userId) => {
  try {
    const { result: locks } = await Lock.find({ foreignId: bookComponentId })

    if (locks.length > 1) {
      logger.error(
        `multiple locks found for the book component with id ${bookComponentId}`,
      )

      await Lock.deleteByIds(map(locks, lock => lock.id))

      throw new Error(
        `corrupted lock for the book component with id ${bookComponentId}, all locks deleted`,
      )
    }

    if (locks.length === 1) {
      if (locks[0].userId !== userId) {
        const errorMsg = `There is a lock already for this book component for the user with id ${locks[0].userId}`
        logger.error(errorMsg)
      }

      logger.info(
        `lock exists for book component with id ${bookComponentId} for the user with id ${userId}`,
      )

      return locks[0]
    }

    logger.info(
      `no existing lock found for book component with id ${bookComponentId}`,
    )

    const lock = await Lock.insert({
      foreignId: bookComponentId,
      foreignType: 'bookComponent',
      userAgent,
      tabId,
      userId,
    })

    const status = STATUSES.FINE

    await BookComponentState.query()
      .patch({ status })
      .where({ bookComponentId })

    logger.info(
      `lock acquired for book component with id ${bookComponentId} for the user with id ${userId}`,
    )

    return lock
  } catch (e) {
    logger.error(e)
    throw new Error(e)
  }
}

const updateWorkflowState = async (bookComponentId, workflowStages, ctx) => {
  try {
    const applicationParameters = await ApplicationParameter.findOne({
      context: 'bookBuilder',
      area: 'lockTrackChangesWhenReviewing',
    })

    if (!applicationParameters) {
      throw new Error(`application parameters do not exist`)
    }

    const { config: lockTrackChanges } = applicationParameters

    logger.info(
      `searching of book component state for the book component with id ${bookComponentId}`,
    )

    const bookComponentState = await BookComponentState.findOne({
      bookComponentId,
    })

    if (!bookComponentState) {
      throw new Error(
        `book component state does not exists for the book component with id ${bookComponentId}`,
      )
    }

    logger.info(`found book component state with id ${bookComponentState.id}`)

    const update = {}

    let isReviewing = false

    if (lockTrackChanges) {
      isReviewing = find(workflowStages, { type: 'review' }).value === 0

      if (isReviewing) {
        update.trackChangesEnabled = true
        update.workflowStages = workflowStages
      } else {
        update.workflowStages = workflowStages
      }
    }

    const { result: locks } = await Lock.find({
      foreignId: bookComponentId,
      foreignType: 'bookComponent',
    })

    // case book component is locked but permissions changed for that user
    if (locks.length > 0) {
      const currentBookComponent = await BookComponent.findById(bookComponentId)
      currentBookComponent.workflowStages = update.workflowStages

      ctx.helpers
        .can(locks[0].userId, 'can view fragmentEdit', currentBookComponent)
        .then(param => true)
        .catch(async e => {
          // this means that the user no longer has edit permission
          await Lock.query().delete().where({
            foreignId: bookComponentId,
            foreignType: 'bookComponent',
          })
          return BookComponentState.query()
            .patch({ status: STATUSES.UNLOCKED_DUE_PERMISSIONS })
            .where({ bookComponentId })
        })
    }

    const updatedBookComponentState =
      await BookComponentState.patchAndFetchById(bookComponentState.id, {
        ...update,
      })

    logger.info(`book component state with id ${bookComponentState.id} updated`)

    return updatedBookComponentState
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const deleteBookComponent = async bookComponent => {
  try {
    const { id, componentType, divisionId } = bookComponent

    if (componentType === 'toc') {
      throw new Error(
        'you cannot delete a component with type Table of Contents',
      )
    }

    return useTransaction(async tr => {
      const deletedBookComponent = await BookComponent.patchAndFetchById(
        id,
        {
          deleted: true,
        },
        { trx: tr },
      )

      await BookComponentState.query(tr)
        .patch({
          deleted: true,
        })
        .where('bookComponentId', id)

      await BookComponentTranslation.query(tr)
        .patch({
          deleted: true,
        })
        .where('bookComponentId', id)

      const affected = await Lock.query(tr).delete().where({
        foreignId: id,
        foreignType: 'bookComponent',
      })

      logger.info(`deleted ${affected} lock/s for book component with id ${id}`)

      logger.info(`book component with id ${deletedBookComponent.id} deleted`)

      const componentDivision = await Division.findById(divisionId, { trx: tr })

      if (!componentDivision) {
        throw new Error(
          `division does not exists for the book component with id ${id}`,
        )
      }

      const clonedBookComponents = clone(componentDivision.bookComponents)

      pullAll(clonedBookComponents, [id])

      const updatedDivision = await Division.patchAndFetchById(
        componentDivision.id,
        {
          bookComponents: clonedBookComponents,
        },
        { trx: tr },
      )

      logger.info(
        `division's book component array before [${componentDivision.bookComponents}]`,
      )
      logger.info(
        `division's book component array after cleaned [${updatedDivision.bookComponents}]`,
      )

      return deletedBookComponent
    })
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const renameBookComponent = async (bookComponentId, title, languageIso) => {
  try {
    const bookComponentTranslation = await BookComponentTranslation.findOne({
      bookComponentId,
      languageIso,
    })

    if (!bookComponentTranslation) {
      throw new Error(
        `translation entry does not exists for the book component with id ${bookComponentId}`,
      )
    }

    const previousTitle = bookComponentTranslation.title

    const updatedTranslation = await BookComponentTranslation.patchAndFetchById(
      bookComponentTranslation.id,
      { title },
    )

    logger.info(
      `the title of the book component with id ${bookComponentId} changed`,
    )

    const bookComponentState = await BookComponentState.findOne({
      bookComponentId,
    })

    if (!bookComponentState) {
      throw new Error(
        `book component state does not exists for the book component with id ${bookComponentId}, thus running headers will not be able to update with the new title`,
      )
    }

    const {
      runningHeadersRight: previousRunningHeadersRight,
      runningHeadersLeft: previousRunningHeadersLeft,
    } = bookComponentState

    await BookComponentState.patchAndFetchById(bookComponentState.id, {
      runningHeadersRight:
        previousRunningHeadersRight === previousTitle
          ? title
          : previousRunningHeadersRight,
      runningHeadersLeft:
        previousRunningHeadersLeft === previousTitle
          ? title
          : previousRunningHeadersLeft,
    })

    logger.info(
      `running headers updated for the book component with id ${bookComponentId}`,
    )

    return updatedTranslation
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

module.exports = {
  getBookComponent,
  getBookComponentAndAcquireLock,
  updateBookComponent,
  setStatus,
  addBookComponent,
  updateContent,
  toggleIncludeInTOC,
  updateComponentType,
  updateUploading,
  updateTrackChanges,
  updatePagination,
  unlockBookComponent,
  lockBookComponent,
  updateWorkflowState,
  deleteBookComponent,
  renameBookComponent,
  updateBookComponentParentId,
}
