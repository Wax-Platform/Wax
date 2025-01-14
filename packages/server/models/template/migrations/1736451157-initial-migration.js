exports.up = knex =>
  knex.schema.createTable('templates', table => {
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
    table.uuid('userId').references('id').inTable('users').onDelete('CASCADE')
    table.uuid('docId').references('id').inTable('docs').onDelete('CASCADE')
    table.text('objectType').notNullable()
    table.text('displayName').notNullable()
    table.jsonb('snippets').notNullable()
    table.jsonb('inactiveSnippets')
    table.text('pagedJsCss')
    table.jsonb('allowedUsers')
    table.jsonb('root')
  })

exports.down = knex => knex.schema.dropTable('templates')
