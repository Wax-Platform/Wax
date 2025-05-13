exports.up = async knex =>
  knex.schema.table('template', table => {
    table.uuid('thumbnailId').nullable().references('file')
  })

exports.down = async knex =>
  knex.schema.table('template', table => {
    table.dropColumn('thumbnailId')
  })
