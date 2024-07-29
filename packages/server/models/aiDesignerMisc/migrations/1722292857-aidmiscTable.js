exports.up = knex => {
  return knex.schema.createTable('aidmisc_table', table => {
    table.uuid('id').primary()
    table.uuid('userId').nullable()
    table.jsonb('templates').notNullable()
    table.jsonb('snippets').notNullable()
    table
      .timestamp('created', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table
      .timestamp('updated', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
  })
}

exports.down = knex => {
  return knex.schema.dropTable('aidmisc_table')
}
