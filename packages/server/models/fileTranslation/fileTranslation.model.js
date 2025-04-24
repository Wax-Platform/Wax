const { Model } = require('objection')

const { string } = require('../helpers').schema

const Translation = require('../translation')
const { id } = require('../helpers').schema

class FileTranslation extends Translation {
  constructor(properties) {
    super(properties)
    this.type = 'fileTranslation'
  }

  static get tableName() {
    return 'FileTranslation'
  }

  static get relationMappings() {
    /* eslint-disable global-require */
    const File = require('../file/file.model')
    /* eslint-enable global-require */

    return {
      file: {
        relation: Model.BelongsToOneRelation,
        modelClass: File,
        join: {
          from: 'FileTranslation.fileId',
          to: 'File.id',
        },
      },
    }
  }

  static get schema() {
    return {
      type: 'object',
      required: ['fileId'],
      properties: {
        fileId: id,
        alt: string,
        description: string,
      },
    }
  }

  getFile() {
    return this.$relatedQuery('file')
  }
}

module.exports = FileTranslation
