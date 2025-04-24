const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    const tableExists = await knex.schema.hasTable('files')

    if (tableExists) {
      const hasStoredObjects = await knex.schema.hasColumn(
        'files',
        'stored_objects',
      )

      if (!hasStoredObjects) {
        await knex.schema.alterTable('files', table => {
          table.jsonb('storedObjects').notNullable().defaultTo({})
        })
      }
    }

    return true
  } catch (e) {
    logger.error(e)
    throw new Error(
      `Migration: Files: renaming file table to files table failed`,
    )
  }
}
