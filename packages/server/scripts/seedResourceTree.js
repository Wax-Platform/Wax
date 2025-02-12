const { logger, useTransaction } = require('@coko/server')
const ResourceTree = require('../models/resourceTree/resourceTree.model')
const Template = require('../models/template/template.model')
const defaultTemplate = require('../config/templates/defaultTemplate')
const {
  connectToFileStorage,
} = require('@coko/server/src/services/fileStorage')
const { fetchAndStoreAllTemplates } = require('../services/files.service')
const fs = require('fs')
const path = require('path')
const { kebabCase } = require('lodash')
const { capitalize } = require('lodash')

const extractSnippetsFromCSS = async filePath => {
  const fileName = path.basename(filePath, path.extname(filePath))
  const prefix = kebabCase(fileName)

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err)
      return
    }

    const snippets = []
    const sections = data.split('/* - */')

    sections.forEach(section => {
      const lines = section.trim().split('\n')
      const metaLine = lines.find(line => line.startsWith('/*'))
      const meta = {
        description: metaLine
          ? metaLine.replace(/\/\*|\*\//g, '').trim()
          : 'No description',
      }
      let rawCss = lines
        .filter(line => !line.startsWith('/*'))
        .join('\n')
        .trim()
      const classNameMatch = rawCss.match(/\.(\w[\w-]*)/)
      const className = classNameMatch
        ? `${prefix}_${classNameMatch[1]}`
        : 'No class name'

      const displayName = classNameMatch
        ? capitalize(classNameMatch[1].replace(/-/g, ' '))
        : 'No class name'

      meta.className = className
      rawCss = rawCss.replace(/\.(\w[\w-]*)/, `.${className}`)

      if (rawCss) {
        snippets.push({
          rawCss,
          meta,
          displayName,
          category: 'snippet',
          status: 'public',
        })
      }
    })

    return useTransaction(async trx =>
      Promise.all(snippets.map(snippet => Template.query(trx).insert(snippet))),
    )
  })
}

const { CLIENT_SHOW_EMAIL_LOGIN_OPTION } = process.env

const seedDeaultTemplates = async () => {
  const filePath = path.join(
    __dirname,
    '..',
    'config',
    'templates',
    'snippets',
    'system-snippets.css',
  )
  const existingSnippets = await Template.query().where('category', 'snippet')

  if (!existingSnippets.length) {
    logger.info(
      '\n\x1b[33mNo Snippets Found on system, Seeding Default Snippets\n',
    )
    await extractSnippetsFromCSS(filePath)
    logger.info('\x1b[34m Snippets Seeding Completed')
  }

  const existingTemplate = await Template.query().where('category', 'system')
  if (!existingTemplate.length) {
    logger.info(
      '\n\x1b[33mNo Templates Found on system, Seeding Default Template\n',
    )
    await Template.query().insert(defaultTemplate)
    connectToFileStorage()
    await fetchAndStoreAllTemplates()
    logger.info('\x1b[34m Templates Seeding Completed')
    return
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
