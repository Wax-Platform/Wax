exports.up = async knex =>
  knex.schema.createTable('book_translation', table => {
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

    // translation
    table.text('language_iso').notNullable()

    // foreign
    table.uuid('book_id').notNullable().references('id').inTable('book')

    // own
    table.text('abstract_content')
    table.text('abstract_title')
    table.text('alternative_title')
    table.specificType('keywords', 'text[]')
    table.text('subtitle')
    table.text('title').notNullable()

    // constraints
    table.unique(['book_id', 'language_iso'])
  })

exports.down = async knex => knex.schema.dropTable('book_translation')
