const { File: FileBase, BaseModel } = require('@coko/server')

class File extends FileBase {
  static get relationMappings() {
    /* eslint-disable global-require */
    const Book = require('../book/book.model')
    const BookComponent = require('../bookComponent/bookComponent.model')
    const Template = require('../template/template.model')
    /* eslint-enable global-require */

    return {
      book: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Book,
        join: {
          from: 'files.object_id',
          to: 'book.id',
        },
      },
      bookComponent: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: BookComponent,
        join: {
          from: 'files.object_id',
          to: 'BookComponent.id',
        },
      },
      template: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Template,
        join: {
          from: 'files.object_id',
          to: 'Template.id',
        },
      },
    }
  }

  getBook() {
    return this.$relatedQuery('book')
  }

  getBookComponent() {
    return this.$relatedQuery('bookComponent')
  }

  getTemplate() {
    return this.$relatedQuery('template')
  }
}

module.exports = File
