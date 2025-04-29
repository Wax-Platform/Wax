const { logger, useTransaction } = require('@coko/server')
const Identity = require('@coko/server/src/models/identity/identity.model')
const Team = require('../../models/team/team.model')
const User = require('../../models/user/user.model')
const DocTreeManager = require('../../models/docTreeManager/docTreeManager.model')

const seedAdmin = async userData => {
  try {
    logger.info('### CREATING ADMIN USER ###')

    const { username, password, email, givenNames, surname } = userData

    return useTransaction(async trx => {
      let adminUser
      logger.info(
        '>>> checking if admin user with provided email and username already exists...',
      )

      const existingUsers = await User.query(trx)
        .leftJoin('identities', 'users.id', 'identities.user_id')
        .distinctOn('users.id')
        .where({
          'users.username': username,
          'identities.email': email,
        })

      if (existingUsers.length !== 0) {
        await Promise.all(
          existingUsers.map(async user => {
            const isAdmin = await User.hasGlobalRole(user.id, 'admin', { trx })

            if (isAdmin) {
              logger.warn(
                '>>> an admin user already exists with that credentials in the system',
              )
              return false
            }

            logger.warn(
              '>>> user already exists but will be added in the Admins team',
            )
            adminUser = user
            return Team.addMemberToGlobalTeam(user.id, 'admin', { trx })
          }),
        )
      } else {
        logger.info('creating user')

        const newAdminUser = await User.insert(
          {
            password,
            givenNames,
            surname,
            agreedTc: true,
            isActive: true,
            username,
          },
          { trx },
        )

        await Identity.insert(
          {
            userId: newAdminUser.id,
            isDefault: true,
            isVerified: true,
            email,
          },
          { trx },
        )

        await Team.addMemberToGlobalTeam(newAdminUser.id, 'admin', { trx })

        await DocTreeManager.createUserRootFolder(newAdminUser.id, { trx })

        logger.info(
          `>>> admin user  with username "${username}" successfully created.`,
        )
        adminUser = newAdminUser
        return newAdminUser
      }

      return adminUser
    })
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

module.exports = seedAdmin
