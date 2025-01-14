exports.up = knex =>
  knex.schema.createTable('snippets', table => {
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
    table.uuid('authorId').references('id').inTable('users').onDelete('CASCADE')
    table
      .uuid('templateId')
      .nullable()
      .references('id')
      .inTable('templates')
      .onDelete('CASCADE')
    table.text('className').notNullable()
    table.text('elementType').notNullable()
    table.text('description').notNullable()
    table.text('classBody').notNullable()
    table.text('category')
  })

exports.down = knex => knex.schema.dropTable('snippets')
