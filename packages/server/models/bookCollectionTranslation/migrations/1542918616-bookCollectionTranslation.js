exports.up = knex => knex.schema.createTable('book_collection_translation', table => {
  // base
  table.uuid('id').primary()
  table.text('type').notNullable()
  table
    .timestamp('created', { useTz: true })
    .notNullable()
    .defaultTo(knex.fn.now())
  table
    .timestamp('updated', { useTz: true })
    .notNullable()
    .defaultTo(knex.fn.now())

  // ketida base
  table.boolean('deleted').defaultTo(false)

  // translation
  table.text('language_iso').notNullable()

  // foreign
  table.uuid('collection_id').notNullable().references('id').inTable('book_collection')

  // own
  table.text('description').nullable()
  table.text('title').notNullable()

  // constraints
  table.unique(['collection_id', 'language_iso'])
})

exports.down = knex => knex.schema.dropTable('book_collection_translation')

