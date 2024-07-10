exports.up = knex => {
  return knex.schema.createTable('documents', table => {
    table.uuid('id').primary()
    table
      .timestamp('created', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table.text('type')
    table
      .timestamp('updated', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table.string('name').notNullable()
    table.string('extension').notNullable()
    table.jsonb('sectionsKeys').notNullable()
  })
}

exports.down = knex => {
  return knex.schema.dropTable('documents')
}
