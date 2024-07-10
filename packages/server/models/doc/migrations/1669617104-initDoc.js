/* eslint-disable no-console */
const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.createTable('docs', table => {
      table.uuid('id').primary()
      table.string('type')
      table.string('identifier').notNullable()
      table.json('docs_prosemirror_delta').defaultTo(null)
      table.binary('docs_y_doc_state').notNullable()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })
    })
  } catch (e) {
    logger.error('Doc: Initial: Migration failed!')
    throw new Error(e)
  }
}

exports.down = async knex => knex.schema.dropTable('docs')
