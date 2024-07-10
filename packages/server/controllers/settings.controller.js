const { useTransaction, logger } = require('@coko/server')
const { Settings } = require('../models')

const getSettings = async () => {
  logger.info(`getSettings`)

  try {
    return Settings.getSettings()
  } catch (error) {
    logger.error(`getSettings failed: ${error}`)
    throw new Error(`getSettings failed: ${error}`)
  }
}

const updateSettings = async (newSettings, options = {}) => {
  try {
    const { trx } = options

    return useTransaction(
      async tr => {
        logger.info(`Updating settings`)
        const currentSettings = await Settings.query().first()

        if (!currentSettings) {
          logger.info('Settings not found creating new')
          Settings.insert({ ...newSettings })
          return newSettings
        }

        logger.info(`Setting exists`)
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`Error updating settings: ${e.message}`)
    throw new Error(e)
  }
}

module.exports = { updateSettings, getSettings }
