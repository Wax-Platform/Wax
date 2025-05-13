const { BaseModel, modelJsonSchemaTypes } = require('@coko/server')

const Translation = require('../translation')

const { arrayOfStrings, id, stringNullable } = modelJsonSchemaTypes

class BookTranslation extends Translation {
  constructor(properties) {
    super(properties)
    this.type = 'bookTranslation'
  }

  static get tableName() {
    return 'BookTranslation'
  }

  static get relationMappings() {
    /* eslint-disable global-require */
    const Book = require('../book/book.model')
    /* eslint-enable global-require */
    return {
      book: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Book,
        join: {
          from: 'BookTranslation.bookId',
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
        abstractContent: stringNullable,
        abstractTitle: stringNullable,
        alternativeTitle: stringNullable,
        bookId: id,
        keywords: arrayOfStrings,
        subtitle: stringNullable,
        title: stringNullable,
      },
    }
  }

  getBook() {
    return this.$relatedQuery('book')
  }
}

module.exports = BookTranslation
