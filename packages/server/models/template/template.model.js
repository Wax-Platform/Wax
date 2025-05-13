const { BaseModel } = require('@coko/server')
const remove = require('lodash/remove')
const Base = require('../ketidaBase')

const {
  id,
  stringNotEmpty,
  string,
  targetType,
  notesType,
  booleanDefaultFalse,
  booleanDefaultTrue,
} = require('../helpers').schema

class Template extends Base {
  constructor(properties) {
    super(properties)
    this.type = 'template'
  }

  static get tableName() {
    return 'template'
  }

  static get schema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        name: stringNotEmpty,
        referenceId: id,
        thumbnailId: id,
        author: string,
        target: targetType,
        trimSize: string,
        default: booleanDefaultFalse,
        exportScripts: {
          type: ['object', 'array'],
        },
        notes: notesType,
        url: string,
        enabled: booleanDefaultTrue,
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable global-require */
    const File = require('../file/file.model')
    /* eslint-enable global-require */
    return {
      files: {
        relation: BaseModel.HasManyRelation,
        modelClass: File,
        join: {
          from: 'template.id',
          to: 'files.object_id',
        },
      },
      thumbnail: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: File,
        join: {
          from: 'template.thumbnail_id',
          to: 'files.id',
        },
      },
    }
  }

  async getFiles(tr = undefined) {
    const { thumbnailId } = this
    const associatedFiles = await this.$relatedQuery('files', tr)

    if (thumbnailId) {
      remove(associatedFiles, file => file.id === thumbnailId)
    }

    remove(associatedFiles, file => file.deleted === true)
    return associatedFiles
  }

  async getThumbnail(tr = undefined) {
    /* eslint-disable global-require */
    const File = require('../file/file.model')
    /* eslint-enable global-require */

    const { thumbnailId } = this

    try {
      if (thumbnailId) {
        const file = await File.findById(thumbnailId, { trx: tr })
        return file
      }

      return null
    } catch (error) {
      return null
    }
  }
}

module.exports = Template
