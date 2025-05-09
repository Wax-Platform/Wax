const { logger, subscriptionManager } = require('@coko/server')

const {
  createDocument,
  getDocuments,
  deleteFolder,
  getFileContents,
} = require('../../../controllers/document.controller')

const { KB_UPDATED } = require('./constants')
const { Document } = require('../../../models')

const createDocumentResolver = async (_, { file, maxLng, bookId }, ctx) => {
  try {
    const document = await createDocument({ file, maxLng, bookId })

    subscriptionManager.publish(`${KB_UPDATED}.${bookId}`, { kbUpdated: document.id })

    return document
  } catch (error) {
    throw new Error(error)
  }
}

const getDocumentsResolver = async (_, { bookId }) => {
  try {
    const documents = await getDocuments(bookId)
    return documents
  } catch (error) {
    throw new Error(error)
  }
}

const deleteFolderResolver = async (_, { id, bookId }, context) => {
  try {
    await deleteFolder(id)

    const pubsub = await getPubsub()
    subscriptionManager.publish(`${KB_UPDATED}.${bookId}`, { kbUpdated: id })

    return true
  } catch (error) {
    logger.error('Error deleting folder:', error)
    throw new Error('Failed to delete folder')
  }
}

const getFilesFromDocumentResolver = async (_, { id, start, length }, ctx) => {
  try {
    const slicedStoredObjectKeys = await Document.getSlicedSectionsKeysById(
      id,
      start,
      length,
    )

    logger.info(`\x1b[33m ${JSON.stringify(slicedStoredObjectKeys)}`)

    const files = await Promise.all(
      slicedStoredObjectKeys.map(key => getFileContents(key)),
    )

    return files
  } catch (error) {
    logger.error('Error getting files')
    throw new Error('Failed to get files')
  }
}

module.exports = {
  Query: {
    getDocuments: getDocumentsResolver,
    getFilesFromDocument: getFilesFromDocumentResolver,
  },
  Mutation: {
    createDocument: createDocumentResolver,
    deleteFolder: deleteFolderResolver,
  },
  Subscription: {
    kbUpdated: {
      subscribe: async (_payload, vars) => {
        
        return subscriptionManager.asyncIterator(`${KB_UPDATED}.${vars.bookId}`)
      },
    },
  },
}
