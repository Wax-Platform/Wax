// const { logger } = require('@coko/server')
// const { Book } = require('@pubsweet/models')

exports.up = async knex => {
  //   try {
  //     const defaultAssociatedTemplates = {
  //       pagedjs: [],
  //       epub: null,
  //       icml: null,
  //     }
  //     const tableExists = await knex.schema.hasTable('book')
  //     if (tableExists) {
  //       const hasColumnAssociatedTemplates = await knex.schema.hasColumn(
  //         'book',
  //         'associated_templates',
  //       )
  //       if (hasColumnAssociatedTemplates) {
  //         return Book.query().patch({
  //           associatedTemplates: defaultAssociatedTemplates,
  //         })
  //       }
  //     }
  //     return false
  //   } catch (e) {
  //     logger.error(e)
  //     throw new Error(
  //       'Migration: Book: setting associatedTemplates to different default failed',
  //     )
  //   }
}
