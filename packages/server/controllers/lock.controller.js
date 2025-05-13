const { useTransaction } = require('@coko/server')
const moment = require('moment')
const config = require('config')

const { Lock } = require('../models').models

const timePadding = 0.3

const heartbeatIntervalInSeconds = (config.wsHeartbeatInterval || 5000) / 1000

const inactiveLockTimeFactor = heartbeatIntervalInSeconds + timePadding

const updateLastActiveAt = async (
  bookComponentId,
  tabId,
  userId,
  options = {},
) => {
  try {
    const { trx } = options

    if (!bookComponentId || !tabId || !userId) {
      throw new Error(
        'bookComponentId, tabId and userId are required in order to update lastActiveAt property',
      )
    }

    return useTransaction(
      async tr =>
        Lock.query(tr).patch({ lastActiveAt: moment().utc().toDate() }).where({
          foreignId: bookComponentId,
          userId,
          tabId,
        }),
      { trx },
    )
  } catch (e) {
    throw new Error(e)
  }
}

const getInactiveLocks = async (options = {}) => {
  try {
    const { trx } = options
    return Lock.query(trx).whereRaw(
      `TIMEZONE('UTC',last_active_at) < TIMEZONE('UTC',NOW()) - INTERVAL '${inactiveLockTimeFactor} SECONDS'`,
    )
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  updateLastActiveAt,
  getInactiveLocks,
}
