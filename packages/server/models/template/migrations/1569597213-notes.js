exports.up = async knex =>
  knex.schema.table('template', table => {
    table.string('notes').defaultTo('footnotes')
  })

exports.down = async knex =>
  knex.schema.table('template', table => {
    table.dropColumn('notes')
  })
