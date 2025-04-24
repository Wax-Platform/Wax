// const { logger } = require('@coko/server')
// const { Book } = require('@pubsweet/models')

exports.up = async knex => {
  //   try {
  //     const defaultAssociatedTemplates = { pagedjs: [], epub: null, icml: null }
  //     await knex.schema.table('book', table => {
  //       table.jsonb('associatedTemplates').defaultTo(defaultAssociatedTemplates)
  //     })
  //     return Book.query().patch({
  //       associatedTemplates: defaultAssociatedTemplates,
  //     })
  //   } catch (e) {
  //     logger.error(e)
  //     throw new Error('Migration: Book: adding associatedTemplates failed')
  //   }
  // }
  // exports.down = async knex => {
  //   try {
  //     await knex.schema.table('book', table => {
  //       table.dropColumn('associatedTemplates')
  //     })
  //   } catch (e) {
  //     logger.error(e)
  //     throw new Error('Migration: Book: removing associatedTemplates failed')
  //   }
}
