const { BaseModel, logger } = require('@coko/server')
const { callOn } = require('../../utilities/utils')

class Embedding extends BaseModel {
  static get tableName() {
    return 'embeddings'
  }

  constructor(properties) {
    super(properties)
    this.type = 'embedding'
  }

  static get schema() {
    return {
      type: 'object',
      required: ['embedding'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        created: { type: 'string', format: 'date-time' },
        embedding: { type: 'array', items: { type: 'number' } },
        storedObjectKey: { type: 'string' },
        section: { type: 'string' }, // contains the section name and the index separated by "|": "<sectionname>|<index>"
        bookId: { type: 'string', format: 'uuid' },
      },
    }
  }

  static get relationMappings() {
    // eslint-disable-next-line global-require
    const Book = require('../book/book.model')
    return {
      book: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Book,
        join: {
          from: 'documents.bookId',
          to: 'books.id',
        },
      },
    }
  }

  static async getAllEmbeddings() {
    return this.query().select('*').from(this.tableName)
  }

  static async indexedSimilaritySearch({
    bookId,
    embedding,
    limit = 10,
    metric = 'cosine',
    threshold = 0.7,
  }) {
    const operator = callOn(metric, {
      euclidean: () => '<->', // vector_l2_ops
      cosine: () => '<=>', // vector_cosine_ops
      inner_product: () => '<#>', // vector_inner_product_ops
      default: () => '<=>', // default to cosine
    })

    // TODO: find a way to avoid this
    const qEmbedding = JSON.stringify(embedding)
      .replaceAll('{', '[')
      .replaceAll('}', ']')

    return this.query()
      .select('*')
      .from(this.tableName)
      .where('bookId', bookId)
      .whereRaw(`embedding ${operator} ? < ?`, [qEmbedding, threshold])
      .orderByRaw(`embedding ${operator} ? ASC`, [qEmbedding])
      .limit(limit)
  }

  static async insertNewEmbedding({
    bookId,
    embedding,
    storedObjectKey,
    section,
    index,
    trx,
  }) {
    try {
      const result = await this.query(trx).insert({
        bookId,
        embedding,
        storedObjectKey,
        section: `${section}|${index}`,
      })

      if (result) {
        return true
      }

      logger.warn(`could not generate the embedding`)
      return false
    } catch (error) {
      logger.error(
        `Error deleting embeddings with storedObjectKey: ${storedObjectKey}`,
        error,
      )
      throw error
    }
  }

  static async deleteByStoredObjectKey(storedObjectKey) {
    try {
      const result = await this.query()
        .delete()
        .where('storedObjectKey', storedObjectKey)

      if (result) {
        logger.info(
          `Successfully deleted embeddings with storedObjectKey: ${storedObjectKey}`,
        )
        return true
      }

      logger.warn(
        `No embeddings found with storedObjectKey: ${storedObjectKey}`,
      )
      return false
    } catch (error) {
      logger.error(
        `Error deleting embeddings with storedObjectKey: ${storedObjectKey}`,
        error,
      )
      throw error
    }
  }

  static async deleteByStoredBookId(bookId) {
    try {
      const result = await this.query().delete().where('bookId', bookId)

      if (result) {
        logger.info(`Successfully deleted embeddings with bookId: ${bookId}`)
        return true
      }

      logger.warn(`No embeddings found with bookId: ${bookId}`)
      return false
    } catch (error) {
      logger.error(`Error deleting embeddings with bookId: ${bookId}`, error)
      throw error
    }
  }
}

module.exports = Embedding
