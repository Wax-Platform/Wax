exports.up = async knex =>
  knex.schema.table('lock', table => {
    table.string('userAgent').nullable()
  })

exports.down = async knex =>
  knex.schema.table('lock', table => {
    table.dropColumn('userAgent')
  })

