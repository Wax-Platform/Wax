exports.up = async knex =>
  knex.schema.table('book_component_state', table => {
    table.smallint('status').nullable()
  })

exports.down = async knex =>
  knex.schema.table('book_component_state', table => {
    table.dropColumn('status')
  })
