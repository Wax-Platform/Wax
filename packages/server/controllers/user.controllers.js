const { logger, useTransaction, Team, TeamMember } = require('@coko/server')
const { Doc } = require('../models')
const { User } = require('../models')

const updateUserProfile = async (userId, profileData) => {
  try {
    const { email, ...userData } = profileData

    return useTransaction(async trx => {
      const updatedUser = await User.patchAndFetchById(userId, userData, {
        trx,
      })

      return updatedUser
    })
  } catch (e) {
    logger.error(e)
    throw new Error(e)
  }
}

const getDisplayName = async user => User.getDisplayName(user)

const filterUsers = async (params, options = {}) => {
  try {
    const { trx, ...restOptions } = options

    return useTransaction(
      async tr => {
        logger.info(`filter users by query params`)
        return User.filter(params, {
          trx: tr,
          ...restOptions,
        })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`error filterUsers: ${e.message}`)
    throw new Error(e)
  }
}

const getDocuments = async user => {
  const teams = await TeamMember.query().where({ userId: user.id })

  const objects = await Team.query()
    .whereIn(
      'id',
      teams.map(team => team.teamId),
    )
    .andWhere(builder => {
      builder.where({ objectType: 'doc', role: 'author' })
    })

  return Doc.query().whereIn(
    'id',
    objects.map(obj => obj.objectId),
  )
}

module.exports = {
  updateUserProfile,
  filterUsers,
  getDisplayName,
  getDocuments,
}
