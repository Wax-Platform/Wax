const { logger } = require('@coko/server')
const ResourceTree = require('../models/resourceTree/resourceTree.model')
const Template = require('../models/template/template.model')
const defaultTemplate = require('../config/templates/defaultTemplate')
const {
  connectToFileStorage,
} = require('@coko/server/src/services/fileStorage')
const { fetchAndStoreAllTemplates } = require('../services/files.service')

const { CLIENT_SHOW_EMAIL_LOGIN_OPTION } = process.env

const seedDeaultTemplates = async () => {
  const existingTemplate = await Template.query()
  if (!existingTemplate.length) {
    logger.info(
      '\n\x1b[33mNo Templates Found on system, Seeding Default Template\n',
    )
    await Template.query().insert(defaultTemplate)
    connectToFileStorage()
    await fetchAndStoreAllTemplates()
    logger.info('\x1b[34m Templates Seeding Completed')
  }
  logger.info('Skipping templates seeding, templates already exists!')
}

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
  await seedDeaultTemplates()
}

module.exports = seedResourceTree
