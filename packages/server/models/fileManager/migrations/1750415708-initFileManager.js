exports.up = knex => {
  return knex.schema.createTable('file_manager', table => {
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
    table.uuid('userId').notNullable().references('id').inTable('users')
    table.jsonb('metadata').notNullable()
    table.uuid('parentId')
    table.uuid('fileId').references('id').inTable('files')
  })
}

exports.down = knex => {
  return knex.schema.dropTable('file_manager')
}
