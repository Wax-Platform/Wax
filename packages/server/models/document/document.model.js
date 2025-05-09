/* eslint-disable global-require */
const { logger, fileStorage, BaseModel } = require('@coko/server')
const { Model } = require('objection')
const Embedding = require('../embeddings/embedding.model')

class Document extends BaseModel {
  static get tableName() {
    return 'documents'
  }

  static get jsonAttributes() {
    return ['sectionsKeys']
  }

  constructor(properties) {
    super(properties)
    this.type = 'document'
  }
  // TODO: add the file skey and relation mapping bookid>objectId

  static get schema() {
    return {
      type: 'object',
      required: ['name', 'extension'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        extension: { type: 'string' },
        sectionsKeys: { type: 'array', items: { type: 'string' } },
        created: { type: 'string', format: 'date-time' },
        bookId: { type: 'string', format: 'uuid' },
      },
    }
  }

  static get relationMappings() {
    const Book = require('../book/book.model')
    return {
      book: {
        relation: Model.BelongsToOneRelation,
        modelClass: Book,
        join: {
          from: 'documents.bookId',
          to: 'books.id',
        },
      },
    }
  }

  static async getAlldocuments(bookId) {
    return this.query()
      .select('*')
      .from(this.tableName)
      .where('bookId', bookId)
      .orderBy('created', 'desc')
  }

  static async createDocument(name, extension, sectionsKeys, bookId, tr) {
    return this.insert({ name, extension, sectionsKeys, bookId }, { tr })
  }

  static async deleteFolder(id) {
    try {
      if (!id) {
        throw new Error('ID is required to delete a folder.')
      }

      const document = await this.query().findOne({ id })

      if (!document) {
        logger.error(`Document with ID ${id} not found.`)
        throw new Error(`Document with ID ${id} not found.`)
      }

      await fileStorage.delete(document.sectionsKeys)
      await Embedding.query()
        .delete()
        .whereIn('storedObjectKey', document.sectionsKeys)

      await this.query().delete().where('id', id)

      logger.info('Folder deleted successfully.')
    } catch (error) {
      logger.error('Error deleting folder:', error)
      throw error
    }
  }

  static async getSlicedSectionsKeysById(id, start = 0, length = null) {
    const document = await this.query().findOne({ id })

    if (!document) {
      logger.error(`Document with ID ${id} not found.`)
      throw new Error(`Document with ID ${id} not found.`)
    }

    if (length !== null) {
      const lengthToPass =
        length <= document.sectionsKeys.length - 1
          ? length
          : document.sectionsKeys.length - 1 - start

      document.sectionsKeys = document.sectionsKeys.slice(
        start,
        start + lengthToPass,
      )
    }

    return document.sectionsKeys
  }
}

module.exports = Document
