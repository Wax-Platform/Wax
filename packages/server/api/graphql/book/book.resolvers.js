const { withFilter } = require('graphql-subscriptions')
const { pubsubManager, logger, fileStorage } = require('@coko/server')

const { getUser } = require('@coko/server/src/models/user/user.controller')

const map = require('lodash/map')
const isEmpty = require('lodash/isEmpty')

const {
  subscriptions: { USER_UPDATED },
} = require('@coko/server/src/models/user/constants')

const {
  BOOK_CREATED,
  BOOK_DELETED,
  BOOK_UPDATED,
  BOOK_RENAMED,
  BOOK_ARCHIVED,
  BOOK_METADATA_UPDATED,
  BOOK_RUNNING_HEADERS_UPDATED,
  BOOK_SETTINGS_UPDATED,
} = require('./constants')

const { getObjectTeam } = require('../../../controllers/team.controller')

const { isAdmin } = require('../../../controllers/user.controller')

const { getURL } = fileStorage

const {
  pagedPreviewerLink,
} = require('../../../controllers/microServices.controller')

const File = require('../../../models/file/file.model')

const {
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
  createWebPreview,
  publishOnline,
  unpublishWebBook,
} = require('../../../controllers/book.controller')

const {
  getBookSettings,
  updateBookSettings,
} = require('../../../controllers/bookSettings.controller')

// const { bookComponent } = require('../../../models')

// const updateAssociatedTemplateHandler = async (
//   _,
//   { bookId, associatedTemplates },
//   ctx,
// ) => {
//   try {
//     logger.info('book resolver: executing updateAssociatedTemplate use case')

//     const pubsub = await pubsubManager.getPubsub()

//     const updatedBook = await updateAssociatedTemplates(
//       bookId,
//       associatedTemplates,
//     )

//     pubsub.publish(BOOK_UPDATED, {
//       bookUpdated: updatedBook.id,
//     })

//     return updatedBook
//   } catch (e) {
//     throw new Error(e)
//   }
// }

const updateBookStatusHandler = async (_, { bookId, status }, ctx) => {
  try {
    logger.info('book resolver: executing updateBookStatus use case')

    const pubsub = await pubsubManager.getPubsub()

    const updatedBook = await updateBookStatus(bookId, status)

    logger.info('book resolver: broadcasting updated book to clients')

    pubsub.publish(BOOK_UPDATED, { bookUpdated: updatedBook.id })

    return updatedBook
  } catch (e) {
    throw new Error(e)
  }
}

const getBookHandler = async (_, { id }, ctx, info) => {
  try {
    logger.info('book resolver: executing getBook use case')
    return getBook(id)
  } catch (e) {
    throw new Error(e)
  }
}

const getBooksHandler = async (_, { options }, ctx) => {
  try {
    const { archived, orderBy, page, pageSize } = options
    logger.info('book resolver: executing getBooks use case')
    return getBooks({
      userId: ctx.user,
      options: { showArchived: archived, orderBy, page, pageSize },
    })
  } catch (e) {
    throw new Error(e)
  }
}

const createBookHandler = async (_, { input }, ctx) => {
  try {
    logger.info('book resolver: executing createBook use case')

    const { collectionId, title, addUserToBookTeams } = input
    const pubsub = await pubsubManager.getPubsub()

    let newBook
    let newUserTeam

    if (addUserToBookTeams && !isEmpty(addUserToBookTeams)) {
      newBook = await createBook({
        collectionId,
        title,
        options: {
          addUserToBookTeams,
          userId: ctx.user,
        },
      })

      const updatedUser = await getUser(ctx.user)

      pubsub.publish(USER_UPDATED, { userUpdated: updatedUser })

      newUserTeam = await getObjectTeam('owner', newBook.id, false)
    } else {
      newBook = await createBook({ collectionId, title })
    }

    logger.info('book resolver: broadcasting new book to clients')

    pubsub.publish(BOOK_CREATED, { bookCreated: newBook.id })

    return { book: newBook, newUserTeam }
  } catch (e) {
    throw new Error(e)
  }
}

const renameBookHandler = async (_, { id, title }, ctx) => {
  try {
    logger.info('book resolver: executing renameBook use case')

    const pubsub = await pubsubManager.getPubsub()

    const renamedBook = await renameBook(id, title)

    logger.info('book resolver: broadcasting renamed book to clients')

    pubsub.publish(BOOK_UPDATED, {
      bookUpdated: renamedBook.id,
    })

    pubsub.publish(BOOK_RENAMED, {
      bookRenamed: renamedBook.id,
    })

    return renamedBook
  } catch (e) {
    throw new Error(e)
  }
}

const updateSubtitleHandler = async (_, { id, subtitle }, ctx) => {
  try {
    logger.info('book resolver: executing updateSubtitle use case')

    const pubsub = await pubsubManager.getPubsub()

    const updatedBook = await updateSubtitle(id, subtitle)

    logger.info('book resolver: broadcasting updated book subtitle to clients')

    pubsub.publish(BOOK_UPDATED, {
      bookUpdated: updatedBook.id,
    })

    return updatedBook
  } catch (e) {
    throw new Error(e)
  }
}

const deleteBookHandler = async (_, args, ctx) => {
  try {
    logger.info('book resolver: executing deleteBook use case')
    const pubsub = await pubsubManager.getPubsub()

    const deletedBook = await deleteBook(args.id)

    logger.info('book resolver: broadcasting deleted book to clients')

    pubsub.publish(BOOK_DELETED, {
      bookDeleted: deletedBook.id,
    })

    return deletedBook
  } catch (e) {
    logger.error(e)
    throw new Error(e)
  }
}

const archiveBookHandler = async (_, { id, archive }, ctx) => {
  try {
    logger.info('book resolver: executing archiveBook use case')
    const pubsub = await pubsubManager.getPubsub()

    const archivedBook = await archiveBook(id, archive)

    logger.info('book resolver: broadcasting archived book to clients')

    pubsub.publish(BOOK_ARCHIVED, {
      bookArchived: archivedBook.id,
    })
    return archivedBook
  } catch (e) {
    throw new Error(e)
  }
}

const updateMetadataHandler = async (_, { input }, ctx) => {
  try {
    logger.info('book resolver: executing updateMetadata use case')
    const pubsub = await pubsubManager.getPubsub()

    const updatedBook = await updateMetadata(input)

    logger.info('book resolver: broadcasting updated book to clients')

    pubsub.publish(BOOK_METADATA_UPDATED, {
      bookMetadataUpdated: updatedBook.id,
    })
    return updatedBook
  } catch (e) {
    throw new Error(e)
  }
}

const updatePODMetadataHandler = async (_, { bookId, metadata }, ctx) => {
  try {
    logger.info('book resolver: executing updatePODMetadata use case')
    const pubsub = await pubsubManager.getPubsub()

    const updatedBook = await updatePODMetadata(bookId, metadata)

    logger.info('book resolver: broadcasting updated book to clients')

    pubsub.publish(BOOK_UPDATED, {
      bookUpdated: updatedBook.id,
    })

    return updatedBook
  } catch (e) {
    throw new Error(e)
  }
}

const exportBookHandler = async (_, { input }, ctx) => {
  const {
    bookId,
    bookComponentId,
    previewer,
    templateId,
    fileExtension,
    icmlNotes,
    additionalExportOptions = {},
  } = input

  logger.info('book resolver: executing exportBook use case')

  return previewer === 'web'
    ? createWebPreview(
        bookId,
        bookComponentId,
        templateId,
        ctx.user,
        additionalExportOptions,
      )
    : exportBook(
        bookId,
        bookComponentId,
        templateId,
        previewer,
        fileExtension,
        icmlNotes,
        additionalExportOptions,
      )
}

const publishOnlineHandler = async (_, { input, profileId }, ctx) => {
  const {
    bookId,
    bookComponentId,
    templateId,
    additionalExportOptions = {},
  } = input

  return publishOnline(
    bookId,
    bookComponentId,
    templateId,
    profileId,
    ctx.user,
    additionalExportOptions,
  )
}

const unpublishOnlineHandler = async (_, { bookId }, ctx) => {
  return unpublishWebBook(bookId)
}

const updateRunningHeadersHandler = async (_, { input, bookId }, ctx) => {
  try {
    logger.info('book resolver: executing updateRunningHeaders use case')
    const pubsub = await pubsubManager.getPubsub()
    const updatedBook = await updateRunningHeaders(input, bookId)

    logger.info('book resolver: broadcasting updated book to clients')

    pubsub.publish(BOOK_RUNNING_HEADERS_UPDATED, {
      bookRunningHeadersUpdated: updatedBook.id,
    })

    return updatedBook
  } catch (e) {
    throw new Error(e)
  }
}

const changeLevelLabelHandler = async (_, { bookId, levelId, label }, ctx) => {
  try {
    logger.info('book resolver: executing changeLevelLabel use case')

    const updatedLevel = await changeLevelLabel(bookId, levelId, label)

    return updatedLevel
  } catch (e) {
    throw new Error(e)
  }
}

const changeNumberOfLevelsHandler = async (
  _,
  { bookId, levelsNumber },
  ctx,
) => {
  try {
    logger.info(
      'book resolver: executing changeBookStructureLevelNumber use case',
    )

    const updatedBookStructure = await changeNumberOfLevels(
      bookId,
      levelsNumber,
    )

    return updatedBookStructure
  } catch (e) {
    throw new Error(e)
  }
}

const updateBookOutlineHandler = async (_, { bookId, outline }, ctx) => {
  try {
    logger.info('book resolver: executing updateBookOutline use case')

    const updatedOutline = await updateBookOutline(bookId, outline)

    return updatedOutline
  } catch (e) {
    throw new Error(e)
  }
}

const getPagedPreviewerLinkHandler = async (
  _,
  { hash, previewerOptions },
  ctx,
) => {
  try {
    logger.info('book resolver: executing getPreviewerLink use case')
    return pagedPreviewerLink(hash, previewerOptions)
  } catch (e) {
    throw new Error(e)
  }
}

const updateLevelContentStructureHandler = async (
  _,
  { bookId, levels },
  cx,
) => {
  try {
    logger.info('book resolver: executing updateLevelContentStructure use case')

    const updatedLevelsStructure = await updateLevelContentStructure(
      bookId,
      levels,
    )

    return updatedLevelsStructure
  } catch (e) {
    throw new Error(e)
  }
}

const finalizeBookStructureHandler = async (_, { bookId }, cx) => {
  try {
    logger.info('book resolver: executing finalizeBookStructure use case')
    const pubsub = await pubsubManager.getPubsub()
    const updatedBook = await finalizeBookStructure(bookId)
    // should add a specific event for the case of finalized
    pubsub.publish(BOOK_ARCHIVED, {
      bookArchived: updatedBook.id,
    })
    return updatedBook.id
  } catch (e) {
    throw new Error(e)
  }
}

const updateShowWelcomeHandler = async (_, { bookId }, cx) => {
  try {
    logger.info('book resolver: executing updateShowWelcome use case')
    const pubsub = await pubsubManager.getPubsub()
    const updatedBook = await updateShowWelcome(bookId)
    // should add a specific event for the case of finalized
    pubsub.publish(BOOK_ARCHIVED, {
      bookArchived: updatedBook.id,
    })
    return updatedBook
  } catch (e) {
    throw new Error(e)
  }
}

const uploadBookThumbnailHandler = async (_, { bookId, file }, cx) => {
  try {
    logger.info('book resolver: uploading book thumbnail')

    const pubsub = await pubsubManager.getPubsub()

    const updatedBook = await uploadBookThumbnail(bookId, file)

    pubsub.publish(BOOK_UPDATED, {
      bookUpdated: updatedBook.id,
    })

    return updatedBook
  } catch (e) {
    throw new Error(e)
  }
}

const uploadBookCoverHandler = async (_, { bookId, file }, cx) => {
  try {
    logger.info('book resolver: uploading book thumbnail')

    const pubsub = await pubsubManager.getPubsub()

    const updatedBook = await uploadBookCover(bookId, file)

    pubsub.publish(BOOK_UPDATED, {
      bookUpdated: updatedBook.id,
    })

    return updatedBook
  } catch (e) {
    throw new Error(e)
  }
}

const updateCoverAltHandler = async (_, { bookId, coverAlt }, cx) => {
  try {
    logger.info("book resolver: updating book's coverAlt")

    const pubsub = await pubsubManager.getPubsub()

    const updatedBook = await updateBookCoverAltText(bookId, coverAlt)

    pubsub.publish(BOOK_UPDATED, {
      bookUpdated: updatedBook.id,
    })

    return updatedBook
  } catch (e) {
    throw new Error(e)
  }
}

const updateBookSettingsHandler = async (_, { bookId, settings }, cx) => {
  try {
    logger.info('book resolver: executing updateBookSettings use case')

    const pubsub = await pubsubManager.getPubsub()

    const updatedBookSettings = await updateBookSettings(bookId, settings)

    pubsub.publish(BOOK_SETTINGS_UPDATED, {
      bookSettingsUpdated: updatedBookSettings.bookId,
    })

    return updatedBookSettings
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  Query: {
    getBook: getBookHandler,
    getPagedPreviewerLink: getPagedPreviewerLinkHandler,
    getBooks: getBooksHandler,
  },
  Mutation: {
    archiveBook: archiveBookHandler,
    createBook: createBookHandler,
    renameBook: renameBookHandler,
    updateSubtitle: updateSubtitleHandler,
    deleteBook: deleteBookHandler,
    exportBook: exportBookHandler,
    publishOnline: publishOnlineHandler,
    unpublishOnline: unpublishOnlineHandler,
    updateMetadata: updateMetadataHandler,
    updatePODMetadata: updatePODMetadataHandler,
    updateRunningHeaders: updateRunningHeadersHandler,
    changeLevelLabel: changeLevelLabelHandler,
    changeNumberOfLevels: changeNumberOfLevelsHandler,
    updateBookOutline: updateBookOutlineHandler,
    updateLevelContentStructure: updateLevelContentStructureHandler,
    updateShowWelcome: updateShowWelcomeHandler,
    finalizeBookStructure: finalizeBookStructureHandler,
    // updateAssociatedTemplates: updateAssociatedTemplateHandler,
    updateBookStatus: updateBookStatusHandler,
    updateBookSettings: updateBookSettingsHandler,
    uploadBookThumbnail: uploadBookThumbnailHandler,
    uploadBookCover: uploadBookCoverHandler,
    updateCoverAlt: updateCoverAltHandler,
  },
  Book: {
    async title(book, _, ctx) {
      const { title } = book

      if (!title) {
        return getBookTitle(book.id)
      }

      return title
    },
    async subtitle(book, _, ctx) {
      const { subtitle } = book

      if (!subtitle) {
        return getBookSubtitle(book.id)
      }

      return subtitle
    },
    divisions(book, _, ctx) {
      return book.divisions
    },
    archived(book, _, ctx) {
      return book.archived
    },
    async bookSettings(book, _, ctx) {
      const bookSettings = await getBookSettings(book.id)
      return bookSettings
    },
    async authors(book, args, ctx, info) {
      const authorsTeam = await getObjectTeam('author', book.id, true)

      let authors = []

      if (authorsTeam && authorsTeam.users.length > 0) {
        authors = authorsTeam.users
      }

      return authors
    },
    async isPublished(book, args, ctx, info) {
      let isPublished = false

      if (book.publicationDate) {
        const date = book.publicationDate
        const inTimestamp = new Date(date).getTime()
        const nowDate = new Date()
        const nowTimestamp = nowDate.getTime()

        if (inTimestamp <= nowTimestamp) {
          isPublished = true
        } else {
          isPublished = false
        }
      }

      return isPublished
    },
    async productionEditors(book, _, ctx) {
      const productionEditorsTeam = await getObjectTeam(
        'productionEditor',
        book.id,
        true,
      )

      let productionEditors = []

      if (productionEditorsTeam && productionEditorsTeam.users.length > 0) {
        productionEditors = map(productionEditorsTeam.users, teamMember => {
          const { givenNames, surname } = teamMember
          return `${givenNames} ${surname}`
        })
      }

      return productionEditors
    },
    async cover(book) {
      const { cover } = book

      if (cover) {
        try {
          return Promise.all(
            cover.map(async c => {
              const { fileId } = c

              try {
                const coverFile = fileId && (await File.findById(fileId))

                if (coverFile) {
                  const coverUrl = await getURL(
                    coverFile.getStoredObjectBasedOnType('original').key,
                  )

                  return {
                    fileId,
                    coverUrl,
                    altText: c.altText,
                  }
                }

                return {}
              } catch (error) {
                logger.error(`Error fetching cover for book ${book.id},`, error)
                return {}
              }
            }),
          )
        } catch (error) {
          logger.error(`Error fetching cover for book ${book.id},`, error)
          return []
        }
      }

      return null
    },
    async thumbnailURL(book) {
      if (book.thumbnailId) {
        try {
          const thumbnailFile = await File.findById(book.thumbnailId)

          if (thumbnailFile) {
            return getURL(thumbnailFile.getStoredObjectBasedOnType('small').key)
          }

          return null
        } catch (error) {
          logger.error(`Error fetching thumbnail for book ${book.id},`, error)
          return null
        }
      }

      return null
    },
  },
  Subscription: {
    bookUpdated: {
      subscribe: async (...args) => {
        const pubsub = await pubsubManager.getPubsub()

        return withFilter(
          () => {
            return pubsub.asyncIterator(BOOK_UPDATED)
          },
          (payload, variables, ctx) => {
            const { id: bookId } = variables
            const { bookUpdated: updatedBookId } = payload

            return bookId === updatedBookId
          },
        )(...args)
      },
    },
    bookArchived: {
      subscribe: async () => {
        const pubsub = await pubsubManager.getPubsub()
        return pubsub.asyncIterator(BOOK_ARCHIVED)
      },
    },
    bookDeleted: {
      subscribe: async (...args) => {
        const pubsub = await pubsubManager.getPubsub()

        return withFilter(
          () => {
            return pubsub.asyncIterator(BOOK_DELETED)
          },
          (_, __, ctx) => {
            const { user } = ctx

            return isAdmin(user)
          },
        )(...args)
      },
    },
    bookRenamed: {
      subscribe: async (...args) => {
        const pubsub = await pubsubManager.getPubsub()

        return withFilter(
          () => {
            return pubsub.asyncIterator(BOOK_RENAMED)
          },
          (_, __, ctx) => {
            const { user } = ctx

            return isAdmin(user)
          },
        )(...args)
      },
    },
    bookMetadataUpdated: {
      subscribe: async () => {
        const pubsub = await pubsubManager.getPubsub()
        return pubsub.asyncIterator(BOOK_METADATA_UPDATED)
      },
    },
    bookRunningHeadersUpdated: {
      subscribe: async () => {
        const pubsub = await pubsubManager.getPubsub()
        return pubsub.asyncIterator(BOOK_RUNNING_HEADERS_UPDATED)
      },
    },
    bookSettingsUpdated: {
      subscribe: async () => {
        const pubsub = await pubsubManager.getPubsub()
        return pubsub.asyncIterator(BOOK_SETTINGS_UPDATED)
      },
    },
  },
}
