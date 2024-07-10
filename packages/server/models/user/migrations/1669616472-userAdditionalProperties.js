const { logger } = require('@coko/server')

exports.up = knex => {
  try {
    return knex.schema.table('users', table => {
      table.string('displayName').nullable()
      table.string('email').nullable()
      table.string('color').nullable()
    })
  } catch (e) {
    logger.error('UserAdditionalProperties: Migration failed!')
    throw new Error(e)
  }
}

exports.down = knex => knex.schema.dropTable('users')
