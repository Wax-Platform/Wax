const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.table('lock', table => {
      table.timestamp('lastActiveAt', { useTz: true }).nullable()
    })
  } catch (e) {
    logger.error(e)
    throw new Error('Migration: Lock: adding lastActiveAt failed')
  }
}

exports.down = async knex => {
  try {
    return knex.schema.table('lock', table => {
      table.dropColumn('lastActiveAt')
    })
  } catch (e) {
    logger.error(e)
    throw new Error('Migration: Lock: removing lastActiveAt failed')
  }
}
