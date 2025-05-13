exports.up = async knex => {
  await knex.schema.createTable('lock', table => {
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
    table.uuid('user_id').notNullable().references('id').inTable('users')

    // own
    table.uuid('foreign_id').notNullable() // no reference as we don't know which table
    table.text('foreign_type').notNullable()
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('lock')
}
