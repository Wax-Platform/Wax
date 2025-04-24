/*
  TO DO

  There is a logical dead end between division and book.
  A book cannot have an empty array of divisions and it needs a valid
  division id. A division must have a valid book id.
  When creating a new one, we have a problem. One of the two conditions
  has to go.

  After creation, update book "divisions" array of ids.

  Get book components & relation
*/

const { Model } = require('objection')

const Base = require('../ketidaBase')
const { arrayOfIds, id, stringNotEmpty } = require('../helpers').schema

class Division extends Base {
  constructor(properties) {
    super(properties)
    this.type = 'division'
  }

  static get tableName() {
    return 'Division'
  }

  static get schema() {
    return {
      type: 'object',
      required: ['bookId', 'label'],
      properties: {
        bookId: id,
        bookComponents: arrayOfIds,
        label: stringNotEmpty,
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable global-require */
    const Book = require('../book/book.model')
    /* eslint-enable global-require */
    // const { model: BookComponent } = require('../bookComponent')

    return {
      book: {
        relation: Model.BelongsToOneRelation,
        modelClass: Book,
        join: {
          from: 'Division.bookId',
          to: 'Book.id',
        },
      },
      // bookComponents: {
      //   relation: Model.HasManyRelation,
      //   modelClass: BookComponent,
      //   join: {
      //     from: 'Division.id',
      //     to: 'BookComponent.divisionId',
      //   },
      // },
    }
  }

  getBook() {
    return this.$relatedQuery('book')
  }

  getBookComponents() {
    return this.$relatedQuery('bookComponents')
  }
}

module.exports = Division
