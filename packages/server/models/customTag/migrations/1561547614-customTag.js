exports.up = knex =>
  knex.schema.createTable('custom_tag', table => {
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

    // own
    table.text('label').nullable()
    table.text('tag_type').nullable()
  })

exports.down = knex => knex.schema.dropTable('custom_tag')
