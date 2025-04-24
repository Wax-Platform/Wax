const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.table('book_settings', table => {
      table.boolean('customPromptsOn').defaultTo(false)
    })
  } catch (e) {
    logger.error(e)
    throw new Error(
      'Migration: Book Settings: add customPromptsOn column failed',
    )
  }
}

exports.down = knex =>
  knex.schema.table('book_settings', table => {
    table.dropColumn('customPromptsOn')
  })
