const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    const tableExists = await knex.schema.hasTable('file')

    if (tableExists) {
      return knex.schema.renameTable('file', 'files')
    }

    return false
  } catch (e) {
    logger.error(e)
    throw new Error(
      `Migration: Files: renaming file table to files table failed`,
    )
  }
}
