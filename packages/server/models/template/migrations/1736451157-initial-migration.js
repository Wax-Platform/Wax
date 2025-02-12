exports.up = knex =>
  knex.schema.createTable('templates', table => {
    table.uuid('id').primary()
    table
      .timestamp('created', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table
      .timestamp('updated', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table.uuid('userId').references('id').inTable('users')
    table.uuid('docId').references('id').inTable('docs')
    table.uuid('fileId').references('id').inTable('files')
    table.text('displayName').notNullable()
    table.text('category').notNullable()
    table.jsonb('meta').nullable()
    table.text('status').notNullable()
    table.text('rawCss')
  })

exports.down = knex => knex.schema.dropTable('templates')
