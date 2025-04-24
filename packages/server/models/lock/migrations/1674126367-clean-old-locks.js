const { logger } = require('@coko/server')

// /* eslint-disable import/no-unresolved */
// const Lock = require('../models/lock/lock.model')
// /* eslint-enable import/no-unresolved */
const { Lock } = require('@pubsweet/models')

exports.up = async knex => {
  try {
    return Lock.query().delete().where({})
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Locks: deleting old data failed`)
  }
}
