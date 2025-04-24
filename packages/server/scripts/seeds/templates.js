const { logger, useTransaction } = require('@coko/server')
const find = require('lodash/find')
const path = require('path')
const fs = require('fs-extra')
const config = require('config')

const { getTemplates, persistTemplates } = require('../helpers/templates')

const seedTemplates = async () => {
  let templatesFolder

  try {
    const normalizedTemplates = config.has('templates')
      ? config.get('templates').map(t => ({
          label: t.label.toLowerCase(),
          url: t.url,
          default: t.default || false,
          assetsRoot: t.assetsRoot.replace(/^\/+/, '').replace(/\/+$/, ''),
          supportedNoteTypes: t.supportedNoteTypes,
        }))
      : undefined

    if (!normalizedTemplates) {
      logger.info('not templates defined in the config for automatic fetching')
      return
    }

    await getTemplates()

    templatesFolder = path.join(__dirname, '..', '..', 'templates')

    if (!fs.existsSync(templatesFolder)) {
      throw new Error(
        'something went wrong and your defined templates were not fetched correctly',
      )
    }

    const fetchedTemplates = await fs.readdir(templatesFolder)
    await useTransaction(async trx =>
      Promise.all(
        fetchedTemplates.map(async templateFolder => {
          const sourceRoot = path.join(
            __dirname,
            '..',
            '..',
            'templates',
            templateFolder,
          )

          const raw = fs.readFileSync(path.join(sourceRoot, 'template.json'))
          const manifest = JSON.parse(raw)

          const { name: originalName, author, target, thumbnailFile } = manifest
          const name = originalName.toLowerCase()

          const templateConfig = find(normalizedTemplates, {
            label: name,
          })

          if (!templateConfig) {
            return
          }

          logger.info('******* Create Templates script is starting ********')

          if (
            !templateConfig.supportedNoteTypes ||
            templateConfig.supportedNoteTypes.length === 0
          ) {
            throw new Error(
              'supportedNoteTypes is required for the creation of templates, please check your templates config',
            )
          }

          const { supportedNoteTypes } = templateConfig

          const foundTemplateConfig = find(normalizedTemplates, {
            label: name,
          })

          await persistTemplates(
            {
              name,
              url: templateConfig.url,
              target,
              supportedNoteTypes,
              author,
              thumbnailFile,
              shouldBeDefault: foundTemplateConfig?.default || false,
              sourceRoot,
            },
            {
              trx,
            },
          )

          logger.info(
            `******* Create Templates script for ${name} finished successfully ********`,
          )
        }),
      ),
    )
    await fs.remove(templatesFolder)
    logger.info('******* Templates folder removed ********')
  } catch (e) {
    fs.remove(templatesFolder)
    throw new Error(e.message)
  }
}

module.exports = seedTemplates
