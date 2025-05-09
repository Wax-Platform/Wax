const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    const tableExists = await knex.schema.hasTable('team_members')

    if (tableExists) {
      const hasColumnDeleted = await knex.schema.hasColumn(
        'team_members',
        'deleted',
      )

      return knex.schema.table('team_members', table => {
        if (hasColumnDeleted) {
          table.dropColumn('deleted')
        }
      })
    }

    return false
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Team members: dropping deleted column`)
  }
}

exports.down = async () => {}