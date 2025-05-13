const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.alterTable('Book', table => {
      table.uuid('collectionId').alter().nullable()
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Book: making collectionId optional failed`)
  }
}

exports.down = async knex => {
  try {
    return knex.schema.alterTable('Book', table => {
      table.uuid('collectionId').notNullable()
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Book: removing collectionId optional failed`)
  }
}
