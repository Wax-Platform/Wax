exports.up = async knex =>
  knex.schema.table('lock', table => {
    table.uuid('tabId').nullable()
    table.uuid('serverIdentifier').notNullable()
  })

exports.down = async knex =>
  knex.schema.table('lock', table => {
    table.dropColumn('tabId')
    table.dropColumn('serverIdentifier')
  })
