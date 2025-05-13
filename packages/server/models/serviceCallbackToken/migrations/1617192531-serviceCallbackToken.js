exports.up = async knex => {
  await knex.schema.createTable('service_callback_token', table => {
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
      .uuid('book_component_id')
      .notNullable()
      .references('id')
      .inTable('book_component')
    // table
    //   .uuid('service_credential_id')
    //   .notNullable()
    //   .references('id')
    //   .inTable('service_credential')

    // own
    table.text('response_token')

    // constraints
    // table.unique(['book_component_id', 'response_token', 'service_credential_id'])
    table.unique(['book_component_id', 'response_token'])
  })
}

exports.down = async knex => knex.schema.dropTable('service_callback_token')
