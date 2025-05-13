const { logger, Team } = require('@coko/server')

exports.up = async knex => {
  try {
    const tableExists = await knex.schema.hasTable('teams')

    if (tableExists) {
      return Team.query()
        .delete()
        .where({ objectType: null, objectId: null, global: false })
    }

    return false
  } catch (e) {
    logger.error(e)
    throw new Error(
      `Migration: Teams: deleting teams with null objectType, objectId and global false`,
    )
  }
}

exports.down = async () => {}
