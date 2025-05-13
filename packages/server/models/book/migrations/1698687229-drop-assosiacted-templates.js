const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    const tableExists = await knex.schema.hasTable('book')

    if (tableExists) {
      const hasColumnAssociatedTemplates = await knex.schema.hasColumn(
        'book',
        'associated_templates',
      )

      if (hasColumnAssociatedTemplates) {
        return await knex.schema.table('book', table => {
          table.dropColumn('associated_templates')
        })
      }
    }

    return false
  } catch (e) {
    logger.error(e)
    throw new Error(
      'Migration: Book: dropping associatedTemplates column in favour of export profiles failed',
    )
  }
}

exports.down = async () => {}
