const { logger, useTransaction } = require('@coko/server')
const Identity = require('@coko/server/src/models/identity/identity.model')
const User = require('../../models/user/user.model')

const seedUser = async (userData, options = {}) => {
  try {
    logger.info('### CREATING USER ###')
    const { trx } = options
    const { username, password, email, givenNames, surname } = userData

    return useTransaction(
      async tr => {
        logger.info(
          '>>> checking if user with provided email and username already exists...',
        )

        const existingUsers = await User.query(tr)
          .leftJoin('identities', 'users.id', 'identities.user_id')
          .distinctOn('users.id')
          .where({
            'users.username': username,
            'identities.email': email,
          })

        if (existingUsers.length !== 0) {
          logger.warn('>>> user already exists but will be added in the team')
          return undefined
        }

        logger.info('creating user')

        const newUser = await User.insert(
          {
            password,
            givenNames,
            surname,
            agreedTc: true,
            isActive: true,
            username,
          },
          { trx: tr },
        )

        await Identity.insert(
          {
            userId: newUser.id,
            isDefault: true,
            isVerified: true,
            email,
          },
          { trx: tr },
        )

        logger.info(
          `>>> Team user  with username "${username}" successfully created.`,
        )

        return newUser
      },
      { trx },
    )
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

module.exports = seedUser
