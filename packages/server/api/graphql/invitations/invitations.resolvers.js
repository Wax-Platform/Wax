const {
  deleteInvitation,
  getEmailInvitations,
  sendInvitations,
  getInvitations,
  updateInvitation,
} = require('../../../controllers/invitations.controller')

const { addTeamMembers } = require('../../../controllers/team.controller')
const { getIdentityByToken } = require('../../../controllers/user.controller')

const sendInvitationsHandler = async (_, invitationData, ctx) => {
  try {
    return sendInvitations(invitationData, ctx.userId)
  } catch (e) {
    throw new Error(e)
  }
}

const invitationHandler = async (_, { token }, ctx) => {
  try {
    const identity = await getIdentityByToken(token)

    const invitations = await getEmailInvitations(identity.email)

    if (invitations.length) {
      Promise.all(
        invitations.map(async invitation => {
          // Add member to team
          await addTeamMembers(
            invitation.teamId,
            [identity.userId],
            invitation.status,
          )

          // Clean up invitation
          await deleteInvitation(invitation.bookComponentId, invitation.email)
        }),
      )
    }
  } catch (e) {
    throw new Error(e)
  }
}

const getInvitationsResolver = async (_, { bookComponentId }) => {
  return getInvitations(bookComponentId)
}

const deleteInvitationHandler = async (_, { bookComponentId, email }) => {
  return deleteInvitation(bookComponentId, email)
}

const updateInvitationHandler = async (
  _,
  { bookComponentId, email, status },
) => {
  return updateInvitation(bookComponentId, email, status)
}

module.exports = {
  Query: {
    getInvitations: getInvitationsResolver,
  },
  Mutation: {
    sendInvitations: sendInvitationsHandler,
    handleInvitation: invitationHandler,
    deleteInvitation: deleteInvitationHandler,
    updateInvitation: updateInvitationHandler,
  },
}
