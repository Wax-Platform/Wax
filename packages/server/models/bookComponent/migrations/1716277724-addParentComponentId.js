const { logger } = require('@coko/server')

exports.up = knex => {
  try {
    return knex.schema.table('book_component', table => {
      table
        .uuid('parent_component_id')
        .nullable()
        .references('id')
        .inTable('book_component')
    })
  } catch (e) {
    logger.error(
      'Book Component: migration adding parent_component_id field for table book_component failed!',
    )
    throw new Error(e)
  }
}

exports.down = knex =>
  knex.schema.table('book_component', table => {
    table.dropColumn('parent_component_id')
  })
