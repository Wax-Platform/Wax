exports.up = knex =>
  knex.schema.table('resource_tree', table => {
    table.uuid('templateId').references('id').inTable('templates')
  })

exports.down = knex =>
  knex.schema.table('resource_tree', table => {
    table.dropColumn('templateId')
  })
