const { BaseModel, modelTypes } = require('@coko/server')
const User = require('../user/user.model')
const Doc = require('../doc/doc.model')
const Snippet = require('../snippets/snippets.model')
const { idNullable } = require('@coko/server/src/models/_helpers/types')
const { id, string, arrayOfIds, objectNullable, stringNullable } = modelTypes

class Template extends BaseModel {
  static get tableName() {
    return 'templates'
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'templates.userId',
          to: 'users.id',
        },
      },
      doc: {
        relation: BaseModel.HasOneRelation,
        modelClass: Doc,
        join: {
          from: 'templates.id',
          to: 'docs.templateId',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        userId: idNullable,
        docId: idNullable,
        objectType: string,
        displayName: string,
        snippets: arrayOfIds,
        inactiveSnippets: arrayOfIds,
        pagedJsCss: stringNullable,
        allowedUsers: arrayOfIds,
        root: objectNullable,
      },
      required: ['objectType', 'displayName', 'snippets'],
    }
  }

  static async getTemplate(id, options) {
    const { trx } = options || {}
    return this.query(trx).findById(id)
  }

  static async getAll(options) {
    const { page, pageSize, trx } = options || {}
    return this.query(trx).page(page, pageSize)
  }

  static async create(userId, fields, options) {
    const { trx } = options || {}
    return this.query(trx).insert({
      userId,
      ...fields,
    })
  }

  static async getByUser(userId, options) {
    const { trx } = options || {}
    return this.query(trx).where('userId', userId)
  }

  static async getByDocId(docId, options) {
    const { trx } = options || {}
    return this.query(trx).where('docId', docId)
  }

  static async update(id, fields, options) {
    const { trx } = options || {}
    return this.query(trx).patchAndFetchById(id, fields)
  }

  static async remove(id, options) {
    const { trx } = options || {}
    const deleteMethod = Array.isArray(id) ? 'deleteByIds' : 'deleteById'
    return this.query(trx)[deleteMethod](id)
  }

  static async withSnippets(id, options) {
    const { trx } = options || {}
    const template = await this.query(trx).findById(id)
    if (!template) {
      throw new Error('Template not found')
    }
    const snippets = await Snippet.query(trx).whereIn('id', template.snippets)
    return { ...template, snippets }
  }

  static async getSystemTemplates(options) {
    const { trx } = options || {}
    return this.query(trx).where('objectType', 'system')
  }

  static async getUserTemplates(userId, options) {
    const { trx } = options || {}
    return this.query(trx)
      .where('objectType', 'user')
      .andWhere('userId', userId)
  }

  static async getDocumentTemplates(docId, options) {
    const { trx } = options || {}
    return this.query(trx)
      .where('objectType', 'document')
      .andWhere('docId', docId)
  }

  static async createSystemTemplate(fields, options) {
    const { trx } = options || {}
    return this.query(trx).insert({
      objectType: 'system',
      ...fields,
    })
  }

  static async createUserTemplate(userId, fields, options) {
    const { trx } = options || {}
    return this.query(trx).insert({
      userId,
      objectType: 'user',
      ...fields,
    })
  }

  static async createDocumentTemplate(docId, fields, options) {
    const { trx } = options || {}
    return this.query(trx).insert({
      docId,
      objectType: 'document',
      ...fields,
    })
  }
}

module.exports = Template
