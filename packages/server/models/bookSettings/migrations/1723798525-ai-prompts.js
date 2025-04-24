const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.table('book_settings', table => {
      table.jsonb('customPrompts').defaultTo(null)
      table.boolean('freeTextPromptsOn').defaultTo(true)
    })
  } catch (e) {
    logger.error(e)
    throw new Error(
      'Migration: Book Settings: add customPrompts & freeTextPromptsOn column failed',
    )
  }
}

exports.down = knex =>
  knex.schema.table('book_settings', table => {
    table.dropColumn('customPrompts')
    table.dropColumn('freeTextPromptsOn')
  })
