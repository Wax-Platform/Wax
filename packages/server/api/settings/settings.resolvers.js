const {
  updateSettings,
  getSettings,
} = require('../../controllers/settings.controller')

const updateSettingsResolver = async (_, { settings }, context) => {
  try {
    await updateSettings(settings)
    return settings
  } catch (error) {
    throw new Error(error)
  }
}

const getSettingsResolver = async () => {
  try {
    const settings = await getSettings()
    return settings
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  Query: {
    getSettings: getSettingsResolver,
  },
  Mutation: {
    updateSettings: updateSettingsResolver,
  },
}
