const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    const tableExists = await knex.schema.hasTable('service_credential')

    if (tableExists) {
      return knex.schema.dropTable('service_credential')
    }

    return false
  } catch (e) {
    logger.error('Service Credentials: Drop old table: Migration failed!')
    throw new Error(e)
  }
}
