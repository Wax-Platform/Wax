const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.createTable('invitations', table => {
      // base
      table.uuid('id').primary()
      table.text('type').notNullable()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })
      table.boolean('deleted').defaultTo(false)

      // own
      table.uuid('teamId').notNullable()
      table.uuid('bookComponentId').notNullable()
      table.text('email').notNullable()
      table.text('status').notNullable()
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Invitations: initial migration failed`)
  }
}

exports.down = async knex => knex.schema.dropTable('invitations')
