const { logger } = require('@coko/server')

/* eslint-disable import/no-unresolved */
// const Team = require('../models/team/team.model')
/* eslint-enable import/no-unresolved */

const { Team } = require('@pubsweet/models')

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