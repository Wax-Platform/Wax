const Base = require('../ketidaBase')

const { string } = require('../helpers').schema

class CustomTag extends Base {
  constructor(properties) {
    super(properties)
    this.type = 'customTag'
  }

  static get tableName() {
    return 'custom_tag'
  }

  static get schema() {
    return {
      type: 'object',
      required: ['label'],
      properties: {
        label: string,
        tagType: string,
      },
    }
  }
}

module.exports = CustomTag
