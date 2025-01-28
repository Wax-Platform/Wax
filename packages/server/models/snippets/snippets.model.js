const { BaseModel, modelTypes } = require('@coko/server')
const { User } = require('../user/user.model')
const { idNullable } = modelTypes

class Snippet extends BaseModel {
  static get tableName() {
    return 'snippets'
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'snippets.authorId',
          to: 'users.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        authorId: idNullable,
        className: { type: 'string' },
        elementType: { type: 'string' },
        description: { type: 'string' },
        classBody: { type: 'string' },
      },
      required: ['className', 'elementType', 'description', 'classBody'],
    }
  }

  static async get(id, options) {
    const { trx } = options || {}
    return Snippet.query(trx).findById(id)
  }

  static async create(snippet, options) {
    const { trx } = options || {}
    return Snippet.query(trx).insert({ ...snippet })
  }

  static async update(id, snippet, options) {
    const { trx } = options || {}
    return Snippet.query(trx).patchAndFetchById(id, snippet)
  }

  static async remove(id, options) {
    const { trx } = options || {}
    return Snippet.query(trx).deleteById(id)
  }
}

module.exports = Snippet
