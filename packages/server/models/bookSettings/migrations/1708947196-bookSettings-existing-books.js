const { logger, uuid } = require('@coko/server')

// create record in book_settings table for each existing book.
// If book_settings record already exists, skip.
exports.up = async knex => {
  try {
    const books = await knex('book').select('id')

    const bookSettings = books.map(async book => {
      const existingBookSettings = await knex('book_settings')
        .where('bookId', book.id)
        .select('id')
        .first()

      if (existingBookSettings) return undefined

      return {
        id: uuid(),
        type: 'bookSettings',
        bookId: book.id,
      }
    })

    const filteredBookSettings = await Promise.all(bookSettings)

    const filteredBookSettingsWithoutUndefined = filteredBookSettings.filter(
      bookSetting => bookSetting !== undefined,
    )

    if (filteredBookSettingsWithoutUndefined.length === 0) {
      logger.info('No new book settings to insert.')
      return
    }

    return knex('book_settings').insert(filteredBookSettingsWithoutUndefined)
    
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Book Settings: existing books migration failed`)
  }
}

exports.down = async () => {}

