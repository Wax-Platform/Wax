const { logger } = require('@coko/server')

exports.up = knex => {
  try {
    logger.info('migrating')

    return knex.schema.createTable('settings_table', table => {
      table.uuid('id').primary()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.jsonb('gui')
      table.jsonb('editor')
      table.jsonb('snippets_manager')
      table.jsonb('chat')
      table.jsonb('preview')
      table.text('type')
      table
        .timestamp('updated', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
    })
  } catch (e) {
    logger.error('Settings: initial migration failed!')
    throw new Error(e)
  }
}

exports.down = knex => {
  return knex.schema.dropTable('settings_table')
}
