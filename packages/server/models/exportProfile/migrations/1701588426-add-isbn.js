const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.table('export_profiles', table => {
      table.string('isbn', 20)
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Export Profiles: add "isbn" failed`)
  }
}

exports.down = async knex => {
  try {
    return knex.schema.table('export_profiles', table => {
      table.dropColumn('isbn')
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Export Profiles: drop "isbn" failed`)
  }
}
