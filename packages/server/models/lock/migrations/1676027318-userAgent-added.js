exports.up = async knex =>
  knex.schema.table('lock', table => {
    table.string('userAgent').nullable()
  })
