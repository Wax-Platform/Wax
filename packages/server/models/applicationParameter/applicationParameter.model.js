// TO DO -- review foreign id and foreign type

const { BaseModel } = require('@coko/server')
const { stringNotEmpty } = require('../helpers').schema

class ApplicationParameter extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'applicationParameter'
  }

  static get tableName() {
    return 'application_parameter'
  }

  static get schema() {
    return {
      type: 'object',
      properties: {
        context: stringNotEmpty,
        area: stringNotEmpty,
        config: {
          type: ['object', 'array', 'boolean', 'string'],
        },
      },
    }
  }
}

module.exports = ApplicationParameter
