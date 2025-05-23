const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.alterTable('book_translation', table => {
      table.text('title').alter().nullable()
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Book Translation: making title optional failed`)
  }
}

exports.down = async knex => {
  try {
    return knex.schema.alterTable('book_translation', table => {
      table.text('title').notNullable()
    })
  } catch (e) {
    logger.error(e)
    throw new Error(
      `Migration: Book Translation: removing title optional failed`,
    )
  }
}
