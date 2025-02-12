const { BaseModel, modelTypes, File } = require('@coko/server')
const User = require('../user/user.model')
const Doc = require('../doc/doc.model')
const { idNullable } = require('@coko/server/src/models/_helpers/types')
const { string, objectNullable, stringNullable } = modelTypes

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
      file: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: File,
        join: {
          from: 'templates.fileId',
          to: 'files.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        userId: idNullable,
        docId: idNullable,
        fileId: idNullable,
        displayName: string,
        category: string,
        meta: objectNullable,
        status: string,
        rawCss: stringNullable,
      },
      required: [],
    }
  }
}

module.exports = Template
