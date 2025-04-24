const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.table('book_settings', table => {
      table.boolean('knowledgeBaseOn').defaultTo(false)
    })
  } catch (e) {
    logger.error(e)
    throw new Error(
      'Migration: Book Settings: add knowledgeBaseOn column failed',
    )
  }
}

exports.down = knex =>
  knex.schema.table('book_settings', table =>
    table.dropColumn('knowledgeBaseOn'),
  )
