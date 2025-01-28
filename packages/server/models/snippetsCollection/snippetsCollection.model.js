const { BaseModel, modelTypes } = require('@coko/server')
const User = require('../user/user.model')
const Doc = require('../doc/doc.model')
const { idNullable, string, id } = modelTypes

class SnippetCollection extends BaseModel {
  static get tableName() {
    return 'snippets_collection'
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'snippets_collection.authorId',
          to: 'users.id',
        },
      },
      doc: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Doc,
        join: {
          from: 'snippets_collection.docId',
          to: 'docs.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        docId: idNullable,
        authorId: idNullable,
        displayName: string,
        snippets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id,
              className: { type: 'string' },
              elementType: { type: 'string' },
              description: { type: 'string' },
              classBody: { type: 'string' },
            },
          },
        },
        isPublic: { type: 'boolean' },
      },
    }
  }
}

module.exports = SnippetCollection
