const { useTransaction, logger } = require('@coko/server')

const {
  notify,
  notificationTypes: { EMAIL },
} = require('@coko/server/src//services')

const { bookComponentInvite } = require('./helpers/emailTemplates')

const { Invitations, Book } = require('../models').models

const sendInvitations = async (invitationData, userId, options = {}) => {
  try {
    const { trx } = options
    logger.info(`sendInvitations: to ${invitationData.members.join(', ')}`)

    // const book = await Book.getUserBookDetails(userId, invitationData.bookComponentId, {
    //   trx,
    // })

    const bookComponent = await BookComponent.getUserBookComponentDetails(userId, invitationData.bookComponentId, {
      trx,
    })


    const invitations = invitationData.members.map(member => ({
      teamId: invitationData.teamId,
      email: member,
      status: invitationData.status,
      bookComponentId: bookComponent.id,
    }))

    const emailInvitations = invitations.map(invitation =>
      bookComponentInvite({
        email: invitation.email,
        bookComponentTitle: bookComponent.title,
        sharerEmail: bookComponent.email,
        sharerName: bookComponent.name,
        bookComponentId: bookComponent.id,
        status: invitation.status,
      }),
    )

    // Using Promise.all b/c batchInsert is not implemented in @coko/server
    return Promise.all(
      invitations.map(async invitation => {
        return useTransaction(
          async tr => Invitations.insert(invitation, { trx: tr }),
          {
            trx,
          },
        )
      }),
    )
      .then(() => {
        // Send email invitations
        Promise.all(emailInvitations.map(email => notify(EMAIL, email)))

        return getInvitations(bookComponent.id)
      })
      .catch(() => {
        throw new Error('Invitation already sent.')
      })
  } catch (e) {
    throw new Error(e)
  }
}

const deleteInvitation = async (bookComponentId, email, options = {}) => {
  try {
    const { trx } = options
    logger.info(`deleteInvitation: email ${email}`)

    return useTransaction(
      async tr => Invitations.query(tr).where({ email, bookComponentId }).del(),
      {
        trx,
      },
    ).then(() => getInvitations(bookComponentId))
  } catch (e) {
    throw new Error(e)
  }
}

const getInvitations = async (bookComponentId, options = {}) => {
  try {
    const { trx } = options
    logger.info(`getInvitations: for book ${bookComponentId}`)

    return useTransaction(
      async tr => {
        const invitations = await Invitations.query(tr).where({ bookComponentId })

        return [
          {
            role: 'invitations',
            members: invitations?.map(invitation => ({
              status: invitation.status,
              user: {
                displayName: invitation.email,
                email: invitation.email,
              },
            })),
          },
        ]
      },
      {
        trx,
      },
    )
  } catch (e) {
    throw new Error(e)
  }
}

const updateInvitation = async (bookComponentId, email, status, options = {}) => {
  try {
    const { trx } = options
    logger.info(`updateInvitation: email ${email} status ${status}`)

    return useTransaction(
      async tr => Invitations.query(tr).where({ email }).patch({ status }),
      {
        trx,
      },
    ).then(() => getInvitations(bookComponentId))
  } catch (e) {
    throw new Error(e)
  }
}

const getEmailInvitations = async (email, options = {}) => {
  try {
    const { trx } = options
    logger.info(`getEmailInvitations: for email ${email}`)

    return useTransaction(async tr => Invitations.query(tr).where({ email }), {
      trx,
    })
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  sendInvitations,
  deleteInvitation,
  getInvitations,
  getEmailInvitations,
  updateInvitation,
}
