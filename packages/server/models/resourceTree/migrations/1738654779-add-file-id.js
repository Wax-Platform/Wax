exports.up = knex =>
  knex.schema.table('resource_tree', table => {
    table.uuid('fileId').references('id').inTable('files')
  })

exports.down = knex =>
  knex.schema.table('resource_tree', table => {
    table.dropColumn('fileId')
  })
