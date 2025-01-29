/* eslint-disable no-console */
const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    await knex.schema.alterTable('docs', table => {
      table.dropForeign('templateId')
      table
        .uuid('templateId')
        .references('id')
        .inTable('templates')
        .onDelete('CASCADE')
        .alter()
    })
  } catch (e) {
    logger.error('Docs: Modify templateId foreign key: Migration failed!', e)
    throw new Error(e)
  }
}

exports.down = async knex => {
  try {
    await knex.schema.alterTable('docs', table => {
      table.dropForeign('templateId')
      table.uuid('templateId').references('id').inTable('templates').alter()
    })
  } catch (e) {
    logger.error('Docs: Revert templateId foreign key: Migration failed!', e)
    throw new Error(e)
  }
}
