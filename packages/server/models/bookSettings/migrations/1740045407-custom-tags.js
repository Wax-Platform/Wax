const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.table('book_settings', table => {
      table.jsonb('customTags').defaultTo(null)
    })
  } catch (e) {
    logger.error(e)
    throw new Error('Migration: Book Settings: add custom Tags column failed')
  }
}

exports.down = knex =>
  knex.schema.table('book_settings', table => {
    table.dropColumn('customTags')
  })
