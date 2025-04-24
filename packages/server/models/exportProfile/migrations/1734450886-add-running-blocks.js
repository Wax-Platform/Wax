const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.table('export_profiles', table => {
      table.jsonb('runningBlocks').defaultTo({})
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Export Profiles: add "runningBlocks" failed`)
  }
}

exports.down = async knex => {
  try {
    return knex.schema.table('export_profiles', table => {
      table.dropColumn('runningBlocks')
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Export Profiles: drop "runningBlocks"`)
  }
}
