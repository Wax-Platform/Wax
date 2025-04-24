const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.table('book_settings', table => {
      table.boolean('aiPdfDesignerOn').defaultTo(false)
    })
  } catch (e) {
    logger.error(e)
    throw new Error(
      'Migration: Book Settings: add aiPdfDesignerOn column failed',
    )
  }
}

exports.down = knex =>
  knex.schema.table('book_settings', table =>
    table.dropColumn('aiPdfDesignerOn'),
  )
