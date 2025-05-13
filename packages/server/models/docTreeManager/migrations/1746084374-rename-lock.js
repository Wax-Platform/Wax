const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.table('doc_tree_manager', table => {
      table.boolean('renameLock').defaultTo(false)
    })
  } catch (e) {
    logger.error(e)
    throw new Error('Migration: Doc tree manager: add renameLock column failed')
  }
}

exports.down = knex =>
  knex.schema.table('doc_tree_manager', table => {
    table.dropColumn('renameLock')
  })
