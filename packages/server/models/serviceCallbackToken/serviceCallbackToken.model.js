const Base = require('../ketidaBase')
const { stringNotEmpty, id } = require('../helpers').schema

class ServiceCallbackToken extends Base {
  constructor(properties) {
    super(properties)
    this.type = 'serviceCallbackToken'
  }

  static get tableName() {
    return 'serviceCallbackToken'
  }

  static get schema() {
    return {
      type: 'object',
      required: ['bookComponentId', 'responseToken'],
      properties: {
        bookComponentId: id,
        responseToken: stringNotEmpty,
      },
    }
  }
}

module.exports = ServiceCallbackToken
