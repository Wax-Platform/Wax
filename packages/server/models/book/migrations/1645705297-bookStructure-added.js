exports.up = async knex =>
  knex.schema.table('book', table => {
    table.jsonb('bookStructure').defaultTo(null)
  })

exports.down = async knex =>
  knex.schema.table('book', table => {
    table.dropColumn('bookStructure')
  })

