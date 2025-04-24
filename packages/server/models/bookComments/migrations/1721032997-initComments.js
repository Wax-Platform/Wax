const { logger } = require('@coko/server')

exports.up = knex => {
  try {
    return knex.schema.createTable('book_comments', table => {
      table.uuid('id').primary()
      table.text('type').notNullable()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table
        .timestamp('updated', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.text('content').nullable()
      table.uuid('bookId').notNullable()
      table.uuid('componentId').notNullable()
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Comments: initial migration failed`)
  }
}

exports.down = knex => {
  return knex.schema.dropTable('book_comments')
}
