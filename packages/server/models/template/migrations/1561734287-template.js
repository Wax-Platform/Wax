exports.up = async knex => {
  await knex.schema.createTable('template', table => {
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
    table.uuid('reference_id')
    table.text('author')
    table.text('name').notNullable()
    table.text('target')
    table.text('trim_size')
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('template')
}
