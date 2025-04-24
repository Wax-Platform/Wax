const { logger } = require('@coko/server')
const { Template } = require('@pubsweet/models')
const config = require('config')
const find = require('lodash/find')

exports.up = async knex => {
  try {
    await knex.schema.table('template', table => {
      table.boolean('default').defaultTo(false)
    })

    await Template.query().patch({ default: false })

    const normalizedTemplates = config.has('templates')
      ? config.get('templates').map(t => ({
          label: t.label.toLowerCase(),
          url: t.url,
          default: t.default || false,
          assetsRoot: t.assetsRoot.replace(/^\/+/, '').replace(/\/+$/, ''),
          supportedNoteTypes: t.supportedNoteTypes,
        }))
      : undefined

    const defaultTemplate = find(normalizedTemplates, { default: true })

    if (defaultTemplate) {
      await Template.query()
        .patch({ default: true })
        .where({ name: defaultTemplate.label })
    }

    return true
  } catch (e) {
    logger.error(e)
    throw new Error(
      'Migration: Template: adding new default column and setting its value to false failed',
    )
  }
}

exports.down = async knex => {
  try {
    return knex.schema.table('template', table => {
      table.dropColumn('default')
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Template: removing default column failed`)
  }
}
