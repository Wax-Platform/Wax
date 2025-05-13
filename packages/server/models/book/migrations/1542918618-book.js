exports.up = async knex => {
  await knex.schema.createTable('book', table => {
    // base
    table.uuid('id').primary()
    table.text('type').notNullable()
    table
      .timestamp('created', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table.timestamp('updated', { useTz: true })

    // ketida base
    table.boolean('deleted').defaultTo(false)

    // foreign
    table
      .uuid('collection_id')
      .notNullable()
      .references('id')
      .inTable('book_collection')
    /*
      to do
      we cannot enforce the integrity of division id's, as an array of foreign
      keys is not yet supported in postgres. there seems to be some work on this,
      so we should update when the feature is in postgres.
    */
    table.jsonb('divisions').notNullable()

    // own
    table.boolean('archived').defaultTo(false)
    table.text('copyright_statement')
    table.text('copyright_holder')
    table.integer('copyright_year')
    table.integer('edition')
    table.integer('status').defaultTo(0)
    table.uuid('thumbnailId').nullable().defaultTo(null)
    table.text('license')
    table.text('publication_date')
    table.uuid('reference_id')
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('book')
}
