exports.up = knex => {
  return knex.schema.createTable('embeddings', table => {
    table.uuid('id').primary()
    table
      .timestamp('created', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table.text('stored_object_key')
    table.text('section')
    table.text('type')
    table
      .timestamp('updated', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
  })
}

exports.down = knex => {
  return knex.schema.dropTable('embeddings')
}
