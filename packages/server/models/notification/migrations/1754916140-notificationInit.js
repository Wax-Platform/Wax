const { logger } = require('@coko/server')

exports.up = knex => {
  try {
    return knex.schema.createTable('notifications', table => {
      table.uuid('id').primary()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })
      table.uuid('user_id') // receiver of the notification
      table.text('notification_type').notNullable() // message or task or smth else
      table.uuid('object_id') // source of the notification (message id, task id...)
      table.jsonb('content')
      table.boolean('read').defaultTo(false)

      table.text('type')
    })
  } catch (e) {
    logger.error('notifications: initial migration failed!')
    throw new Error(e)
  }
}

exports.down = knex => knex.schema.dropTable('notifications')
