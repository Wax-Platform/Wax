const { logger, subscriptionManager  } = require('@coko/server')

const {
  subscriptions: { USER_UPDATED },
} = require('@coko/server/src/models/user/constants')

const {
  updateTeamMembership,
} = require('@coko/server/src/models/team/team.controller')

const { getUser } = require('@coko/server/src/models/user/user.controller')

const TeamMember = require('@coko/server/src/models/teamMember/teamMember.model')

const {
  updateTeamMemberStatus,
  updateTeamMemberStatuses,
  addTeamMembers,
  getGlobalTeams,
  getObjectTeams,
} = require('../../../controllers/team.controller')

const {
  TEAM_MEMBERS_UPDATED,
  BOOK_PRODUCTION_EDITORS_UPDATED,
  TEAM_UPDATED,
} = require('./constants')

const updateKetidaTeamMembersHandler = async (
  _,
  { teamId, members, status },
  ctx,
) => {
  try {
    
    logger.info('team resolver: executing updateTeamMembers use case')
    const updatedTeam = await updateTeamMembership(teamId, members)

    await updateTeamMemberStatuses(teamId, status)

    if (updatedTeam.global === true) {
      subscriptionManager.publish(TEAM_MEMBERS_UPDATED, {
        teamMembersUpdated: updatedTeam.id,
      })

      return updatedTeam
    }

    if (updatedTeam.role === 'productionEditor') {
      subscriptionManager.publish(BOOK_PRODUCTION_EDITORS_UPDATED, {
        productionEditorsUpdated: updatedTeam.id,
      })
    }

    await Promise.all(
      members.map(async userId => {
        const user = await getUser(userId)

        return subscriptionManager.publish(USER_UPDATED, {
          userUpdated: user,
        })
      }),
    )

    subscriptionManager.publish(TEAM_MEMBERS_UPDATED, {
      teamMembersUpdated: updatedTeam.id,
    })
    logger.info(`Update msg broadcasted`)
    return updatedTeam
  } catch (e) {
    throw new Error(e)
  }
}

const updateTeamMemberStatusHandler = async (
  _,
  { teamMemberId, status },
  ctx,
) => {
  try {
    
    const updatedTeam = await updateTeamMemberStatus(teamMemberId, status)

    const teamMember = await TeamMember.findOne({ id: teamMemberId })
    const user = await getUser(teamMember.userId)

    subscriptionManager.publish(TEAM_UPDATED, {
      teamUpdated: updatedTeam.id,
    })

    subscriptionManager.publish(USER_UPDATED, {
      userUpdated: user,
    })
    return updatedTeam
  } catch (e) {
    throw new Error(e)
  }
}

const addTeamMembersHandler = async (
  _,
  { teamId, members, status, bookId, bookComponentId },
  ctx,
) => {
  try {
    
    logger.info('team resolver: executing addTeamMembers use case')

    const updatedTeam = await addTeamMembers(
      teamId,
      members,
      status,
      bookId,
      bookComponentId,
      ctx.userId,
    )

    if (updatedTeam.global === true) {
      subscriptionManager.publish(TEAM_MEMBERS_UPDATED, {
        teamMembersUpdated: updatedTeam.id,
      })

      return updatedTeam
    }

    if (updatedTeam.role === 'productionEditor') {
      subscriptionManager.publish(BOOK_PRODUCTION_EDITORS_UPDATED, {
        productionEditorsUpdated: updatedTeam.id,
      })
    }

    await Promise.all(
      members.map(async userId => {
        const user = await getUser(userId)

        return subscriptionManager.publish(USER_UPDATED, {
          userUpdated: user,
        })
      }),
    )

    subscriptionManager.publish(TEAM_MEMBERS_UPDATED, {
      teamMembersUpdated: updatedTeam.id,
    })
    logger.info(`Update msg broadcasted`)
    return updatedTeam
  } catch (e) {
    throw new Error(e)
  }
}

const getObjectTeamsResolver = async (_, { objectId, objectType }, ctx) => {
  try {
    logger.info(`TEAM_RESOLVER getObjectTeams`)
    return getObjectTeams(objectId, objectType)
  } catch (e) {
    logger.error(`TEAM_RESOLVER getObjectTeams: ${e.message}`)
    throw new Error(e)
  }
}

const getGlobalTeamsResolver = async (_, { where }, ctx) => {
  try {
    logger.info(`TEAM_RESOLVER getGlobalTeams`)
    return getGlobalTeams()
  } catch (e) {
    logger.error(`TEAM_RESOLVER getGlobalTeams: ${e.message}`)
    throw new Error(e)
  }
}


module.exports = {
  Query: {
    getGlobalTeams: getGlobalTeamsResolver,
    getObjectTeams: getObjectTeamsResolver,
  },
  Mutation: {
    updateKetidaTeamMembers: updateKetidaTeamMembersHandler,
    updateTeamMemberStatus: updateTeamMemberStatusHandler,
    addTeamMembers: addTeamMembersHandler,
  },
  Subscription: {
    teamMembersUpdated: {
      subscribe: async () => {
        
        return subscriptionManager.asyncIterator(TEAM_MEMBERS_UPDATED)
      },
    },
    productionEditorsUpdated: {
      subscribe: async () => {
        
        return subscriptionManager.asyncIterator(BOOK_PRODUCTION_EDITORS_UPDATED)
      },
    },
    teamUpdated: {
      subscribe: async () => {
        
        return subscriptionManager.asyncIterator(TEAM_UPDATED)
      },
    },
  },
}
