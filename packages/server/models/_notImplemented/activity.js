/**
 * ALREADY THERE
 * id: varchar(255)
 * created (timestamp)
 * deleted
 *
 * FOREIGN KEYS
 * userid
 *
 * */

/*
  Model representing an activity in wax
  Activities are flexible by definition and could be any CRUD operation on any
  object.
*/

const Base = require('../ketidaBase')
const { foreignType, id, object } = require('../helpers').schema

class Activity extends Base {
  constructor(properties) {
    super(properties)
    this.type = 'activity'
  }

  static get tableName() {
    return 'Activity'
  }

  static get schema() {
    return {
      foreignId: id,
      foreignType,
      operation: {
        type: 'string',
        enum: ['create', 'delete', 'update'],
      },
      oldValue: object,
      change: object,
    }
  }
}

module.exports = Activity
