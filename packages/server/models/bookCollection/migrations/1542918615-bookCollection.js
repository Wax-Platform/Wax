exports.up = async knex => {
  await knex.schema.createTable('book_collection', table => {
    // base
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

    // ketida base
    table.boolean('deleted').defaultTo(false)
  })
}

exports.down = async knex =>
  knex.schema.dropTable('book_collection')

