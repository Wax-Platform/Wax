exports.up = async knex =>
  knex.schema.table('book_component_state', table => {
    table.string('runningHeadersRight')
    table.string('runningHeadersLeft')
    table.boolean('includeInTOC').defaultTo(false)
  })

exports.down = async knex =>
  knex.schema.table('book_component_state', table => {
    table.dropColumn('runningHeadersRight')
    table.dropColumn('runningHeadersLeft')
    table.dropColumn('includeInTOC')
  })
