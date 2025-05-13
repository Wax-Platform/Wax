exports.up = async knex =>
  knex.schema.table('book', table => {
    table.string('isbn')
    table.string('issn')
    table.string('issnL')
  })

exports.down = async knex =>
  knex.schema.table('book', table => {
    table.dropColumn('isbn')
    table.dropColumn('issn')
    table.dropColumn('issnL')
  })
