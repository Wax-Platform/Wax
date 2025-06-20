const { BaseModel } = require('@coko/server')

class FileManager extends BaseModel {
  static get schema() {
    return {
      type: 'object',
      required: ['name', 'extension'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        fileId: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        parentId: { type: 'string', format: 'uuid' },
        metadata: {
          type: 'object',
          properties: {
            bookComponetId: {
              type: 'array',
            },
          },
        },
        created: { type: 'string', format: 'date-time' },
        userId: { type: 'string', format: 'uuid' },
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable global-require */
    const File = require('../file/file.model')
    const User = require('../user/user.model')

    /* eslint-enable global-require */

    return {
      file: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: File,
        join: {
          from: 'file_manager.file_id',
          to: 'file_manager.id',
        },
      },
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'file_manager.user_id',
          to: 'users.id',
        },
      },
    }
  }
}

module.exports = FileManager
