exports.up = async knex => {
  await knex.schema.createTable('division', table => {
    // base
    table.uuid('id').primary()
    table.text('type').notNullable()
    table
      .timestamp('created', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table.timestamp('updated', { useTz: true })

    // ketida base
    table.boolean('deleted').defaultTo(false)

    // foreign
    table
      .uuid('book_id')
      .notNullable()
      .references('id')
      .inTable('book')
    table.jsonb('book_components').notNullable()

    // own
    table.text('label').notNullable()
  })
}

exports.down = async knex => knex.schema.dropTable('division')

