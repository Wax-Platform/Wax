exports.up = async knex => {
  await knex.schema.createTable('doc_tree_manager', table => {
    table.uuid('id').primary()
    table
      .timestamp('created', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table.timestamp('updated', { useTz: true })
    table.text('title')
    table.uuid('parent_id')
    table.jsonb('children').notNullable()
    table.boolean('is_folder').notNullable().defaultTo(false)

    // foreign
    table.uuid('book_component_id').references('id').inTable('book_component')
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('doc_tree_manager')
}
