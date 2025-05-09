const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    const tableExists = await knex.schema.hasTable('users')

    if (tableExists) {
      const hasColumnDeleted = await knex.schema.hasColumn('users', 'deleted')

      return knex.schema.table('users', table => {
        if (hasColumnDeleted) {
          table.dropColumn('deleted')
        }
      })
    }

    return false
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Users: dropping deleted column`)
  }
}


exports.down = async () => {}