const { BaseModel } = require('@coko/server')

const Translation = require('../translation')

const { arrayOfStringsNotEmpty, id, string } = require('../helpers').schema

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
        abstractContent: string,
        abstractTitle: string,
        alternativeTitle: string,
        bookId: id,
        keywords: arrayOfStringsNotEmpty,
        subtitle: string,
        title: string,
      },
    }
  }

  getBook() {
    return this.$relatedQuery('book')
  }
}

module.exports = BookTranslation
