const Identity = require('@coko/server/src/models/identity/identity.model')
const { logger } = require('@coko/server')

// /* eslint-disable import/no-unresolved */
// const User = require('../models/user/user.model')
// const Team = require('../models/team/team.model')
// /* eslint-enable import/no-unresolved */
const { User, Team } = require('@pubsweet/models')

exports.up = async knex => {
  try {
    const { result: users } = await User.find({})
    let adminTeam = await Team.findOne({ role: 'admin', global: true })

    if (!adminTeam) {
      adminTeam = await Team.insert({
        role: 'admin',
        displayName: 'Admin',
        global: true,
      })
    }

    await Promise.all(
      users.map(async user => {
        if (user.admin) {
          await Team.addMemberToGlobalTeam(user.id, 'admin')
        }

        await user.patch({
          agreedTc: true,
          isActive: true,
          givenNames: user.givenName,
        })
        await Identity.insert({
          userId: user.id,
          isDefault: true,
          isVerified: true,
          email: user.email,
        })
      }),
    )

    const hasColumnAdmin = await knex.schema.hasColumn('users', 'admin')
    const hasColumnEmail = await knex.schema.hasColumn('users', 'email')

    const hasColumnGivenName = await knex.schema.hasColumn(
      'users',
      'given_name',
    )

    const hasColumnFragments = await knex.schema.hasColumn('users', 'fragments')

    const hasColumnCollections = await knex.schema.hasColumn(
      'users',
      'collections',
    )

    const hasColumnTeams = await knex.schema.hasColumn('users', 'teams')

    return knex.schema.table('users', table => {
      if (hasColumnAdmin) {
        table.dropColumn('admin')
      }

      if (hasColumnEmail) {
        table.dropColumn('email')
      }

      if (hasColumnGivenName) {
        table.dropColumn('given_name')
      }

      if (hasColumnFragments) {
        table.dropColumn('fragments')
      }

      if (hasColumnCollections) {
        table.dropColumn('collections')
      }

      if (hasColumnTeams) {
        table.dropColumn('teams')
      }
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Users: moving old data failed`)
  }
}
