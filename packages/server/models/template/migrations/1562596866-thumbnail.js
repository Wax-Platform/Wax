exports.up = async knex =>
  knex.schema.table('template', table => {
    table.uuid('thumbnailId').nullable().references('file')
  })
