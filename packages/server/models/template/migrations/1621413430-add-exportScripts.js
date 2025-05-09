exports.up = async knex =>
  knex.schema.table('template', table => {
    table.jsonb('exportScripts').defaultTo([])
  })

exports.down = async knex =>
  knex.schema.table('template', table => {
    table.dropColumn('exportScripts')
  })

