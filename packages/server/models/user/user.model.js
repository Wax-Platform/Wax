const { User: UserModel } = require('@coko/server')

class User extends UserModel {
  static async getDisplayName(user) {
    if (user.displayName) return user.displayName

    // temporary fix: handle creation of user during SSO to avoid null display names
    const { givenNames, surname, username } = user
    if (givenNames && surname) return `${givenNames} ${surname}`
    if (username) return username

    return '[invalid display name]'

    // return user.getDisplayName()
  }
}

module.exports = User
