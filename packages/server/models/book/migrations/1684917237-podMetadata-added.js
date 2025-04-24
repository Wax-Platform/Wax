const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.alterTable('Book', table => {
      table.jsonb('podMetadata')
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Book: adding podMetadata failed`)
  }
}
