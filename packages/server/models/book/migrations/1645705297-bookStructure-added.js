exports.up = async knex =>
  knex.schema.table('book', table => {
    table.jsonb('bookStructure').defaultTo(null)
  })
