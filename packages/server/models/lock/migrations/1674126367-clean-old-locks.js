const { logger } = require('@coko/server')

const Lock = require('../lock.model')

exports.up = async () => {
  try {
    return Lock.query().delete().where({})
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Locks: deleting old data failed`)
  }
}

exports.down = async () => {}
