const { BaseModel } = require('@coko/server')
const { id, string } = require('../helpers').schema

class Comments extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'book_comment'
  }

  static get tableName() {
    return 'book_comments'
  }

  static get relationMappings() {
    /* eslint-disable global-require */
    const Book = require('../book/book.model')
    const BookComponent = require('../bookComponent/bookComponent.model')
    /* eslint-enable global-require */
    return {
      book: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Book,
        join: {
          from: 'Comments.bookId',
          to: 'Book.id',
        },
      },
      chapter: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: BookComponent,
        join: {
          from: 'Comments.componentId',
          to: 'BookComponent.id',
        },
      },
    }
  }

  static get schema() {
    return {
      type: 'object',
      required: ['bookId', 'componentId'],
      properties: {
        id,
        created: { type: 'string', format: 'date-time' },
        updated: { type: 'string', format: 'date-time' },
        bookId: id,
        componentId: id,
        content: string,
      },
    }
  }

  // $parseJson(json, opt) {
  //   const data = super.$parseJson(json, opt)

  //   // console.log(data)
  //   // // transform stringified wax content to json before storing in the db
  //   // if (data.content && typeof data.content === 'string') {
  //   //   data.content = JSON.parse(data.content)
  //   // }

  //   console.log('data after')
  //   console.log(data)

  //   return data
  // }
}

module.exports = Comments
