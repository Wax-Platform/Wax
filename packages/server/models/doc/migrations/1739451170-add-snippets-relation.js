// /* eslint-disable no-console */
// const { logger } = require('@coko/server')

// exports.up = async knex => {
//   try {
//     return knex.schema.table('docs', table => {
//       table
//         .uuid('snippetsCollectionId')
//         .references('id')
//         .inTable('snippets_collection')
//     })
//   } catch (e) {
//     logger.error('Doc: Add snippets_collection: Migration failed!')
//     throw new Error(e)
//   }
// }

// exports.down = async knex => {
//   try {
//     return knex.schema.table('docs', table => {
//       table.dropColumn('snippetsCollectionId')
//     })
//   } catch (e) {
//     logger.error('Doc: Remove snippetsCollectionId: Migration failed!')
//     throw new Error(e)
//   }
// }
