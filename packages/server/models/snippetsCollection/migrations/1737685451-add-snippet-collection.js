exports.up = knex =>
  knex.schema.createTable('snippets_collection', table => {
    table.uuid('id').primary()
    table
      .timestamp('created', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table
      .timestamp('updated', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table.uuid('docId').references('id').inTable('docs').nullable()
    table.uuid('authorId').references('id').inTable('users').nullable()
    table.text('displayName').notNullable()
    table.text('status').notNullable()
    table.jsonb('snippets').nullable()
  })

exports.down = knex => knex.schema.dropTable('snippets_collection')
