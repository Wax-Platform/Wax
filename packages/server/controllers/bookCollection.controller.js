const { logger, useTransaction } = require('@coko/server')

const { BookCollectionTranslation, BookCollection } =
  require('../models').models

const getBookCollection = async (id, options = {}) => {
  try {
    const { trx } = options
    logger.info(`>>> fetching book collection with id ${id}`)

    const bookCollection = await useTransaction(
      async tr =>
        BookCollection.findOne(
          {
            id,
            deleted: false,
          },
          { trx: tr },
        ),
      { trx, passedTrxOnly: true },
    )

    if (!bookCollection) {
      throw Error(`book collection with id ${id} does not exist`)
    }

    return bookCollection
  } catch (e) {
    throw new Error(e)
  }
}

const getBookCollections = async (options = {}) => {
  try {
    const { trx } = options
    logger.info(`>>> fetching all book collections`)

    return useTransaction(
      async tr => {
        const { result: bookCollections } = await BookCollection.find(
          { deleted: false },
          { trx: tr },
        )

        return bookCollections
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    throw new Error(e)
  }
}

const createBookCollection = async (
  title,
  languageIso = 'en',
  options = {},
) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        logger.info('>>> creating a new books collection')

        const createdBookCollection = await BookCollection.insert(
          {},
          { trx: tr },
        )

        logger.info(
          `>>> books collection created with id: ${createdBookCollection.id}`,
        )

        logger.info('>>> creating a new books collection translation')

        const createdBookCollectionTranslation =
          await BookCollectionTranslation.insert(
            {
              collectionId: createdBookCollection.id,
              languageIso,
              title,
            },
            { trx: tr },
          )

        logger.info(
          `>>> books collection translation created with id: ${createdBookCollectionTranslation.id}`,
        )

        return createdBookCollection
      },
      { trx },
    )
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  getBookCollection,
  getBookCollections,
  createBookCollection,
}
