const { BaseModel, modelTypes } = require('@coko/server')
const { idNullable, arrayOfIds } = modelTypes
const { User } = require('..')

class AiDesignerMisc extends BaseModel {
  constructor(props) {
    super(props)
    this.type = 'aidmisc'
  }

  static get tableName() {
    return 'aidmisc_table'
  }

  static get schema() {
    return {
      type: 'object',
      properties: {
        userId: idNullable,
        templates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              relatedDocs: arrayOfIds,
              name: { type: 'string' },
              css: { type: 'string' },
            },
            required: ['name', 'css'],
          },
        },
        snippets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              className: { type: 'string' },
              elementType: { type: 'string' },
              description: { type: 'string' },
              classBody: { type: 'string' },
            },
            required: ['className', 'elementType', 'description', 'classBody'],
          },
        },
      },
    }
  }

  static get relationMappings() {
    return {
      book: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'aidmisc_table.userId',
          to: 'users.id',
        },
      },
    }
  }
}

module.exports = AiDesignerMisc
