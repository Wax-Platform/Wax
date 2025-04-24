exports.up = async knex =>
  knex.schema.table('lock', table => {
    table.uuid('tabId').nullable()
    table.uuid('serverIdentifier').notNullable()
  })
