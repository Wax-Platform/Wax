/*
  BookSettings: Settings of a book
*/

const { BaseModel } = require('@coko/server')

const Base = require('../ketidaBase')

const { booleanDefaultFalse, booleanDefaultTrue, id, string } =
  require('../helpers').schema

class BookSettings extends Base {
  constructor(properties) {
    super(properties)
    this.type = 'bookSettings'
  }

  static get tableName() {
    return 'BookSettings'
  }

  static get relationMappings() {
    /* eslint-disable global-require */
    const Book = require('../book/book.model')

    return {
      book: {
        relation: BaseModel.HasOneRelation,
        modelClass: Book,
        join: {
          from: 'BookSettings.bookId',
          to: 'Book.id',
        },
      },
    }
  }

  static get schema() {
    return {
      type: 'object',
      required: ['bookId'],
      properties: {
        aiOn: booleanDefaultFalse,
        // askKb: booleanDefaultFalse,
        aiPdfDesignerOn: booleanDefaultFalse,
        customTags: {
          type: 'array',
          items: string,
          default: [],
        },
        knowledgeBaseOn: booleanDefaultFalse,
        configurableEditorOn: booleanDefaultFalse,
        configurableEditorConfig: {
          type: 'array',
          items: string,
          default: [],
        },
        bookId: id,
        freeTextPromptsOn: booleanDefaultTrue,
        customPrompts: {
          type: 'array',
          items: string,
          default: [],
        },
        customPromptsOn: booleanDefaultFalse,
      },
    }
  }

  getBook() {
    return this.$relatedQuery('book')
  }
}

module.exports = BookSettings
