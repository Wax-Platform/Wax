const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    const hasColumnServerIdentifier = await knex.schema.hasColumn(
      'lock',
      'server_identifier',
    )

    return knex.schema.alterTable('lock', table => {
      table.dropUnique('foreign_id_user_id_tab_id_server_identifier')

      if (hasColumnServerIdentifier) {
        table.dropColumn('server_identifier')
      }
    })
  } catch (e) {
    logger.error(e)
    throw new Error(
      'Migration: Lock: dropping unique constraint lock_foreign_id_user_id_tab_id_server_identifier_unique and dropping server_identifier failed',
    )
  }
}

exports.down = async knex => {
  try {
    const hasColumnServerIdentifier = await knex.schema.hasColumn(
      'lock',
      'server_identifier',
    )

    return knex.schema.alterTable('lock', table => {
      if (!hasColumnServerIdentifier) {
        table.uuid('serverIdentifier').notNullable()
      }

      table.unique(['foreign_id', 'user_id', 'tab_id', 'server_identifier'])
    })
  } catch (e) {
    logger.error(e)
    throw new Error(
      'Migration: Lock: adding unique constraint lock_foreign_id_user_id_tab_id_server_identifier_unique and adding server_identifier failed',
    )
  }
}
