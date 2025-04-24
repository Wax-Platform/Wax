const { logger } = require('@coko/server')
const config = require('config')

exports.up = async knex => {
  try {
    await knex.schema.table('template', table => {
      table.text('url').defaultTo(null)
    })

    const configTemplates = config.get('templates')

    return Promise.all(
      configTemplates.map(async template => {
        await knex('template')
          .where('name', template.label)
          .update('url', template.url)
      }),
    )
  } catch (e) {
    logger.error(e)
    throw new Error('Migration: Template: addded url column successfully.')
  }
}

exports.down = async knex => {
  try {
    return knex.schema.table('book', table => {
      table.dropColumn('url')
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Template: removing url column failed`)
  }
}
