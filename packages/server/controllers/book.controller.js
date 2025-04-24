const {
  useTransaction,
  logger,
  pubsubManager,
  fileStorage,
} = require('@coko/server')

const map = require('lodash/map')
const indexOf = require('lodash/indexOf')
const findIndex = require('lodash/findIndex')
const find = require('lodash/find')
const assign = require('lodash/assign')
const omitBy = require('lodash/omitBy')
const isNil = require('lodash/isNil')
const config = require('config')
const BPromise = require('bluebird')
const fs = require('fs-extra')
const path = require('path')

const {
  getObjectTeams,
  updateTeamMembership,
} = require('@coko/server/src/models/team/team.controller')

const { getUser } = require('@coko/server/src/models/user/user.controller')

const { DocTreeManager } = require('@pubsweet/models')

const {
  createFile,
  deleteFiles,
  getContentFiles,
} = require('./file.controller')

const { getExportProfile } = require('./exportProfile.controller')
const { replaceImageSource } = require('../utilities/image')

const {
  hasMembershipInGlobalTeams,
} = require('../config/permissions/helpers/helpers')

const {
  labels: { BOOK_CONTROLLER },
} = require('./constants')

const exporter = require('./helpers/exporter')
const bookComponentCreator = require('./helpers/createBookComponent')
const bookComponentContentCreator = require('./helpers/bookComponentContentCreator')
const prepareTemplateFiles = require('./helpers/prepareWebTemplateFiles')

const { flaxHandler } = require('./microServices.controller')

const {
  Book,
  BookTranslation,
  BookComponentState,
  BookComponent,
  Division,
  BookComponentTranslation,
  TeamMember,
  ExportProfile,
  File,
} = require('../models').models

const {
  getApplicationParameters,
} = require('./applicationParameter.controller')

const { createDivision } = require('./division.controller')

const { createTeam, getObjectTeam, deleteTeam } = require('./team.controller')
const { updateExportProfile } = require('./exportProfile.controller')
const { createBookSettings } = require('./bookSettings.controller')
const BookSettings = require('../models/bookSettings/bookSettings.model')
const bookConstructor = require('./helpers/bookConstructor')
// const { generateCopyrightsContentForWeb } = require('./helpers/htmlGenerators')

// const { getSpecificTemplates } = require('./template.controller')

const toCamelCase = string =>
  string
    .split(/[^a-zA-Z0-9]/g)
    .map((x, index) => {
      if (index === 0) {
        return x.toLowerCase()
      }

      return x.substr(0, 1).toUpperCase() + x.substr(1).toLowerCase()
    })
    .join('')

const isbnSorter = (a, b) => {
  const labelA = a.label.toLowerCase()
  const labelB = b.label.toLowerCase()

  if (labelA < labelB) {
    return -1
  }

  if (labelA > labelB) {
    return 1
  }

  // names must be equal
  return 0
}

const equalArrays = (a, b) => {
  a.sort(isbnSorter)
  b.sort(isbnSorter)

  return JSON.stringify(a) === JSON.stringify(b)
}

const defaultLevelOneItem = {
  type: 'part',
  displayName: 'Part',
  contentStructure: [],
}

const defaultLevelTwoItem = {
  type: 'chapter',
  displayName: 'Chapter',
  contentStructure: [],
}

const defaultLevelThreeItem = {
  type: 'section',
  displayName: 'Section',
  contentStructure: [{ type: 'mainContent', displayName: 'Main Content' }],
}

const defaultLevelCloserItem = {
  type: 'chapterCloser',
  displayName: 'Chapter Closer',
  contentStructure: [],
}

const defaultBookStructure = {
  levels: [],
  outline: [],
  finalized: false,
}

const flaxBookPathPrefix = (context, bookId, userId) => {
  return context === 'publish'
    ? `/books/${bookId}`
    : `/preview/${userId}/${bookId}`
}

const getBook = async (id, options = {}) => {
  try {
    const { trx } = options
    logger.info(`${BOOK_CONTROLLER} getBook: fetching book with id ${id}`)

    const book = await useTransaction(
      async tr => Book.findOne({ id, deleted: false }, { trx: tr }),
      { trx, passedTrxOnly: true },
    )

    if (!book) {
      throw new Error(`book with id: ${id} does not exist`)
    }

    return book
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} getBook: ${e.message}`)
    throw new Error(e)
  }
}

const getBooks = async ({ collectionId, userId, options }) => {
  try {
    const allowToGetAllBooksGlobalTeams =
      config.has('filters.getBooks.all') && config.get('filters.getBooks.all')

    const { trx, page, pageSize, orderBy, showArchived } = options

    const isEligibleForAll =
      allowToGetAllBooksGlobalTeams &&
      (await hasMembershipInGlobalTeams(userId, allowToGetAllBooksGlobalTeams))

    logger.info(
      `${BOOK_CONTROLLER} getBooks: fetching books for user with id ${userId}`,
    )
    return useTransaction(
      async tr => {
        if (isEligibleForAll) {
          return Book.getAllBooks(
            {
              trx: tr,
              showArchived,
              page,
              pageSize,
              orderBy,
            },
            collectionId,
          )
        }

        return Book.getUserBooks(userId, {
          trx: tr,
          showArchived,
          page,
          pageSize,
          orderBy,
          collectionId,
        })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} getBooks: ${e.message}`)
    throw new Error(e)
  }
}

const createBook = async (data = {}) => {
  try {
    const { collectionId, title, options } = data

    const featurePODEnabled =
      config.has('featurePOD') &&
      ((config.get('featurePOD') && JSON.parse(config.get('featurePOD'))) ||
        false)

    let trx
    let addUserToBookTeams
    let userId

    if (options) {
      trx = options.trx
      addUserToBookTeams = options.addUserToBookTeams
      userId = options.userId
    }

    return useTransaction(
      async tr => {
        const newBookData = {}

        if (collectionId) {
          newBookData.collectionId = collectionId
        }

        // SECTION FOR BOOK STRUCTURE FEATURE
        if (
          config.has('featureBookStructure') &&
          ((config.get('featureBookStructure') &&
            JSON.parse(config.get('featureBookStructure'))) ||
            false)
        ) {
          logger.info(
            `${BOOK_CONTROLLER} createBook: creating default book structure for the new book`,
          )

          newBookData.bookStructure = defaultBookStructure
        }

        // END OF BOOK STRUCTURE FEATURE SECTION

        // SECTION FOR BOOK METADATA DEFAULT VALUES
        if (featurePODEnabled) {
          newBookData.podMetadata = {
            authors: '',
            bottomPage: '',
            copyrightLicense: '',
            isbns: [],
            licenseTypes: {
              NC: false,
              SA: false,
              ND: false,
            },
            ncCopyrightHolder: '',
            ncCopyrightYear: null,
            publicDomainType: '',
            saCopyrightHolder: '',
            saCopyrightYear: null,
            topPage: '',
          }
        }

        // END OF BOOK METADATA DEFAULT VALUES SECTION

        const newBook = await Book.insert(newBookData, { trx: tr })

        const { id: bookId } = newBook

        logger.info(
          `${BOOK_CONTROLLER} createBook: new book created with id ${bookId}`,
        )

        // SECTION FOR BOOK TRANSLATION
        if (title) {
          await BookTranslation.insert(
            {
              bookId,
              title,
              languageIso: 'en',
            },
            { trx: tr },
          )

          logger.info(
            `${BOOK_CONTROLLER} createBook: new book translation (title: ${title}) created for the book with id ${bookId}`,
          )
        } else {
          await BookTranslation.insert(
            {
              bookId,
              languageIso: 'en',
            },
            { trx: tr },
          )

          logger.info(
            `${BOOK_CONTROLLER} createBook: new book translation placeholder created for the book with id ${bookId}`,
          )
        }
        // END OF BOOK TRANSLATION SECTION

        // SECTION FOR BOOK SETTINGS
        await createBookSettings(
          {
            bookId,
          },
          { trx: tr },
        )
        // END OF BOOK SETTINGS SECTION

        // SECTION OF BOOK DIVISIONS CREATION
        const [{ config: divisions }] = await getApplicationParameters(
          'bookBuilder',
          'divisions',
          {
            trx: tr,
          },
        )

        let createdDivisions
        let createdDivisionIds
        let divisionData

        if (divisions.length === 0) {
          divisionData = {
            bookId,
            bookComponents: [],
            label: 'Body',
          }

          const bodyDivision = await createDivision(divisionData, {
            trx: tr,
          })

          createdDivisions = [bodyDivision]
          createdDivisionIds = [bodyDivision.id]
        } else {
          createdDivisions = await Promise.all(
            divisions.map(async division => {
              divisionData = {
                bookId,
                bookComponents: [],
                label: division.name,
              }
              return createDivision(divisionData, {
                trx: tr,
              })
            }),
          )

          createdDivisionIds = createdDivisions.map(d => d.id)
        }

        await Book.query(tr)
          .patch({ divisions: createdDivisionIds })
          .where({ id: bookId })

        logger.info(
          `${BOOK_CONTROLLER} createBook: book with id ${bookId} patched with the new divisions`,
        )
        // END OF BOOK DIVISIONS CREATION SECTION

        // SECTION FOR CREATING 1st CHAPTER AUTOMATICALLY
        if (featurePODEnabled) {
          const bodyDivision = createdDivisions.find(
            div => div.label === 'Body',
          )

          await DocTreeManager.createNewDocumentResource({
            userId,
            bookComponent: {
              bookId,
              componentType: 'chapter',
              divisionId: bodyDivision.id,
            },
            options: {
              trx: tr,
            },
          })
        }
        // END OF CREATING 1st CHAPTER AUTOMATICALLY SECTION

        // SECTION FOR BOOK TEAMS CREATION
        if (!config.has('teams.nonGlobal')) {
          logger.info(
            `${BOOK_CONTROLLER} createBook: You haven't declared any teams  in config`,
          )
        } else {
          logger.info(
            `${BOOK_CONTROLLER} createBook: creating teams for book with id ${bookId}`,
          )
          const configNonGlobalTeams = config.get('teams.nonGlobal')

          await Promise.all(
            Object.keys(configNonGlobalTeams).map(async k => {
              const teamData = configNonGlobalTeams[k]

              const exists = await getObjectTeam(teamData.role, bookId, false, {
                trx: tr,
              })

              if (exists) {
                logger.info(
                  `${BOOK_CONTROLLER} createBook: Team "${teamData.role}" already exists for book with id ${bookId}`,
                )
                return
              }

              const createdTeam = await createTeam(
                teamData.displayName,
                bookId,
                'book',
                teamData.role,
                false,
                {
                  trx: tr,
                },
              )

              logger.info(
                `${BOOK_CONTROLLER} createBook: Added team "${teamData.role}" for book with id ${bookId}`,
              )

              if (indexOf(addUserToBookTeams, createdTeam.role) !== -1) {
                if (!userId) {
                  throw new Error(
                    'userId should be provided if addUserToBookTeams is used',
                  )
                }

                logger.info(
                  `${BOOK_CONTROLLER} createBook: Adding book creator as member of team "${createdTeam.displayName}" for book with id ${bookId}`,
                )
                await updateTeamMembership(createdTeam.id, [userId], {
                  trx: tr,
                })
              }
            }),
          )
        }
        // END OF BOOK TEAMS CREATION SECTION

        // SECTION FOR BOOK SPECIAL COMPONENTS CREATION
        const workflowConfig = await getApplicationParameters(
          'bookBuilder',
          'stages',
          {
            trx: tr,
          },
        )

        const [{ config: predefinedWorkflowStages }] = workflowConfig

        const defaultBookComponentWorkflowStages = {
          workflowStages: predefinedWorkflowStages
            ? map(predefinedWorkflowStages, stage => ({
                type: stage.type,
                label: stage.title,
                value: -1,
              }))
            : [],
        }

        const frontMatterDivision = await Division.findOne(
          { bookId, label: 'Frontmatter', deleted: false },
          { trx: tr },
        )

        logger.info(
          `${BOOK_CONTROLLER} createBook: Front matter division which will hold all the special components found with id ${frontMatterDivision.id}`,
        )
        const frontMatterBookComponents = frontMatterDivision.bookComponents

        if (featurePODEnabled) {
          // SUB-SECTION FOR TITLE PAGE CREATION
          logger.info(
            `${BOOK_CONTROLLER} createBook: creating Title page component for the book with id ${bookId}`,
          )

          const newTitlePageBookComponent = {
            bookId,
            componentType: 'title-page',
            divisionId: frontMatterDivision.id,
            pagination: {
              left: false,
              right: false,
            },
            archived: false,
            deleted: false,
          }

          const createdTitlePageBookComponent = await BookComponent.insert(
            newTitlePageBookComponent,
            { trx: tr },
          )

          logger.info(
            `${BOOK_CONTROLLER} createBook: new book component Title page created with id ${createdTitlePageBookComponent.id}`,
          )

          const titlePageTranslation = await BookComponentTranslation.insert(
            {
              bookComponentId: createdTitlePageBookComponent.id,
              languageIso: 'en',
              title: 'Title Page',
            },
            { trx: tr },
          )

          logger.info(
            `${BOOK_CONTROLLER} createBook: new book component translation for Title page created with id ${titlePageTranslation.id}`,
          )

          frontMatterBookComponents.push(createdTitlePageBookComponent.id)

          logger.info(
            `${BOOK_CONTROLLER} createBook: book component Title page will be added to the array of book components for the Front matter division`,
          )

          await BookComponentState.insert(
            assign(
              {},
              {
                bookComponentId: createdTitlePageBookComponent.id,
                trackChangesEnabled: false,
                uploading: false,
                includeInToc: false,
              },
              defaultBookComponentWorkflowStages,
            ),
            { trx: tr },
          )
          // END OF TITLE PAGE CREATION SUB-SECTION

          // SUB-SECTION FOR COPYRIGHTS PAGE CREATION
          logger.info(
            `${BOOK_CONTROLLER} createBook: creating Copyright page component for the book with id ${bookId}`,
          )

          const newCopyrightsBookComponent = {
            bookId,
            componentType: 'copyrights-page',
            divisionId: frontMatterDivision.id,
            pagination: {
              left: false,
              right: false,
            },
            archived: false,
            deleted: false,
          }

          const createdCopyrightsBookComponent = await BookComponent.insert(
            newCopyrightsBookComponent,
            { trx: tr },
          )

          logger.info(
            `${BOOK_CONTROLLER} createBook: new book component Copyrights page created with id ${createdCopyrightsBookComponent.id}`,
          )

          const copyrightsTranslation = await BookComponentTranslation.insert(
            {
              bookComponentId: createdCopyrightsBookComponent.id,
              languageIso: 'en',
              title: 'Copyright',
            },
            { trx: tr },
          )

          logger.info(
            `${BOOK_CONTROLLER} createBook: new book component translation for Copyrights page created with id ${copyrightsTranslation.id}`,
          )

          frontMatterBookComponents.push(createdCopyrightsBookComponent.id)

          logger.info(
            `${BOOK_CONTROLLER} createBook: book component Copyrights page will be added to the array of book components for the Front matter division`,
          )

          await BookComponentState.insert(
            assign(
              {},
              {
                bookComponentId: createdCopyrightsBookComponent.id,
                trackChangesEnabled: false,
                uploading: false,
                includeInToc: false,
              },
              defaultBookComponentWorkflowStages,
            ),
            { trx: tr },
          )

          // END OF COPYRIGHTS PAGE CREATION SUB-SECTION
        }

        logger.info(
          `${BOOK_CONTROLLER} createBook: creating TOC component for the book with id ${bookId}`,
        )

        const newTOCBookComponent = {
          bookId,
          componentType: 'toc',
          divisionId: frontMatterDivision.id,
          pagination: {
            left: false,
            right: true,
          },
          archived: false,
          deleted: false,
        }

        const TOCBookComponent = await BookComponent.insert(
          newTOCBookComponent,
          {
            trx: tr,
          },
        )

        logger.info(
          `${BOOK_CONTROLLER} createBook: new book component (TOC) created with id ${TOCBookComponent.id}`,
        )

        const TOCtranslation = await BookComponentTranslation.insert(
          {
            bookComponentId: TOCBookComponent.id,
            languageIso: 'en',
            title: 'Table of Contents',
          },
          { trx: tr },
        )

        logger.info(
          `${BOOK_CONTROLLER} createBook: new book component translation for TOC created with id ${TOCtranslation.id}`,
        )

        frontMatterBookComponents.push(TOCBookComponent.id)

        logger.info(
          `${BOOK_CONTROLLER} createBook: book component Table of Contents will be added to the array of book components for the Front matter division`,
        )

        await BookComponentState.insert(
          assign(
            {},
            {
              bookComponentId: TOCBookComponent.id,
              trackChangesEnabled: false,
              uploading: false,
              includeInToc: false,
            },
            defaultBookComponentWorkflowStages,
          ),
          { trx: tr },
        )

        await Division.patchAndFetchById(
          frontMatterDivision.id,
          {
            bookComponents: frontMatterBookComponents,
          },
          { trx: tr },
        )

        logger.info(
          `${BOOK_CONTROLLER} createBook: book's Front matter division updated with the special component/s `,
        )
        // END OF BOOK SPECIAL COMPONENTS CREATION SECTION

        // SECTION FOR SETTING DEFAULT TEMPLATE
        // if (featurePODEnabled) {
        // const additionalExportOptions = {
        //   includeTOC: true,
        //   includeCopyrights: true,
        //   includeTitlePage: true,
        // }
        // const pagedjs = []
        // const pagedjsTrimA4 = await getSpecificTemplates(
        //   'pagedjs',
        //   '8.5x11',
        //   null,
        //   {
        //     trx: tr,
        //   },
        // )
        // if (pagedjsTrimA4[0]) {
        //   pagedjs.push({
        //     templateId: pagedjsTrimA4[0].id,
        //     trimSize: pagedjsTrimA4[0].trimSize,
        //     additionalExportOptions,
        //   })
        // }
        // const pagedjsTrimA5 = await getSpecificTemplates(
        //   'pagedjs',
        //   '5.5x8.5',
        //   pagedjsTrimA4[0]?.name,
        //   {
        //     trx: tr,
        //   },
        // )
        // if (pagedjsTrimA5[0]) {
        //   pagedjs.push({
        //     templateId: pagedjsTrimA5[0].id,
        //     trimSize: pagedjsTrimA5[0].trimSize,
        //     additionalExportOptions,
        //   })
        // }
        // const pagedjsTrimTrade = await getSpecificTemplates(
        //   'pagedjs',
        //   '6x9',
        //   pagedjsTrimA4[0]?.name,
        //   {
        //     trx: tr,
        //   },
        // )
        // if (pagedjsTrimTrade[0]) {
        //   pagedjs.push({
        //     templateId: pagedjsTrimTrade[0].id,
        //     trimSize: pagedjsTrimTrade[0].trimSize,
        //     additionalExportOptions,
        //   })
        // }
        // const epubTemplate = await getSpecificTemplates('epub', null, null, {
        //   trx: tr,
        // })
        // const epub = epubTemplate[0]
        //   ? { templateId: epubTemplate[0].id, additionalExportOptions }
        //   : null
        // const associatedTemplates = {
        //   pagedjs,
        //   epub,
        // }
        // await Book.patchAndFetchById(
        //   newBook.id,
        //   {
        //     associatedTemplates,
        //   },
        //   { trx: tr },
        // )
        // }
        // END OF BOOK DEFAULT TEMPLATE CREATION SECTION
        return Book.findOne({ id: bookId }, { trx: tr })
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} createBook: ${e.message}`)
    throw new Error(e)
  }
}

const renameBook = async (bookId, title, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const bookTranslation = await BookTranslation.findOne(
          { bookId, languageIso: 'en' },
          { trx: tr },
        )

        await BookTranslation.query(tr)
          .patch({ title })
          .where({ id: bookTranslation.id })

        logger.info(
          `${BOOK_CONTROLLER} renameBook: title updated for book with id ${bookId}`,
        )

        return Book.findOne({ id: bookId, deleted: false }, { trx: tr })
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} renameBook: ${e.message}`)
    throw new Error(e)
  }
}

const updateSubtitle = async (bookId, subtitle, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const bookTranslation = await BookTranslation.findOne(
          { bookId, languageIso: 'en' },
          { trx: tr },
        )

        await BookTranslation.query(tr)
          .patch({ subtitle })
          .where({ id: bookTranslation.id })

        logger.info(
          `${BOOK_CONTROLLER} updateSubtitle: subtitle updated for book with id ${bookId}`,
        )

        return Book.findOne({ id: bookId, deleted: false }, { trx: tr })
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} updateSubtitle: ${e.message}`)
    throw new Error(e)
  }
}

const deleteBook = async (bookId, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const deletedBook = await Book.patchAndFetchById(
          bookId,
          {
            deleted: true,
          },
          { trx: tr },
        )

        logger.info(
          `${BOOK_CONTROLLER} deleteBook: book with id ${bookId} deleted`,
        )

        const { result: associatedBookComponents } = await BookComponent.find(
          { bookId },
          { trx: tr },
        )

        if (associatedBookComponents.length > 0) {
          await Promise.all(
            map(associatedBookComponents, async bookComponent => {
              await BookComponent.patchAndFetchById(
                bookComponent.id,
                {
                  deleted: true,
                },
                { trx: tr },
              )

              logger.info(
                `${BOOK_CONTROLLER} deleteBook: associated book component with id ${bookComponent.id} deleted`,
              )
            }),
          )
        }

        const { result: associatedDivisions } = await Division.find(
          { bookId: deletedBook.id },
          { trx: tr },
        )

        await Promise.all(
          map(associatedDivisions, async division => {
            const updatedDivision = await Division.patchAndFetchById(
              division.id,
              {
                bookComponents: [],
                deleted: true,
              },
              { trx: tr },
            )

            logger.info(
              `${BOOK_CONTROLLER} deleteBook: associated division with id ${division.id} deleted`,
            )

            logger.info(
              `${BOOK_CONTROLLER} deleteBook: corresponding division's book components [${updatedDivision.bookComponents}] cleaned`,
            )
          }),
        )

        const { result: associatedTeams } = await getObjectTeams(
          bookId,
          'book',
          {
            trx: tr,
          },
        )

        const pubsub = await pubsubManager.getPubsub()

        if (associatedTeams.length > 0) {
          await Promise.all(
            map(associatedTeams, async team => {
              const { result: teamMembers } = await TeamMember.find({
                teamId: team.id,
              })

              await Promise.all(
                teamMembers.map(async teamMember => {
                  const updatedUser = await getUser(teamMember.userId)

                  return pubsub.publish('USER_UPDATED', {
                    userUpdated: updatedUser,
                  })
                }),
              )
            }),
          )
          await Promise.all(
            map(associatedTeams, async team =>
              deleteTeam(team.id, { trx: tr }),
            ),
          )
        }

        // Soft delete the corresponding book settings
        await BookSettings.query(tr).patch({ deleted: true }).where({ bookId })

        return deletedBook
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} deleteBook: ${e.message}`)
    throw new Error(e)
  }
}

const archiveBook = async (bookId, archive, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const archivedBook = await Book.patchAndFetchById(
          bookId,
          {
            archived: archive,
          },
          { trx: tr },
        )

        logger.info(
          `${BOOK_CONTROLLER} archiveBook: book with id ${archivedBook.id} archived`,
        )

        const { result: associatedBookComponents } = await BookComponent.find(
          { bookId },
          { trx: tr },
        )

        if (associatedBookComponents.length > 0) {
          await Promise.all(
            map(associatedBookComponents, async bookComponent => {
              await BookComponent.patchAndFetchById(
                bookComponent.id,
                {
                  archived: archive,
                },
                { trx: tr },
              )
              logger.info(
                `${BOOK_CONTROLLER} archiveBook: associated book component with id ${bookComponent.id} archived`,
              )
            }),
          )
        }

        return archivedBook
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} archiveBook: ${e.message}`)
    throw new Error(e)
  }
}

const updateMetadata = async (metadata, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const clean = omitBy(metadata, isNil)

        const { id, ...rest } = clean

        const updatedBook = await Book.patchAndFetchById(
          id,
          {
            ...rest,
          },
          { trx: tr },
        )

        logger.info(
          `${BOOK_CONTROLLER} updateMetadata: book with id ${updatedBook.id} has new metadata`,
        )

        return updatedBook
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} updateMetadata: ${e.message}`)
    throw new Error(e)
  }
}

const updatePODMetadata = async (bookId, metadata, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const clean = omitBy(metadata, isNil)

        const existingBook = await getBook(bookId, { trx: tr })

        const hasDiffInISBNs = !equalArrays(
          existingBook?.podMetadata?.isbns,
          clean.isbns,
        )

        const updatedBook = await Book.patchAndFetchById(
          bookId,
          {
            podMetadata: clean,
          },
          { trx: tr },
        )

        if (hasDiffInISBNs) {
          const exportProfiles = await ExportProfile.query(tr)
            .where({ bookId, format: 'epub' })
            .whereNotNull('isbn')

          await Promise.all(
            exportProfiles.map(async exportProfile => {
              const { id, isbn } = exportProfile

              if (!isbn) {
                return false
              }

              const found = find(updatedBook.podMetadata?.isbns, { isbn })

              if (!found) {
                logger.info(
                  `${BOOK_CONTROLLER} updatePODMetadata: cleaning orphan isbn from export profile with id ${id}`,
                )
                return updateExportProfile(id, { isbn: null }, { trx: tr })
              }

              return true
            }),
          )
        }

        logger.info(
          `${BOOK_CONTROLLER} updatePODMetadata: book with id ${updatedBook.id} has new POD metadata`,
        )

        return updatedBook
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} updatePODMetadata: ${e.message}`)
    throw new Error(e)
  }
}

const exportBook = async (
  bookId,
  bookComponentId,
  templateId,
  previewer,
  fileExtension,
  icmlNotes,
  additionalExportOptions,
  options = {},
) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr =>
        exporter(
          bookId,
          bookComponentId,
          templateId,
          previewer,
          fileExtension,
          icmlNotes,
          additionalExportOptions,
        ),
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} exportBook: ${e.message}`)
    throw e
  }
}

const updateRunningHeaders = async (bookComponents, bookId, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        await Promise.all(
          map(bookComponents, async bookComponent => {
            const { id } = bookComponent

            const bookComponentState = await BookComponentState.query(
              tr,
            ).findOne({ bookComponentId: id }, { trx: tr })

            return BookComponentState.patchAndFetchById(
              bookComponentState.id,
              {
                runningHeadersRight: bookComponent.runningHeadersRight,
                runningHeadersLeft: bookComponent.runningHeadersLeft,
              },
              { trx: tr },
            )
          }),
        )

        logger.info(
          `${BOOK_CONTROLLER} updateRunningHeaders: running headers updated for book with id ${bookId}`,
        )

        return Book.findOne({ id: bookId, deleted: false }, { trx: tr })
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} updateRunningHeaders: ${e.message}`)
    throw new Error(e)
  }
}

// should be removed as functionality omitted
const changeLevelLabel = async (bookId, levelId, label, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const book = await Book.findById(bookId, { trx: tr })
        const clonedBookStructure = { ...book.bookStructure }

        const levelIndex = findIndex(clonedBookStructure.levels, {
          id: levelId,
        })

        clonedBookStructure.levels[levelIndex].displayName = label
        clonedBookStructure.levels[levelIndex].type = toCamelCase(label)

        // For the case of level two closers
        if (clonedBookStructure.levels.length === 4) {
          if (levelIndex === 1) {
            clonedBookStructure.levels[3].displayName = `${label} Closer`
            clonedBookStructure.levels[3].type = `${toCamelCase(label)}Closer`
          }
        }

        // if existing outline info then update the type based on changed label
        if (clonedBookStructure.outline.length > 0) {
          clonedBookStructure.outline.forEach(levelOneComponent => {
            /* eslint-disable no-param-reassign */
            if (levelIndex === 0) {
              levelOneComponent.type = toCamelCase(label)
            } else {
              levelOneComponent.children.forEach(levelTwoComponent => {
                if (levelIndex === 1) {
                  levelTwoComponent.type = toCamelCase(label)
                } else {
                  levelTwoComponent.children.forEach(levelThreeComponent => {
                    if (levelIndex === 2) {
                      levelThreeComponent.type = toCamelCase(label)
                    }
                  })
                  /* eslint-enable no-param-reassign */
                }
              })
            }
          })
        }

        await Book.patchAndFetchById(
          bookId,
          {
            bookStructure: clonedBookStructure,
          },
          { trx: tr },
        )

        logger.info(
          `${BOOK_CONTROLLER} changeLevelLabel: level label changed for book with id ${bookId}`,
        )

        return clonedBookStructure.levels[levelIndex]
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} changeLevelLabel: ${e.message}`)
    throw new Error(e)
  }
}

const changeNumberOfLevels = async (bookId, levelsNumber, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const book = await Book.findById(bookId, { trx: tr })
        const clonedBookStructure = { ...book.bookStructure }

        const currentBookLevels =
          clonedBookStructure.levels.length === 0
            ? 0
            : clonedBookStructure.levels.length - 2 // minus 2 because section will always be present as well as closers

        if (currentBookLevels === levelsNumber) {
          return clonedBookStructure.levels
        }

        if (levelsNumber === 1) {
          clonedBookStructure.levels = []
          clonedBookStructure.levels.push(
            defaultLevelTwoItem,
            defaultLevelThreeItem,
            defaultLevelCloserItem,
          )

          clonedBookStructure.outline = [
            {
              title: undefined,
              type: 'chapter',
              children: [{ title: undefined, type: 'section', children: [] }],
            },
          ]
        }

        if (levelsNumber === 2) {
          clonedBookStructure.levels = []
          clonedBookStructure.levels.push(
            defaultLevelOneItem,
            defaultLevelTwoItem,
            defaultLevelThreeItem,
            defaultLevelCloserItem,
          )

          // ADD LEVEL THREE OUTLINE ITEMS
          clonedBookStructure.outline = [
            {
              title: undefined,
              type: 'part',
              children: [
                {
                  title: undefined,
                  type: 'chapter',
                  children: [
                    { title: undefined, type: 'section', children: [] },
                  ],
                },
              ],
            },
          ]
        }

        await Book.patchAndFetchById(
          bookId,
          {
            bookStructure: clonedBookStructure,
          },
          { trx: tr },
        )

        logger.info(
          `${BOOK_CONTROLLER} changeNumberOfLevels: number of levels changed for book with id ${bookId}`,
        )

        return clonedBookStructure.levels
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} changeNumberOfLevels: ${e.message}`)
    throw new Error(e)
  }
}

const updateBookOutline = async (bookId, outline, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const book = await Book.findById(bookId, { trx: tr })

        const clonedBookStructure = JSON.parse(
          JSON.stringify(book.bookStructure),
        )

        clonedBookStructure.outline = outline

        const updatedBook = await Book.patchAndFetchById(
          bookId,
          {
            bookStructure: clonedBookStructure,
          },
          { trx: tr },
        )

        logger.info(
          `${BOOK_CONTROLLER} updateBookOutline: outline changed for book with id ${bookId}`,
        )

        return updatedBook.bookStructure
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} updateBookOutline: ${e.message}`)
    throw new Error(e)
  }
}

const updateLevelContentStructure = async (bookId, levels, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const book = await Book.findById(bookId, { trx: tr })

        const clonedBookStructure = JSON.parse(
          JSON.stringify(book.bookStructure),
        )

        clonedBookStructure.levels = levels

        const updatedBook = await Book.patchAndFetchById(
          bookId,
          {
            bookStructure: clonedBookStructure,
          },
          { trx: tr },
        )

        logger.info(
          `${BOOK_CONTROLLER} updateLevelContentStructure: level changed for book with id ${bookId}`,
        )

        return updatedBook.bookStructure.levels
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} updateLevelContentStructure: ${e.message}`)
    throw new Error(e)
  }
}

const finalizeBookStructure = async (bookId, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const book = await Book.findById(bookId, { trx: tr })

        const clonedBookStructure = JSON.parse(
          JSON.stringify(book.bookStructure),
        )

        const workflowConfig = await getApplicationParameters(
          'bookBuilder',
          'stages',
          {
            trx: tr,
          },
        )

        const [{ config: workflowStages }] = workflowConfig

        // find book's body division to append book components declared in bookStructure outline
        const bodyDivision = await Division.findOne(
          {
            bookId,
            label: 'Body',
            deleted: false,
          },
          { trx: tr },
        )

        const newDivisionBookComponents = JSON.parse(
          JSON.stringify(bodyDivision.bookComponents),
        )

        await BPromise.mapSeries(
          clonedBookStructure.outline,
          async (outlineItem, levelOneIndex) => {
            if (clonedBookStructure.levels.length === 3) {
              newDivisionBookComponents.push(outlineItem.id)

              const bookComponentLevelOne = await bookComponentCreator(
                book.id,
                outlineItem.type,
                bodyDivision.id,
                outlineItem.title,
                workflowStages,
                { trx: tr, bookComponentId: outlineItem.id },
              )

              return bookComponentContentCreator(
                bookComponentLevelOne,
                outlineItem.title,
                book.bookStructure,
                0,
                { levelOneIndex },
                { trx: tr },
              )
            }

            if (clonedBookStructure.levels.length === 4) {
              newDivisionBookComponents.push(outlineItem.id)

              const bookComponentLevelOne = await bookComponentCreator(
                book.id,
                outlineItem.type,
                bodyDivision.id,
                outlineItem.title,
                workflowStages,
                { trx: tr, bookComponentId: outlineItem.id },
              )

              await bookComponentContentCreator(
                bookComponentLevelOne,
                outlineItem.title,
                book.bookStructure,
                0,
                {},
                { trx: tr },
              )

              return BPromise.mapSeries(
                outlineItem.children,
                async (levelTwoItem, levelTwoIndex) => {
                  newDivisionBookComponents.push(levelTwoItem.id)

                  const bookComponentLevelTwo = await bookComponentCreator(
                    book.id,
                    levelTwoItem.type,
                    bodyDivision.id,
                    levelTwoItem.title,
                    workflowStages,
                    { trx: tr, bookComponentId: levelTwoItem.id },
                  )

                  return bookComponentContentCreator(
                    bookComponentLevelTwo,
                    levelTwoItem.title,
                    book.bookStructure,
                    1,
                    { levelOneIndex, levelTwoIndex },
                    { trx: tr },
                  )
                },
              )
              // }
            }

            return false
          },
        )

        await Division.patchAndFetchById(
          bodyDivision.id,
          {
            bookComponents: newDivisionBookComponents,
          },
          { trx: tr },
        )
        // set finalized flag to true
        clonedBookStructure.finalized = true

        const updatedBook = await Book.patchAndFetchById(
          bookId,
          {
            bookStructure: clonedBookStructure,
          },
          { trx: tr },
        )

        logger.info(
          `${BOOK_CONTROLLER} finalizeBookStructure: book structure finalized  for book with id ${bookId}`,
        )

        return updatedBook
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} finalizeBookStructure: ${e.message}`)
    throw new Error(e)
  }
}

const updateShowWelcome = async (bookId, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const book = await Book.findById(bookId, { trx: tr })

        const clonedBookStructure = JSON.parse(
          JSON.stringify(book.bookStructure),
        )

        clonedBookStructure.showWelcome = false

        const updatedBook = await Book.patchAndFetchById(
          bookId,
          {
            bookStructure: clonedBookStructure,
          },
          { trx: tr },
        )

        logger.info(
          `${BOOK_CONTROLLER} updateShowWelcome: book structure initialized and set show welcome to false for book with id ${bookId}`,
        )

        return updatedBook
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} updateShowWelcome: ${e.message}`)
    throw new Error(e)
  }
}

const getBookTitle = async (bookId, options = {}) => {
  try {
    const bookTranslation = await BookTranslation.findOne({
      bookId,
      languageIso: 'en',
    })

    if (!bookTranslation) {
      throw new Error(
        `book with id ${bookId} does not have a translation entry`,
      )
    }

    return bookTranslation.title
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} getBookTitle: ${e.message}`)
    throw new Error(e)
  }
}

// const updateAssociatedTemplates = async (
//   bookId,
//   associatedTemplates,
//   options = {},
// ) => {
//   try {
//     const { trx } = options
//     return useTransaction(
//       async tr => {
//         const book = await Book.query().findById(bookId)

//         if (!book) {
//           throw new Error('Book not found')
//         }

//         const updatedBook = await Book.patchAndFetchById(
//           bookId,
//           {
//             associatedTemplates,
//           },
//           { trx: tr },
//         )

//         logger.info(
//           `${BOOK_CONTROLLER} updateAssociatedTemplates: book with id ${updatedBook.id} has updated associated templates`,
//         )

//         return updatedBook
//       },
//       { trx },
//     )
//   } catch (e) {
//     logger.error(`${BOOK_CONTROLLER} updateAssociatedTemplates: ${e.message}`)
//     throw new Error(e)
//   }
// }

const updateBookStatus = async (id, status, options = {}) => {
  try {
    const { trx } = options
    logger.info(
      `${BOOK_CONTROLLER} updateBookStatus: updating book with id ${id}`,
    )
    return useTransaction(
      async tr => {
        const book = await Book.findById(id, { trx: tr })

        if (!book) {
          throw new Error(`book with id: ${id} does not exist`)
        }

        const updatedBook = await Book.patchAndFetchById(
          id,
          { status },
          { trx: tr },
        )

        return updatedBook
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} updateBookStatus: ${e.message}`)
    throw new Error(e)
  }
}

const getBookSubtitle = async (bookId, options = {}) => {
  try {
    const bookTranslation = await BookTranslation.findOne({
      bookId,
      languageIso: 'en',
    })

    if (!bookTranslation) {
      throw new Error(
        `book with id ${bookId} does not have a translation entry`,
      )
    }

    return bookTranslation.subtitle
  } catch (e) {
    logger.error(`${BOOK_CONTROLLER} getBooksubtitle: ${e.message}`)
    throw new Error(e)
  }
}

const uploadBookThumbnail = async (bookId, file, options = {}) => {
  try {
    if (file) {
      const { createReadStream, filename } = await file

      const book = await Book.findById(bookId)
      const existingThumbnailId = book.thumbnailId

      if (existingThumbnailId) {
        await deleteFiles([existingThumbnailId], true)
      }

      const fileStream = createReadStream()

      const uploadedFile = await createFile(
        fileStream,
        filename,
        null,
        null,
        [],
        bookId,
      )

      const thumbnailId = uploadedFile.id

      const updatedBook = await Book.patchAndFetchById(bookId, {
        thumbnailId,
      })

      return updatedBook
    }

    const book = await Book.findById(bookId)
    await deleteFiles([book.thumbnailId])

    const updatedBook = await Book.patchAndFetchById(bookId, {
      thumbnailId: null,
    })

    return updatedBook
  } catch (error) {
    throw new Error('Something went wrong while uploading the book thumbnail.')
  }
}

const uploadBookCover = async (bookId, file, options = {}) => {
  try {
    if (file) {
      const { createReadStream, filename } = await file

      const book = await Book.findById(bookId)
      const existingCoverId = book.cover && book.cover[0].fileId

      if (existingCoverId) {
        await deleteFiles([existingCoverId], true)
      }

      const fileStream = createReadStream()

      const uploadedFile = await createFile(
        fileStream,
        filename,
        null,
        null,
        [],
        bookId,
      )

      const coverId = uploadedFile.id

      const updatedBook = await Book.patchAndFetchById(bookId, {
        cover: [
          {
            fileId: coverId,
            altText: book.cover && book.cover[0] ? book.cover[0].altText : '',
          },
        ],
      })

      return updatedBook
    }

    const book = await Book.findById(bookId)

    if (book.cover && book.cover[0]?.fileId) {
      await deleteFiles([book.cover[0]?.fileId])
    }

    const updatedBook = await Book.patchAndFetchById(bookId, {
      cover: [
        {
          fileId: null,
          altText: book.cover && book.cover[0] ? book.cover[0].altText : '',
        },
      ],
    })

    return updatedBook
  } catch (error) {
    logger.error(error)
    throw new Error('Something went wrong while uploading the book thumbnail.')
  }
}

const updateBookCoverAltText = async (bookId, coverAlt, options = {}) => {
  try {
    const book = await Book.findById(bookId)

    const updatedBook = await Book.patchAndFetchById(bookId, {
      cover: [
        {
          fileId: book.cover[0].fileId,
          altText: coverAlt,
        },
      ],
    })

    return updatedBook
  } catch (error) {
    logger.error(error)
    throw new Error("Error updating book cover's alt text")
  }
}

const getUserBookDetails = async (userId, bookId, options = {}) => {
  try {
    return Book.getUserBookDetails(userId, bookId, {
      trx: options.trx,
    })
  } catch (error) {
    throw new Error('Something went wrong while getting user book details.')
  }
}

const createWebPreview = async (
  bookId,
  bookComponentId,
  templateId,
  userId,
  additionalExportOptions = {},
) => {
  logger.info(
    `Book controler: createWebPreview, book id: ${bookId}, templateId: ${templateId}`,
  )

  try {
    const book = await bookConstructor(bookId, bookComponentId)

    const bookComponent = await BookComponentTranslation.findOne(
      { bookComponentId: bookComponentId, languageIso: 'en' },
    )

    let chapters = Array.from(book.divisions.get('body').bookComponents).map(
      ch => ch[1],
    )

    // replace image sources with fresh ones
    chapters = await Promise.all(
      chapters.map(async ch => {
        if (ch.content) {
          const content = await replaceImageSource(ch.content, getContentFiles)

          return {
            ...ch,
            content,
          }
        }

        // post empty string and default title if chapter has no content
        return { ...ch, content: '', title: 'Untitled chapter' }
      }),
    )

    // copyright page
    // const copyrightComponent = book.divisions
    //   .get('front')
    //   .bookComponents.get('copyrights-page')

    // const copyrightContent = generateCopyrightsContentForWeb(
    //   book.title,
    //   copyrightComponent,
    //   book.podMetadata,
    // )

    // css and fonts from selected template
    const templateFiles = await prepareTemplateFiles(
      templateId,
      `${flaxBookPathPrefix('preview', bookId, userId)}/fonts`,
    )

    // cover information
    const coverData = book.cover && book.cover[0]

    const coverFile =
      coverData?.fileId && (await File.findById(coverData.fileId))

    let coverUrl

    if (coverFile) {
      coverUrl = await fileStorage.getURL(
        coverFile.getStoredObjectBasedOnType('original').key,
      )
    }

    const data = {
      bookId,
      userId,
      title: bookComponent.title,
      subtitle: null,
      metadata: JSON.stringify(book.podMetadata),
      chapters: JSON.stringify(chapters),
      stylesheet: templateFiles.stylesheet,
      fonts: templateFiles.fonts,
      includePdf: additionalExportOptions.includePdf,
      includeEpub: additionalExportOptions.includeEpub,
      customHeader: additionalExportOptions.customHeader,
      customFooter: additionalExportOptions.customFooter,
      copyrightContent: null,
      ...(coverFile
        ? {
            coverName: coverFile.name,
            coverUrl,
            coverAlt: coverData?.altText,
          }
        : {}),
    }

    const response = await flaxHandler(data, { action: 'preview' })

    if (response.status === 200) {
      await fs.remove(templateFiles.tempAssetsPath)

      const timestamp = Date.now()

      console.log({
        path: `${response.serviceBaseUrl}${flaxBookPathPrefix(
          'preview',
          bookId,
          userId,
        )}/?timestamp=${timestamp}`,
        validationResult: undefined,
      })

      return {
        path: `${response.serviceBaseUrl}${flaxBookPathPrefix(
          'preview',
          bookId,
          userId,
        )}/?timestamp=${timestamp}`,
        validationResult: undefined,
      }
    }

    return {
      path: 'ERROR',
      validationResult: undefined,
    }
  } catch (error) {
    logger.error(error)
    throw new Error(error)
  }
}

const publishOnline = async (
  bookId,
  bookComponentId,
  templateId,
  profileId,
  userId,
  additionalExportOptions = {},
) => {
  logger.info(
    `Book controler: Publish Online, book id: ${bookId}, templateId: ${templateId}`,
  )

  try {
    const book = await bookConstructor(bookId,bookComponentId)
    
    const bookComponent = await BookComponentTranslation.findOne(
      { bookComponentId: bookComponentId, languageIso: 'en' },
    )

    let chapters = Array.from(book.divisions.get('body').bookComponents).map(
      ch => ch[1],
    )

    // replace image sources with fresh ones
    chapters = await Promise.all(
      chapters.map(async ch => {
        const content = await replaceImageSource(ch.content, getContentFiles)

        return {
          ...ch,
          content,
        }
      }),
    )

    // const copyrightComponent = book.divisions
    //   .get('front')
    //   .bookComponents.get('copyrights-page')

    // const copyrightContent = generateCopyrightsContentForWeb(
    //   book.title,
    //   copyrightComponent,
    //   book.podMetadata,
    // )

    const templateFiles = await prepareTemplateFiles(
      templateId,
      `/books/${bookId}/fonts`,
      `${flaxBookPathPrefix('publish', bookId)}/fonts`,
    )

    // cover information
    const coverData = book.cover && book.cover[0]

    const coverFile =
      coverData?.fileId && (await File.findById(coverData.fileId))

    let coverUrl

    if (coverFile) {
      coverUrl = await fileStorage.getURL(
        coverFile.getStoredObjectBasedOnType('original').key,
      )
    }

    const { includePdf, includeEpub, pdfProfileId, epubProfileId } =
      additionalExportOptions

    let pdfFilePath
    let epubFilePath

    if (includePdf) {
      // generate pdf
      const pdfProfile = await getExportProfile(pdfProfileId)

      const pdfFile = await exporter(
        bookId,
        bookComponentId,
        pdfProfile.templateId,
        'pagedjs',
        'pdf',
        null, // icmlNotes
        {
          isbn: pdfProfile.isbn,
          includeTOC:  false, // pdfProfile.includedComponents.toc,
          includeCopyrights: false, // pdfProfile.includedComponents.copyright,
          includeTitlePage: pdfProfile.includedComponents.titlePage,
        },
      )

      pdfFilePath = path.join(`${process.cwd()}`, pdfFile.localPath)
    }

    if (includeEpub) {
      const epubProfile = await getExportProfile(epubProfileId)

      // generate epub
      const epubFile = await exporter(
        bookId,
        bookComponentId,
        epubProfile.templateId,
        null, // previewer
        'epub',
        null, // icmlNotes
        {
          isbn: epubProfile.isbn,
          includeTOC: false, //epubProfile.includedComponents.toc,
          includeCopyrights: false, //epubProfile.includedComponents.copyright,
          includeTitlePage: epubProfile.includedComponents.titlePage,
        },
      )

      epubFilePath = path.join(`${process.cwd()}`, epubFile.localPath)
    }

    const data = {
      bookId,
      userId,
      title: bookComponent.title,
      subtitle: null, // book.subtitle,
      metadata: JSON.stringify(book.podMetadata),
      chapters: JSON.stringify(chapters),
      stylesheet: templateFiles.stylesheet,
      fonts: templateFiles.fonts,
      includePdf: additionalExportOptions.includePdf,
      includeEpub: additionalExportOptions.includeEpub,
      customHeader: additionalExportOptions.customHeader,
      customFooter: additionalExportOptions.customFooter,
      pdfFilePath,
      epubFilePath,
      copyrightContent: null,
      ...(coverFile
        ? {
            coverName: coverFile.name,
            coverUrl,
            coverAlt: coverData?.altText,
          }
        : {}),
    }

    const response = await flaxHandler(data, { action: 'publish' })

    if (response.status === 200) {
      await fs.remove(templateFiles.tempAssetsPath)

      const publishedBookUrl = `${response.serviceBaseUrl}${flaxBookPathPrefix(
        'publish',
        bookId,
      )}`

      await setPublishingRecord(
        bookId,
        true,
        new Date().toISOString(),
        profileId,
        publishedBookUrl,
      )

      return {
        path: publishedBookUrl,
        validationResult: undefined,
      }
    }

    return {
      path: 'ERROR',
      validationResult: undefined,
    }
  } catch (e) {
    logger.error(e)
    throw new Error(e)
  }
}

const unpublishWebBook = async bookId => {
  logger.info(`Book controler: unpublishWebBook, book id: ${bookId}`)

  try {
    // unpublish in the flax microservice
    const response = await flaxHandler({ bookId }, { action: 'unpublish' })

    // mark as unpublished in the db
    const book = await Book.findById(bookId)
    const timestamp = new Date().toISOString()

    await Book.patchAndFetchById(bookId, {
      webPublishInfo: {
        ...book.webPublishInfo,
        published: false,
        // firstPublished: `${timestamp}`,
        lastUpdated: `${timestamp}`,
      },
    })

    return response.status === 200
  } catch (error) {
    logger.error(error)
    return false
  }
}

const setPublishingRecord = async (
  id,
  published,
  timestamp,
  profileId,
  publicUrl,
) => {
  const book = await Book.findById(id)

  if (!book.webPublishInfo) {
    await Book.patchAndFetchById(id, {
      webPublishInfo: {
        published,
        // firstPublished: `${timestamp}`,
        lastUpdated: `${timestamp}`,
        profileId,
        publicUrl,
      },
    })
  } else {
    await Book.patchAndFetchById(id, {
      webPublishInfo: {
        published,
        // firstPublished: `${book.webPublishInfo.firstPublished}`,
        lastUpdated: `${timestamp}`,
        profileId,
        publicUrl,
      },
    })
  }
}

module.exports = {
  getBook,
  getBooks,
  archiveBook,
  createBook,
  renameBook,
  updateSubtitle,
  deleteBook,
  exportBook,
  updateMetadata,
  updatePODMetadata,
  updateRunningHeaders,
  changeLevelLabel,
  changeNumberOfLevels,
  updateBookOutline,
  updateLevelContentStructure,
  updateShowWelcome,
  finalizeBookStructure,
  getBookTitle,
  // updateAssociatedTemplates,
  updateBookStatus,
  getBookSubtitle,
  uploadBookThumbnail,
  uploadBookCover,
  updateBookCoverAltText,
  getUserBookDetails,
  createWebPreview,
  publishOnline,
  unpublishWebBook,
}
