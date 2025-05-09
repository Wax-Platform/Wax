exports.up = knex =>
  knex.schema.createTable('book_component_state', table => {
    // base
    table
      .uuid('id')
      .primary()
      .notNullable()
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

    // own
    table.jsonb('comments')
    table.boolean('track_changes_enabled').defaultTo(false)
    table.jsonb('workflow_stages')
    table.boolean('uploading').defaultTo(false)
  })

exports.down = knex => knex.schema.dropTable('book_component_state')

