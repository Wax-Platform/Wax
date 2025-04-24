const { logger } = require('@coko/server')
const { Book } = require('@pubsweet/models')

exports.up = async knex => {
  try {
    await knex.schema.table('book', table => {
      table.uuid('thumbnailId').nullable().defaultTo(null)
    })

    return Book.query().patch({ thumbnailId: null })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Book: adding thumbnailId column failed`)
  }
}

exports.down = async knex => {
  try {
    return knex.schema.table('book', table => {
      table.dropColumn('thumbnailId')
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Book: removing thumbnailId column failed`)
  }
}
