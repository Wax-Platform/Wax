/* eslint-disable no-console */
const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.table('docs', table => {
      table.uuid('templateId').references('id').inTable('templates')
    })
  } catch (e) {
    // logger.error('Doc: Add templateId: Migration failed!')
    throw new Error(e)
  }
}

exports.down = async knex => {
  try {
    return knex.schema.table('docs', table => {
      table.dropColumn('templateId')
    })
  } catch (e) {
    // logger.error('Doc: Remove templateId: Migration failed!')
    throw new Error(e)
  }
}
