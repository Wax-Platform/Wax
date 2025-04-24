const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.createTable('book_settings', table => {
      // base
      table.uuid('id').primary()
      table.text('type').notNullable()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })
      table.boolean('deleted').defaultTo(false)

      // foreign
      table
        .uuid('bookId')
        .notNullable()
        .references('id')
        .inTable('book')
        .onDelete('CASCADE')

      // own
      table.boolean('aiOn').defaultTo(false)
      // table.boolean('askKb').defaultTo(false)
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Book Settings: initial migration failed`)
  }
}

exports.down = async knex => knex.schema.dropTable('book_settings')
