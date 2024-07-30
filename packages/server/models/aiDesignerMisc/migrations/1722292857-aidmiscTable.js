exports.up = async knex => {
  return knex.schema.createTable('aidmisc_table', table => {
    table.uuid('id').primary()
    table.string('type')
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
    table.text('user_id').nullable()
  })
}

exports.down = async knex => {
  return knex.schema.dropTable('aidmisc_table')
}
