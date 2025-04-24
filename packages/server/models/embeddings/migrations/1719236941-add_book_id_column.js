const { logger, useTransaction, uuid } = require('@coko/server')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      await knex.schema.table('embeddings', table => {
        table.uuid('bookId').notNullable().defaultTo(uuid())
      })

      const existingEmbeddings = await knex('embeddings')
      const documents = await knex('documents')

      return Promise.all(
        existingEmbeddings.map(async embedding => {
          const document = documents.find(d => {
            return d.sectionsKeys.indexOf(embedding.storedObjectKey) > -1
          })

          await knex('embeddings')
            .transacting(trx)
            .where('id', embedding.id)
            .update({
              bookId: document.bookId,
            })
        }),
      )
    })
  } catch (e) {
    logger.error(e)
    await knex.schema.table('embeddings', table => {
      table.dropColumn('bookId')
    })
    throw new Error(`Migration: Embeddings: add "bookId" failed`)
  }
}

exports.down = async knex => {
  try {
    return knex.schema.table('embeddings', table => {
      table.dropColumn('bookId')
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Embeddings: drop "bookId" failed`)
  }
}
