exports.up = async knex =>
  knex.schema.table('template', table => {
    table.jsonb('exportScripts').defaultTo([])
  })
