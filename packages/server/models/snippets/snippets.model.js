const { BaseModel, modelTypes } = require('@coko/server')
const { User } = require('../user/user.model')
const { Template } = require('../template/template.model')
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
      template: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Template,
        join: {
          from: 'snippets.templateId',
          to: 'templates.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        authorId: idNullable,
        templateId: idNullable,
        className: { type: 'string' },
        elementType: { type: 'string' },
        description: { type: 'string' },
        classBody: { type: 'string' },
        category: { type: 'string' },
      },
      required: ['className', 'elementType', 'description', 'classBody'],
    }
  }

  static async get(id, options) {
    const { trx } = options || {}
    return Snippet.query(trx).findById(id).withGraphFetched('[user, template]')
  }

  static async getAll(options) {
    const { limit, offset, trx } = options || {}
    return Snippet.query(trx)
      .withGraphFetched('[user, template]')
      .page(offset, limit)
  }

  static async create(authorId, snippet, options) {
    const { trx } = options || {}
    return Snippet.query(trx).insert({ authorId, ...snippet })
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
