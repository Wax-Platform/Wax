const User = require('../../user/user.model')
const Loader = require('../loader')

const UserLoader = {
  userTeams: new Loader(async id =>
    // eslint-disable-next-line no-return-await
    User.findOne(
      { id },
      {
        related: 'teams',
      },
    ),
  ),
}

module.exports = UserLoader
