exports.up = knex => {
  return knex.schema.alterTable('book_component_state', table => {
    table.boolean('include_in_toc').defaultTo(false).alter()
  })
}

exports.down = knex => {
  return knex.schema.alterTable('book_component_state', table => {
    table.boolean('include_in_toc').defaultTo(null).alter()
  })
}
