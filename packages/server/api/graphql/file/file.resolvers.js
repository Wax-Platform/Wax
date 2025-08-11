const { logger, fileStorage, subscriptionManager } = require('@coko/server')

const map = require('lodash/map')

const { BookComponent } = require('../../../models').models

const {
  updateFile,
  deleteFiles,
  getEntityFiles,
  getFiles,
  getSpecificFiles,
  createFile,
  getFile,
} = require('../../../controllers/file.controller')

const { imageFinder } = require('../../../utilities/image')

const { FILES_UPLOADED, FILE_UPDATED, FILES_DELETED } = require('./constants')

const getEntityFilesHandler = async (_, { input }, ctx) => {
  try {
    const { entityId, sortingParams, includeInUse = false } = input
    const files = await getEntityFiles(entityId, sortingParams)

    if (includeInUse) {
      const bookComponentsOfBook = await BookComponent.query()
        .select('book_component.id', 'book_component_translation.content')
        .leftJoin(
          'book_component_translation',
          'book_component.id',
          'book_component_translation.book_component_id',
        )
        .where({
          'book_component.book_id': entityId,
          'book_component.deleted': false,
          languageIso: 'en',
        })

      files.forEach(file => {
        const foundIn = []
        bookComponentsOfBook.forEach(bookComponent => {
          const { content, id } = bookComponent

          if (imageFinder(content, file.id)) {
            foundIn.push(id)
          }
        })
        /* eslint-disable no-param-reassign */
        file.inUse = foundIn.length > 0
        /* eslint-enable no-param-reassign */
      })
    }

    return files
  } catch (e) {
    logger.error(e)
    throw new Error(e)
  }
}

const getSpecificFilesHandler = async (_, { ids }, ctx) => {
  try {
    return getSpecificFiles(ids)
  } catch (e) {
    logger.error(e)
    throw new Error(e)
  }
}

const getFilesHandler = async (_, __, ctx) => {
  try {
    return getFiles()
  } catch (e) {
    logger.error(e)
    throw new Error(e)
  }
}

const getFileHandler = async (_, { id }, ctx) => {
  try {
    return getFile(id)
  } catch (e) {
    logger.error(e)
    throw new Error(e)
  }
}

const uploadFilesHandler = async (_, { files, entityId }, ctx) => {
  try {
    const uploadedFiles = await Promise.all(
      map(files, async file => {
        const { createReadStream, filename } = await file
        const fileStream = createReadStream()

        return createFile(fileStream, filename, null, null, [], entityId)
      }),
    )

    subscriptionManager.publish(FILES_UPLOADED, {
      filesUploaded: true,
    })
    return uploadedFiles
  } catch (e) {
    logger.error(e)
    throw new Error(e)
  }
}

const updateFileHandler = async (_, { input }, ctx) => {
  try {
    const { id, name, alt, caption } = input

    const updatedFile = await updateFile(id, { name, alt, caption })
    subscriptionManager.publish(FILE_UPDATED, {
      fileUpdated: updatedFile.id,
    })
    return updatedFile
  } catch (e) {
    logger.error(e)
    throw new Error(e)
  }
}

const deleteFilesHandler = async (_, { ids, remoteToo }, ctx) => {
  try {
    let deletedFiles

    if (remoteToo) {
      deletedFiles = await deleteFiles(ids, remoteToo)
    } else {
      deletedFiles = await deleteFiles(ids)
    }

    subscriptionManager.publish(FILES_DELETED, {
      filesDeleted: true,
    })
    return deletedFiles
  } catch (e) {
    logger.error(e)
    throw new Error(e)
  }
}

module.exports = {
  Query: {
    getEntityFiles: getEntityFilesHandler,
    getSpecificFiles: getSpecificFilesHandler,
    getFiles: getFilesHandler,
    getFile: getFileHandler,
  },
  Mutation: {
    uploadFiles: uploadFilesHandler,
    updateFile: updateFileHandler,
    deleteFiles: deleteFilesHandler,
  },
  File: {
    async url(file, { size }, ctx) {
      return fileStorage.getURL(file.getStoredObjectBasedOnType(size).key, {
        expiresIn: 10,
      })
    },
    // async mimetype(file, { target }, ctx) {
    //   if (target && target === 'editor') {
    //     return file.getStoredObjectBasedOnType('medium').mimetype
    //   }

    //   return file.getStoredObjectBasedOnType('original').mimetype
    // },
    // ## for now in use will be computed in the parent query
    // ## as a workaround of the connection pool timeouts
    // ## this is not permanent
    // async inUse({ id, mimetype, bookId }, _, ctx) {
    //   let inUse = []
    //   if (mimetype.match(/^image\//)) {
    //     inUse = await useCaseIsFileInUse(bookId, id)
    //   }
    //   return inUse.length > 0
    // },
  },
  Subscription: {
    filesUploaded: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(FILES_UPLOADED)
      },
    },
    filesDeleted: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(FILES_DELETED)
      },
    },
    fileUpdated: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(FILE_UPDATED)
      },
    },
  },
}
