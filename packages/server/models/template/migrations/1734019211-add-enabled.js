const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    await knex.schema.table('template', table => {
      table.boolean('enabled').defaultTo(true)
    })
  } catch (e) {
    logger.error(e)
    throw new Error('Migration: Template: added `enabled` column successfully.')
  }
}

exports.down = async knex => {
  try {
    return knex.schema.table('book', table => {
      table.dropColumn('enabled')
    })
  } catch (e) {
    logger.error(e)
    throw new Error('Migration: Template: removing `enabled` column failed')
  }
}
