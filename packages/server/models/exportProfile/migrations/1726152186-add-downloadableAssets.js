const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.table('export_profiles', table => {
      table.jsonb('downloadableAssets').defaultTo(null)
    })
  } catch (e) {
    logger.error(e)
    throw new Error(
      `Migration: Export Profiles: add "downloadableAssets" failed`,
    )
  }
}

exports.down = async knex => {
  try {
    return knex.schema.table('export_profiles', table => {
      table.dropColumn('downloadableAssets')
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Export Profiles: drop "downloadableAssets"`)
  }
}
