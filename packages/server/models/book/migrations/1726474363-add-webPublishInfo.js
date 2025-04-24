const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.table('book', table => {
      table.jsonb('webPublishInfo').defaultTo(null)
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Book: add "webPublishInfo" failed`)
  }
}

exports.down = async knex => {
  try {
    return knex.schema.table('book', table => {
      table.dropColumn('webPublishInfo')
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Book: drop "webPublishInfo" failed`)
  }
}
