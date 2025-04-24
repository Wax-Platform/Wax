const { logger } = require('@coko/server')
const { Book } = require('@pubsweet/models')

exports.up = async knex => {
  try {
    await knex.schema.table('book', table => {
      table.integer('status').defaultTo(0)
    })

    // Update status for all existing books
    return Book.query().patch({ status: 0 })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Book: adding status failed`)
  }
}

exports.down = async knex => {
  try {
    return knex.schema.table('book', table => {
      table.dropColumn('status')
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Book: removing status failed`)
  }
}
