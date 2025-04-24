exports.up = async knex =>
  knex.schema.table('book', table => {
    table.string('isbn')
    table.string('issn')
    table.string('issnL')
  })
