const { modelTypes } = require('@coko/server')
const UserModel = require('@coko/server/src/models/user/user.model')

const { stringNullable } = modelTypes

class User extends UserModel {
  static get schema() {
    return {
      type: 'object',
      required: [],
      properties: {
        email: stringNullable,
        userName: stringNullable,
        displayName: stringNullable,
        color: stringNullable,
      },
    }
  }

  static async getDisplayName(user) {
    if (user.displayName) return user.displayName
    return user.getDisplayName()
  }

  static async getEmail(user) {
    if (user.email) return user.email
    return user.getEmail()
  }

  static async getUsername(user) {
    if (user.username) return user.username
    return user.getUsername()
  }
}

module.exports = User
