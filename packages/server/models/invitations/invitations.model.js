/*
  Invitations: User invites
*/
const Base = require('../ketidaBase')

const { id, stringNotEmpty, email } = require('../helpers').schema

class Invitations extends Base {
  constructor(properties) {
    super(properties)
    this.type = 'invitations'
  }

  static get tableName() {
    return 'Invitations'
  }

  static get schema() {
    return {
      type: 'object',
      properties: {
        email,
        status: stringNotEmpty,
        teamId: id,
        bookId: id,
      },
    }
  }
}

module.exports = Invitations
