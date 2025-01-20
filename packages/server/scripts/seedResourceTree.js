const { logger } = require('@coko/server')
const ResourceTree = require('../models/resourceTree/resourceTree.model')
const { CLIENT_SHOW_EMAIL_LOGIN_OPTION } = process.env
const seedResourceTree = async () => {
  logger.info('Seeding Resource')
  if (CLIENT_SHOW_EMAIL_LOGIN_OPTION == 'false') {
    logger.info('Loginless mode detected')
    const rootFolder = await ResourceTree.findRootFolderOfUser()
    if (!rootFolder) {
      logger.info('building Root Folder for Loginless mode')
      await ResourceTree.createUserRootFolder()
    }
  }
}

module.exports = seedResourceTree
