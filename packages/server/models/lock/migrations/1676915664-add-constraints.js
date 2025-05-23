exports.up = async knex =>
  knex.schema.table('lock', table => {
    table.unique(['foreign_id', 'user_id', 'tab_id', 'server_identifier'])
  })

exports.down = async knex =>
  knex.schema.table('lock', table => {
    table.dropUnique(['foreign_id', 'user_id', 'tab_id', 'server_identifier'])
  })
