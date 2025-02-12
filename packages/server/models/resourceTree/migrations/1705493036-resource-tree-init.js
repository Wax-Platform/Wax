const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    await knex.schema.createTable('resource_tree', table => {
      table.uuid('id').primary()
      table.uuid('userId').nullable().references('id').inTable('users')
      table.enu('resourceType', ['doc', 'dir', 'root', 'sys']).notNullable()
      table
        .enu('extension', ['doc', 'img', 'css', 'snip', 'book', 'template'])
        .nullable()
      table.string('title').nullable()
      table
        .uuid('parentId')
        .nullable()
        .references('id')
        .inTable('resource_tree')
      table.uuid('docId').nullable().references('id').inTable('docs')
      table.jsonb('children').defaultTo('[]')
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })
    })
  } catch (e) {
    // logger.error('ResourceTree: Migration failed!')
    throw new Error(e)
  }
}

exports.down = async knex => {
  try {
    await knex.schema.dropTableIfExists('resource_tree')
  } catch (e) {
    // logger.error('ResourceTree: Rollback failed!')
    throw new Error(e)
  }
}
