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

exports.down = async knex => {
  try {
    return knex.schema.alterTable('Book', table => {
      table.dropColumn('podMetadata')
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Book: removing podMetadata failed`)
  }
}
