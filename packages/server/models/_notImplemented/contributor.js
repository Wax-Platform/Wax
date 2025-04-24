/**
 * INHERITED
 * id
 *
 */

// TO DO -- how about a user id in case a contributor is a user?
// we wouldn't need fullName and email in that case

const Base = require('../ketidaBase')
const { email, string } = require('../helpers').schema

class Contributor extends Base {
  constructor(properties) {
    super(properties)
    this.type = 'contributor'
  }

  static get tableName() {
    return 'Contributor'
  }

  static get schema() {
    return {
      // TO DO -- revisit once first / last name discussion is finished
      fullName: string,
      email,
      role: string,
    }
  }
}

module.exports = Contributor
