const systemInfo = require('../../../controllers/systemInfo.controller')

const getSystemInfoHandler = async () => {
  try {
    return systemInfo.getSystemInfo()
  } catch (e) {
    throw new Error(e)
  }
}

const resolvers = {
  Query: {
    systemInfo: getSystemInfoHandler,
  },
}

module.exports = resolvers
