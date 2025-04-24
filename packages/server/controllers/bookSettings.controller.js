const { useTransaction, logger } = require('@coko/server')

const { BookSettings } = require('../models').models

const createBookSettings = async (bookSettingData, options = {}) => {
  try {
    const { trx } = options
    logger.info(
      `createBookSettings: creating BookSettings for the book with id ${bookSettingData.bookId}`,
    )

    return useTransaction(
      async tr => BookSettings.insert(bookSettingData, { trx: tr }),
      {
        trx,
      },
    )
  } catch (e) {
    throw new Error(e)
  }
}

const getBookSettings = async (bookId, options = {}) => {
  try {
    const { trx } = options

    return BookSettings.findOne({ bookId }, { trx })
  } catch (e) {
    throw new Error(e)
  }
}

const updateBookSettings = async (bookId, settings, options = {}) => {
  try {
    const { trx } = options
    logger.info(
      `updateBookSettings: updating BookSettings for the book with id ${bookId}`,
    )

    return useTransaction(
      async tr => {
        const bookSetting = await BookSettings.query(tr)
          .patch(settings)
          .where({ bookId })
          .returning('*')
          .first()

        if (!bookSetting) {
          throw new Error('No book setting found')
        }

        return bookSetting
      },
      {
        trx,
      },
    )
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  createBookSettings,
  getBookSettings,
  updateBookSettings,
}
