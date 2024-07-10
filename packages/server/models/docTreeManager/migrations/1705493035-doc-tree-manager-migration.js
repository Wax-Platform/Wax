exports.up = async knex => {
  await knex.schema.createTable('doc_tree_manager', table => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('public.gen_random_uuid()'))
      .notNullable()
    table.timestamp('created').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('updated')
    table.text('title')
    table.uuid('parent_id')
    table.jsonb('children').notNullable()
    table.boolean('is_folder').defaultTo(false).notNullable()

    table.foreign('doc_id').references('uuid').inTable('docs')
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('doc_tree_manager')
}
