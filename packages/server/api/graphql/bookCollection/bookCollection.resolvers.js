const { logger, pubsubManager } = require('@coko/server')

const { BookCollectionTranslation } = require('../../../models').models

const {
  getBookCollection,
  getBookCollections,
  createBookCollection,
} = require('../../../controllers/bookCollection.controller')

const { getBooks } = require('../../../controllers/book.controller')

const { COLLECTION_ADDED } = require('./constants')

const getBookCollectionHandler = async (_, { input }, ctx) => {
  try {
    const { id } = input

    logger.info(
      'book collection resolver: executing getBookCollection use case',
    )

    return getBookCollection(id)
  } catch (e) {
    throw new Error(e)
  }
}

const getBookCollectionsHandler = async (_, __, ctx) => {
  try {
    logger.info(
      'book collection resolver: executing getBookCollections use case',
    )

    return getBookCollections()
  } catch (e) {
    throw new Error(e)
  }
}

const createBookCollectionHandler = async (_, { input }, ctx) => {
  try {
    const pubsub = await pubsubManager.getPubsub()
    const { title, languageIso } = input

    logger.info(
      'book collection resolver: executing createBookCollection use case',
    )

    const createdBookCollection = await createBookCollection(title, languageIso)

    logger.info(
      'book collection resolver: broadcasting new book collection to clients',
    )

    pubsub.publish(COLLECTION_ADDED, {
      collectionAdded: createdBookCollection.id,
    })

    return createdBookCollection
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  Query: {
    getBookCollection: getBookCollectionHandler,
    getBookCollections: getBookCollectionsHandler,
  },
  Mutation: {
    createBookCollection: createBookCollectionHandler,
  },
  BookCollection: {
    async title(bookCollection, _, ctx) {
      const bookCollectionTranslation = await BookCollectionTranslation.findOne(
        { collectionId: bookCollection.id, languageIso: 'en' },
      )

      return bookCollectionTranslation.title
    },
    async books(bookCollection, { ascending, sortKey, archived }, ctx, info) {
      const { result: books } = await getBooks({
        collectionId: bookCollection.id,
        userId: ctx.user,
        options: {
          showArchived: archived,
          orderBy: { column: sortKey, order: ascending ? 'asc' : 'desc' },
        },
      })

      return books
    },
  },
  Subscription: {
    collectionAdded: {
      subscribe: async () => {
        const pubsub = await pubsubManager.getPubsub()
        return pubsub.asyncIterator(COLLECTION_ADDED)
      },
    },
  },
}
