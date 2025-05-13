const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    const tableExists = await knex.schema.hasTable('teams')

    if (tableExists) {
      const hasColumnDeleted = await knex.schema.hasColumn('teams', 'deleted')

      return knex.schema.table('teams', table => {
        if (hasColumnDeleted) {
          table.dropColumn('deleted')
        }
      })
    }

    return false
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Teams: dropping deleted column`)
  }
}

exports.down = async () => {}
