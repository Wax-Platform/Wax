/*
  BookCollectionTranslation: Translatable fields of a collection of books

  Translations might more often be useful for books and their components,
  but collections of books might have some related translatable data as well
  (eg. a description).
*/

const { BaseModel } = require('@coko/server')

const Translation = require('../translation')
const { id, string } = require('../helpers').schema

class BookCollectionTranslation extends Translation {
  constructor(properties) {
    super(properties)
    this.type = 'bookCollectionTranslation'
  }

  static get tableName() {
    return 'BookCollectionTranslation'
  }

  static get relationMappings() {
    /* eslint-disable global-require */
    const BookCollection = require('../bookCollection/bookCollection.model')
    /* eslint-enable global-require */
    return {
      bookCollection: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: BookCollection,
        join: {
          from: 'BookCollectionTranslation.collectionId',
          to: 'BookCollection.id',
        },
      },
    }
  }

  static get schema() {
    return {
      type: 'object',
      required: ['collectionId', 'title'],
      properties: {
        collectionId: id,
        description: string,
        title: string,
      },
    }
  }

  getCollection() {
    return this.$relatedQuery('bookCollection')
  }
}

module.exports = BookCollectionTranslation
