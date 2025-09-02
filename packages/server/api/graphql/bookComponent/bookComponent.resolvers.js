const { logger, subscriptionManager, withFilter } = require('@coko/server')
const fs = require('fs-extra')
const crypto = require('crypto')
const path = require('path')
const BPromise = require('bluebird')

const findIndex = require('lodash/findIndex')
const find = require('lodash/find')
const groupBy = require('lodash/groupBy')
const pullAll = require('lodash/pullAll')

const { getObjectTeam } = require('../../../controllers/team.controller')
const DocTreeManager = require('../../../models/docTreeManager/docTreeManager.model')
const { models } = require('../../../models/dataloader')

const { writeLocallyFromReadStream } = require('../../../utilities/filesystem')
const { replaceImageSource } = require('../../../utilities/image')
const DOCXFilenameParser = require('../../../controllers/helpers/DOCXFilenameParser')

const {
  BookComponentState,
  BookComponentTranslation,
  Division,
  BookTranslation,
  Lock,
  User,
} = require('../../../models').models

const {
  BOOK_COMPONENT_ADDED,
  BOOK_COMPONENT_DELETED,
  BOOK_COMPONENT_PAGINATION_UPDATED,
  BOOK_COMPONENT_WORKFLOW_UPDATED,
  BOOK_COMPONENT_TRACK_CHANGES_UPDATED,
  BOOK_COMPONENT_TITLE_UPDATED,
  BOOK_COMPONENT_CONTENT_UPDATED,
  BOOK_COMPONENT_UPLOADING_UPDATED,
  BOOK_COMPONENT_LOCK_UPDATED,
  BOOK_COMPONENTS_LOCK_UPDATED,
  BOOK_COMPONENT_TYPE_UPDATED,
  BOOK_COMPONENT_TOC_UPDATED,
  BOOK_COMPONENT_UPDATED,
  YJS_CONTENT_UPDATED,
} = require('./constants')

const { BOOK_UPDATED } = require('../book/constants')

const {
  pandocHandler,
} = require('../../../controllers/microServices.controller')

const {
  getBookComponent,
  // getBookComponentAndAcquireLock,
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
  setStatus,
  updateBookComponentParentId,
} = require('../../../controllers/bookComponent.controller')

const { getContentFiles } = require('../../../controllers/file.controller')

const { getBook } = require('../../../controllers/book.controller')
const { isAdmin } = require('../../../controllers/user.controller')

const getBookComponentHandler = async (_, { id }, ctx) => {
  const bookComponent = await getBookComponent(id)

  if (!bookComponent) {
    throw new Error(`Book Component with id: ${id} does not exist`)
  }

  return bookComponent
}

// const getBookComponentAndAcquireLock = async (_, { id, tabId }, ctx) => {
//   try {
//

//     const bookComponent = await useCaseGetBookComponentAndAcquireLock(
//       id,
//       ctx.userId,
//       tabId,
//     )

//     subscriptionManager.publish(BOOK_COMPONENT_LOCK_UPDATED, {
//       bookComponentLockUpdated: bookComponent.id,
//     })

//     return bookComponent
//   } catch (e) {
//     logger.error(e.message)
//     throw new Error(e)
//   }
// }

const ingestWordFileHandler = async (_, { bookComponentFiles }, ctx) => {
  try {
    const bookComponents = []
    let bookIdToFetch
    await BPromise.mapSeries(bookComponentFiles, async bookComponentFile => {
      const {
        file,
        bookComponentId,
        bookId,
        componentType: forceComponentType,
        divisionLabel: forceDivisionLabel,
      } = await bookComponentFile

      bookIdToFetch = bookId

      const { createReadStream, filename } = await file
      const title = filename.split('.')[0]
      const readerStream = createReadStream()

      const tempFilePath = path.join(`${process.cwd()}`, 'uploads', 'temp')
      const randomFilename = `${crypto.randomBytes(32).toString('hex')}.docx`
      await fs.ensureDir(tempFilePath)

      await writeLocallyFromReadStream(
        tempFilePath,
        randomFilename,
        readerStream,
        'utf-8',
      )
      let componentId = bookComponentId

      if (!bookComponentId) {
        let componentType = forceComponentType
        let divisionLabel = forceDivisionLabel

        if (!componentType && !divisionLabel) {
          const name = filename.replace(/\.[^/.]+$/, '')

          const {
            componentType: aggregatedComponentType,
            label: aggregatedDivisionLabel,
          } = DOCXFilenameParser(name)

          componentType = aggregatedComponentType
          divisionLabel = aggregatedDivisionLabel
        }

        const division = await Division.findOne({
          bookId,
          label: divisionLabel,
        })

        if (!division) {
          throw new Error(
            `division with label ${divisionLabel} does not exist for the book with id ${bookId}`,
          )
        }

        const newBookComponent = await DocTreeManager.createNewDocumentResource(
          {
            userId: ctx.userId,
            bookComponent: {
              bookId,
              componentType: 'chapter',
              divisionId: division.id,
            },
          },
        )

        subscriptionManager.publish(BOOK_COMPONENT_ADDED, {
          bookComponentAdded: newBookComponent.bookComponentId,
        })

        componentId = newBookComponent.bookComponentId
      }

      const uploading = true

      const currentComponentState = await BookComponentState.findOne({
        bookComponentId: componentId,
      })

      if (!currentComponentState) {
        throw new Error(
          `component state for the book component with id ${componentId} does not exist`,
        )
      }

      await updateUploading(componentId, uploading)

      await renameBookComponent(componentId, title, 'en')

      const updatedBookComponent = await getBookComponent(componentId)
      bookComponents.push(updatedBookComponent)
      subscriptionManager.publish(BOOK_COMPONENT_UPLOADING_UPDATED, {
        bookComponentUploadingUpdated: updatedBookComponent.id,
      })
      subscriptionManager.publish(BOOK_COMPONENT_UPDATED, {
        bookComponentUpdated: updatedBookComponent.id,
      })

      return pandocHandler(componentId, `${tempFilePath}/${randomFilename}`)
    })

    subscriptionManager.publish(BOOK_UPDATED, {
      bookUpdated: bookIdToFetch,
    })
    return bookComponents
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const addBookComponentHandler = async (_, { input }, ctx, info) => {
  try {
    const { divisionId, bookId, componentType } = input

    const newBookComponent = await addBookComponent(
      divisionId,
      bookId,
      componentType,
      null,
      ctx.userId,
    )

    subscriptionManager.publish(BOOK_COMPONENT_ADDED, {
      bookComponentAdded: newBookComponent.id,
    })

    subscriptionManager.publish(BOOK_UPDATED, {
      bookUpdated: newBookComponent.bookId,
    })

    return newBookComponent
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const podAddBookComponentHandler = async (_, { input }, ctx, info) => {
  try {
    const { divisionId, bookId, componentType, afterId } = input

    const newBookComponent = await addBookComponent(
      divisionId,
      bookId,
      componentType,
      afterId,
      ctx.userId,
    )

    subscriptionManager.publish(BOOK_COMPONENT_ADDED, {
      bookComponentAdded: newBookComponent.id,
    })

    subscriptionManager.publish(BOOK_UPDATED, {
      bookUpdated: bookId,
    })

    return newBookComponent
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const renameBookComponentHandler = async (_, { input }, ctx) => {
  try {
    const { id, title } = input

    await renameBookComponent(id, title, 'en')

    const updatedBookComponent = await getBookComponent(id)

    subscriptionManager.publish(BOOK_COMPONENT_TITLE_UPDATED, {
      bookComponentTitleUpdated: updatedBookComponent.id,
    })
    subscriptionManager.publish(BOOK_COMPONENT_UPDATED, {
      bookComponentUpdated: updatedBookComponent.id,
    })
    subscriptionManager.publish(BOOK_UPDATED, {
      bookUpdated: updatedBookComponent.bookId,
    })

    logger.info('message BOOK_COMPONENT_TITLE_UPDATED broadcasted')

    return updatedBookComponent
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

// used in ketty
const renameBookComponentTitleHandler = async (_, { id, title }, ctx) => {
  try {
    await renameBookComponent(id, title, 'en')

    const updatedBookComponent = await getBookComponent(id)

    subscriptionManager.publish(BOOK_COMPONENT_TITLE_UPDATED, {
      bookComponentTitleUpdated: updatedBookComponent.id,
    })
    subscriptionManager.publish(BOOK_COMPONENT_UPDATED, {
      bookComponentUpdated: updatedBookComponent.id,
    })
    subscriptionManager.publish(BOOK_UPDATED, {
      bookUpdated: updatedBookComponent.bookId,
    })

    logger.info('message BOOK_COMPONENT_TITLE_UPDATED broadcasted')

    return updatedBookComponent
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const deleteBookComponentHandler = async (_, { input }, ctx) => {
  try {
    const { id } = input

    const bookComponent = await getBookComponent(id)

    if (!bookComponent) {
      throw new Error(`book component with id ${id} does not exists`)
    }

    const deletedBookComponent = await deleteBookComponent(bookComponent)

    subscriptionManager.publish(BOOK_COMPONENT_DELETED, {
      bookComponentDeleted: deletedBookComponent.id,
    })
    subscriptionManager.publish(BOOK_COMPONENT_UPDATED, {
      bookComponentUpdated: deletedBookComponent.id,
    })
    subscriptionManager.publish(BOOK_UPDATED, {
      bookUpdated: bookComponent.bookId,
    })

    logger.info('message BOOK_COMPONENT_DELETED broadcasted')

    return deletedBookComponent
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const podDeleteBookComponentHandler = async (_, { input }, ctx) => {
  try {
    const { id } = input

    const bookComponent = await getBookComponent(id)

    if (!bookComponent) {
      throw new Error(`book component with id ${id} does not exists`)
    }

    const deletedBookComponent = await deleteBookComponent(bookComponent)

    subscriptionManager.publish(BOOK_COMPONENT_DELETED, {
      bookComponentDeleted: deletedBookComponent.id,
    })
    subscriptionManager.publish(BOOK_COMPONENT_UPDATED, {
      bookComponentUpdated: deletedBookComponent.id,
    })

    subscriptionManager.publish(BOOK_UPDATED, {
      bookUpdated: bookComponent.bookId,
    })
    logger.info('message BOOK_COMPONENT_DELETED broadcasted')

    return getBook(bookComponent.bookId)
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const updateWorkflowStateHandler = async (_, { input }, ctx) => {
  try {
    const { id, workflowStages } = input

    const bookComponentState = await BookComponentState.findOne({
      bookComponentId: id,
    })

    if (!bookComponentState) {
      throw new Error(
        `book component state does not exists for the book component with id ${id}`,
      )
    }

    await updateWorkflowState(id, workflowStages, ctx)

    const isReviewing = find(workflowStages, { type: 'review' }).value === 0
    const updatedBookComponent = await getBookComponent(id)

    subscriptionManager.publish(BOOK_COMPONENT_WORKFLOW_UPDATED, {
      bookComponentWorkflowUpdated: updatedBookComponent.id,
    })

    if (isReviewing) {
      subscriptionManager.publish(BOOK_COMPONENT_TRACK_CHANGES_UPDATED, {
        bookComponentTrackChangesUpdated: updatedBookComponent.id,
      })
    }

    subscriptionManager.publish(BOOK_COMPONENT_UPDATED, {
      bookComponentUpdated: updatedBookComponent.id,
    })

    return updatedBookComponent
  } catch (e) {
    logger.error(e)
    throw new Error(e)
  }
}

const unlockBookComponentHandler = async (_, { input }, ctx) => {
  try {
    const { id: bookComponentId } = input

    await unlockBookComponent(bookComponentId, ctx.userId)

    const updatedBookComponent = await getBookComponent(bookComponentId)

    // This should be replaced with book component updated, when refactor Book Builder
    subscriptionManager.publish(BOOK_COMPONENT_LOCK_UPDATED, {
      bookComponentLockUpdated: updatedBookComponent.id,
    })
    subscriptionManager.publish(BOOK_COMPONENT_UPDATED, {
      bookComponentUpdated: updatedBookComponent.id,
    })
    subscriptionManager.publish(BOOK_UPDATED, {
      bookUpdated: updatedBookComponent.bookId,
    })

    return updatedBookComponent
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const lockBookComponentHandler = async (_, { id, tabId, userAgent }, ctx) => {
  try {
    await lockBookComponent(id, tabId, userAgent, ctx.userId)

    const bookComponent = await getBookComponent(id)

    // This should be replaced with book component updated, when refactor Book Builder

    subscriptionManager.publish(BOOK_COMPONENT_LOCK_UPDATED, {
      bookComponentLockUpdated: bookComponent.id,
    })

    subscriptionManager.publish(BOOK_COMPONENT_UPDATED, {
      bookComponentUpdated: bookComponent.id,
    })
    subscriptionManager.publish(BOOK_UPDATED, {
      bookUpdated: bookComponent.bookId,
    })
    return bookComponent
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const podLockBookComponentHandler = async (
  _,
  { id, tabId, userAgent },
  ctx,
) => {
  try {
    await lockBookComponent(id, tabId, userAgent, ctx.userId)

    const bookComponent = await getBookComponent(id)

    subscriptionManager.publish(BOOK_UPDATED, {
      bookUpdated: bookComponent.bookId,
    })
    return getBook(bookComponent.bookId)
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const updateContentHandler = async (_, { input }, ctx) => {
  try {
    const { id, content } = input

    const { shouldNotifyWorkflowChange } = await updateContent(
      id,
      content,
      'en',
    )

    const updatedBookComponent = await getBookComponent(id)

    subscriptionManager.publish(BOOK_COMPONENT_CONTENT_UPDATED, {
      bookComponentContentUpdated: updatedBookComponent.id,
    })

    logger.info('message BOOK_COMPONENT_CONTENT_UPDATED broadcasted')

    if (shouldNotifyWorkflowChange) {
      subscriptionManager.publish(BOOK_COMPONENT_WORKFLOW_UPDATED, {
        bookComponentWorkflowUpdated: updatedBookComponent.id,
      })
      logger.info('message BOOK_COMPONENT_WORKFLOW_UPDATED broadcasted')
    }

    subscriptionManager.publish(BOOK_COMPONENT_UPDATED, {
      bookComponentUpdated: updatedBookComponent.id,
    })

    subscriptionManager.publish(BOOK_UPDATED, {
      bookUpdated: updatedBookComponent.bookId,
    })

    return updatedBookComponent
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const updatePaginationHandler = async (_, { input }, ctx) => {
  try {
    const { id, pagination } = input

    const currentBookComponent = await getBookComponent(id)

    if (!currentBookComponent) {
      throw new Error(`book component with id ${id} does not exists`)
    }

    const updatedBookComponent = await updatePagination(id, pagination)

    subscriptionManager.publish(BOOK_COMPONENT_PAGINATION_UPDATED, {
      bookComponentPaginationUpdated: updatedBookComponent.id,
    })

    subscriptionManager.publish(BOOK_COMPONENT_UPDATED, {
      bookComponentUpdated: updatedBookComponent.id,
    })

    return updatedBookComponent
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const updateTrackChangesHandler = async (_, { input }, ctx) => {
  try {
    const { id, trackChangesEnabled } = input

    const currentState = await BookComponentState.findOne({
      bookComponentId: id,
    })

    if (!currentState) {
      throw new Error(
        `no state info exists for the book component with id ${id}`,
      )
    }

    await updateTrackChanges(id, trackChangesEnabled)

    const updatedBookComponent = await getBookComponent(id)

    subscriptionManager.publish(BOOK_COMPONENT_TRACK_CHANGES_UPDATED, {
      bookComponentTrackChangesUpdated: updatedBookComponent.id,
    })

    subscriptionManager.publish(BOOK_COMPONENT_UPDATED, {
      bookComponentUpdated: updatedBookComponent.id,
    })

    return updatedBookComponent
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const updateUploadingHandler = async (_, { input }, ctx) => {
  try {
    const { id, uploading } = input

    const currentState = await BookComponentState.findOne({
      bookComponentId: id,
    })

    if (!currentState) {
      throw new Error(
        `no state info exists for the book component with id ${id}`,
      )
    }

    await updateUploading(id, uploading)

    const updatedBookComponent = await getBookComponent(id)

    subscriptionManager.publish(BOOK_COMPONENT_UPLOADING_UPDATED, {
      bookComponentUploadingUpdated: updatedBookComponent.id,
    })

    subscriptionManager.publish(BOOK_COMPONENT_UPDATED, {
      bookComponentUpdated: updatedBookComponent.id,
    })

    return updatedBookComponent
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const updateComponentTypeHandler = async (_, { input }, ctx) => {
  try {
    const { id, componentType } = input

    const updatedBookComponent = await updateComponentType(id, componentType)

    subscriptionManager.publish(BOOK_COMPONENT_TYPE_UPDATED, {
      bookComponentTypeUpdated: updatedBookComponent.id,
    })
    subscriptionManager.publish(BOOK_COMPONENT_UPDATED, {
      bookComponentUpdated: updatedBookComponent.id,
    })

    return updatedBookComponent
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const updateBookComponentParentIdHandler = async (_, { input }, ctx) => {
  try {
    const { id, parentComponentId } = input

    const updatedBookComponent = await updateBookComponentParentId(
      id,
      parentComponentId,
    )

    subscriptionManager.publish(BOOK_COMPONENT_UPDATED, {
      bookComponentUpdated: updatedBookComponent.id,
    })

    return updatedBookComponent
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const toggleIncludeInTOCHandler = async (_, { input }, ctx) => {
  try {
    const { id } = input

    await toggleIncludeInTOC(id)

    const updatedBookComponent = await getBookComponent(id)

    subscriptionManager.publish(BOOK_COMPONENT_TOC_UPDATED, {
      bookComponentTOCToggled: updatedBookComponent.id,
    })
    subscriptionManager.publish(BOOK_COMPONENT_UPDATED, {
      bookComponentUpdated: updatedBookComponent.id,
    })

    return updatedBookComponent
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

const setBookComponentStatusHandler = async (_, { id, status }, ctx) => {
  try {
    // const { id, status } = input

    await setStatus(id, status)
    const updatedBookComponent = await getBookComponent(id)

    subscriptionManager.publish(BOOK_UPDATED, {
      bookUpdated: updatedBookComponent.bookId,
    })
    subscriptionManager.publish(BOOK_COMPONENT_UPDATED, {
      bookComponentUpdated: updatedBookComponent.id,
    })

    return updatedBookComponent
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

module.exports = {
  Query: {
    getBookComponent: getBookComponentHandler,
    // getBookComponentAndAcquireLock,
  },
  Mutation: {
    ingestWordFile: ingestWordFileHandler,
    addBookComponent: addBookComponentHandler,
    podAddBookComponent: podAddBookComponentHandler,
    renameBookComponent: renameBookComponentHandler,
    renameBookComponentTitle: renameBookComponentTitleHandler,
    deleteBookComponent: deleteBookComponentHandler,
    podDeleteBookComponent: podDeleteBookComponentHandler,
    updateWorkflowState: updateWorkflowStateHandler,
    updatePagination: updatePaginationHandler,
    unlockBookComponent: unlockBookComponentHandler,
    lockBookComponent: lockBookComponentHandler,
    podLockBookComponent: podLockBookComponentHandler,
    updateContent: updateContentHandler,
    updateUploading: updateUploadingHandler,
    updateTrackChanges: updateTrackChangesHandler,
    updateComponentType: updateComponentTypeHandler,
    updateBookComponentParentId: updateBookComponentParentIdHandler,
    toggleIncludeInTOC: toggleIncludeInTOCHandler,
    setBookComponentStatus: setBookComponentStatusHandler,
  },
  BookComponent: {
    async title(bookComponent, _, ctx) {
      let { title } = bookComponent

      if (!title) {
        const bookComponentTranslation = await BookComponentTranslation.findOne(
          { bookComponentId: bookComponent.id, languageIso: 'en' },
        )

        title = bookComponentTranslation.title
      }

      return title
    },
    async bookId(bookComponent, _, ctx) {
      return bookComponent.bookId
    },
    async status(bookComponent, _, ctx) {
      const bookComponentState = await BookComponentState.findOne({
        bookComponentId: bookComponent.id,
      })

      return bookComponentState.status
    },
    async teams(bookComponent, _, ctx) {
      const collabTeam = await getObjectTeam(
        'collaborator',
        bookComponent.id,
        false,
      )

      const ownerTeam = await getObjectTeam('owner', bookComponent.id, false)

      return [collabTeam, ownerTeam]
    },
    async bookTitle(bookComponent, _, ctx) {
      const book = await getBook(bookComponent.bookId)

      const bookTranslation = await BookTranslation.findOne({
        bookId: book.id,
        languageIso: 'en',
      })

      return bookTranslation.title
    },
    async runningHeadersRight(bookComponent, _, ctx) {
      const bookComponentState = await bookComponent.getBookComponentState()
      return bookComponentState.runningHeadersRight
    },
    async runningHeadersLeft(bookComponent, _, ctx) {
      const bookComponentState = await bookComponent.getBookComponentState()
      return bookComponentState.runningHeadersLeft
    },
    async divisionType(bookComponent, _, ctx) {
      const division = await Division.findById(bookComponent.divisionId)
      return division.label
    },
    async divisionId(bookComponent, _, ctx) {
      return bookComponent.divisionId
    },
    async yState(bookComponent, _, ctx) {
      const bookComponentTranslation = await BookComponentTranslation.findOne({
        bookComponentId: bookComponent.id,
        languageIso: 'en',
      })

      if (bookComponentTranslation.yState) {
        return bookComponentTranslation.yState.toString()
      }

      return null
    },
    async content(bookComponent, _, ctx) {
      const bookComponentTranslation = await BookComponentTranslation.findOne({
        bookComponentId: bookComponent.id,
        languageIso: 'en',
      })

      const content = bookComponentTranslation.content || ''
      const hasContent = content.trim().length > 0

      // const ydoc = utils.docs.get(bookComponentTranslation.bookComponentId)

      // if (ydoc) {
      //   const content1 = ydoc.getXmlFragment('prosemirror').toString()
      //   console.log(content1)
      // }

      if (hasContent) {
        return replaceImageSource(
          bookComponentTranslation.content,
          getContentFiles,
        )
      }

      return bookComponentTranslation.content
    },
    async trackChangesEnabled(bookComponent, _, ctx) {
      const bookComponentState = await BookComponentState.findOne({
        bookComponentId: bookComponent.id,
      })

      return bookComponentState.trackChangesEnabled
    },
    async hasContent(bookComponent, _, ctx) {
      const bookComponentTranslation = await BookComponentTranslation.findOne({
        bookComponentId: bookComponent.id,
        languageIso: 'en',
      })

      const content = bookComponentTranslation.content || ''
      const hasContent = content.trim().length > 0
      return hasContent
    },
    async lock(bookComponent, _, ctx) {
      let locked = null

      const lock = await Lock.findOne({ foreignId: bookComponent.id })

      if (lock) {
        const user = await User.findById(lock.userId)
        const adminUser = await isAdmin(user.id)

        locked = {
          created: lock.created,
          tabId: lock.tabId,
          username: user.username,
          givenNames: user.givenNames,
          surname: user.surname,
          isAdmin: adminUser,
          userId: lock.userId,
          foreignId: bookComponent.id,
          id: lock.id,
        }
      }

      return locked
    },
    async componentTypeOrder(bookComponent, _, ctx) {
      const DivisionLoader = models.find(
        md => md.modelName === 'DivisionLoader',
      )

      const { componentType } = bookComponent

      const sortedPerDivision = await DivisionLoader.model.bookComponents.load(
        bookComponent.divisionId,
      )

      const groupedByType = groupBy(
        pullAll(sortedPerDivision, [undefined]),
        'componentType',
      )

      return (
        findIndex(
          groupedByType[componentType],
          item => item.id === bookComponent.id,
        ) + 1
      )
    },
    async uploading(bookComponent, _, ctx) {
      const BookComponentStateLoader = models.find(
        md => md.modelName === 'BookComponentStateLoader',
      )

      await BookComponentStateLoader.model.state.clear()

      const bookComponentState =
        await BookComponentStateLoader.model.state.load(bookComponent.id)

      return bookComponentState.uploading
    },
    async pagination(bookComponent, _, ctx) {
      return bookComponent.pagination
    },
    async workflowStages(bookComponent, _, ctx) {
      const BookComponentStateLoader = models.find(
        md => md.modelName === 'BookComponentStateLoader',
      )

      await BookComponentStateLoader.model.state.clear()

      const bookComponentState =
        await BookComponentStateLoader.model.state.load(bookComponent.id)

      return bookComponentState.workflowStages || null
    },

    async includeInToc(bookComponent, _, ctx) {
      const state = await bookComponent.getBookComponentState()
      return state.includeInToc
    },
    async bookStructureElements(bookComponent, _, ctx) {
      const book = await getBook(bookComponent.bookId)

      const hasThreeLevels = book.bookStructure.levels.length > 2

      const bookStructureElements = [
        {
          groupHeader: 'Openers',
          items: [
            {
              displayName: 'Introduction',
              className: 'introduction',
              headingLevel: 2,
              nestedHeadingLevel: hasThreeLevels ? 3 : undefined,
              isSection: false,
            },
            {
              displayName: 'Outline',
              className: 'outline',
              headingLevel: 2,
              nestedHeadingLevel: hasThreeLevels ? 3 : undefined,
              isSection: false,
            },
            {
              displayName: 'Learning Objectives',
              className: 'learning-objectives',
              headingLevel: 2,
              nestedHeadingLevel: hasThreeLevels ? 3 : undefined,
              isSection: false,
            },
            {
              displayName: 'Focus Questions',
              className: 'focus-questions',
              headingLevel: 2,
              nestedHeadingLevel: hasThreeLevels ? 3 : undefined,
              isSection: false,
            },
            {
              displayName: 'Content Opener Image',
              className: 'content-opener-image',
              headingLevel: 2,
              nestedHeadingLevel: hasThreeLevels ? 3 : undefined,
              isSection: false,
            },
          ],
        },
        {
          groupHeader: 'Openers and Closers',
          items: [
            {
              displayName: 'Key Terms List',
              className: 'key-terms',
              headingLevel: 2,
              nestedHeadingLevel: hasThreeLevels ? 3 : undefined,
              isSection: false,
            },
            {
              displayName: 'Self-reflection Activities',
              className: 'self-reflection-activities',
              headingLevel: 2,
              nestedHeadingLevel: hasThreeLevels ? 3 : undefined,
              isSection: false,
            },
          ],
        },
        {
          groupHeader: 'Closers',
          items: [
            {
              displayName: 'Review Activity',
              className: 'review-activity',
              headingLevel: 2,
              nestedHeadingLevel: hasThreeLevels ? 3 : undefined,
              isSection: false,
            },
            {
              displayName: 'Summary',
              className: 'summary',
              headingLevel: 2,
              nestedHeadingLevel: hasThreeLevels ? 3 : undefined,
              isSection: false,
            },
            {
              displayName: 'References',
              className: 'references',
              headingLevel: 2,
              nestedHeadingLevel: hasThreeLevels ? 3 : undefined,
              isSection: false,
            },
            {
              displayName: 'Bibliography',
              className: 'bibliography',
              headingLevel: 2,
              nestedHeadingLevel: hasThreeLevels ? 3 : undefined,
              isSection: false,
            },
            {
              displayName: 'Further Reading',
              className: 'further-reading',
              headingLevel: 2,
              nestedHeadingLevel: hasThreeLevels ? 3 : undefined,
              isSection: false,
            },
          ],
        },
      ]

      if (bookComponent.componentType === 'chapter') {
        bookStructureElements.unshift({
          groupHeader: 'Core Elements',
          items: [
            {
              displayName: 'Section',
              className: 'section',
              headingLevel: 2,
              nestedHeadingLevel: 3,
              isSection: true,
            },
          ],
        })
      }

      return bookStructureElements
    },
  },
  Subscription: {
    bookComponentAdded: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(BOOK_COMPONENT_ADDED)
      },
    },
    bookComponentDeleted: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(BOOK_COMPONENT_DELETED)
      },
    },
    bookComponentPaginationUpdated: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(
          BOOK_COMPONENT_PAGINATION_UPDATED,
        )
      },
    },
    bookComponentWorkflowUpdated: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(
          BOOK_COMPONENT_WORKFLOW_UPDATED,
        )
      },
    },
    bookComponentTrackChangesUpdated: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(
          BOOK_COMPONENT_TRACK_CHANGES_UPDATED,
        )
      },
    },
    bookComponentTitleUpdated: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(BOOK_COMPONENT_TITLE_UPDATED)
      },
    },
    bookComponentContentUpdated: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(BOOK_COMPONENT_CONTENT_UPDATED)
      },
    },
    bookComponentUploadingUpdated: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(
          BOOK_COMPONENT_UPLOADING_UPDATED,
        )
      },
    },
    bookComponentLockUpdated: {
      subscribe: async (payload, variables, context, info) => {
        return subscriptionManager.asyncIterator(BOOK_COMPONENT_LOCK_UPDATED)
      },
    },
    bookComponentsLockUpdated: {
      subscribe: async (payload, variables, context, info) => {
        return subscriptionManager.asyncIterator(BOOK_COMPONENTS_LOCK_UPDATED)
      },
    },
    bookComponentTypeUpdated: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(BOOK_COMPONENT_TYPE_UPDATED)
      },
    },
    bookComponentTOCToggled: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(BOOK_COMPONENT_TOC_UPDATED)
      },
    },
    bookComponentUpdated: {
      subscribe: async (...args) => {
        return withFilter(
          () => {
            return subscriptionManager.asyncIterator(BOOK_COMPONENT_UPDATED)
          },
          (payload, variables) => {
            const { id: clientBCId } = variables
            const { bookComponentUpdated: updatedBookComponentId } = payload

            return clientBCId === updatedBookComponentId
          },
        )(...args)
      },
    },
    yjsContentUpdated: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(YJS_CONTENT_UPDATED)
      },
    },
  },
}
