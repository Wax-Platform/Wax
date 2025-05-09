const { logger } = require('@coko/server')
const config = require('config')
const find = require('lodash/find')

exports.up = async knex => {
  try {
    // Add "default" column to "template" table
    await knex.schema.table('template', table => {
      table.boolean('default').defaultTo(false)
    })

    // Set all rows to default = false
    await knex('template').update({ default: false })

    // Load templates from config
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

    // If there's a default template defined in config, set it
    if (defaultTemplate) {
      await knex('template')
        .where({ name: defaultTemplate.label })
        .update({ default: true })
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
    await knex.schema.table('template', table => {
      table.dropColumn('default')
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Template: removing default column failed`)
  }
}
