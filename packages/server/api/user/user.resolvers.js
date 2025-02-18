const { logger, pubsubManager } = require('@coko/server')
const {
  getDisplayName,
  updateUserProfile,
  getDocuments,
} = require('../../controllers/user.controllers')
const { User } = require('../../models')

const displayNameResolver = async user => {
  return getDisplayName(user)
}

const updateUserProfileResolver = async (_, { input }, ctx) => {
  return updateUserProfile(ctx.user, input)
}

const documentsResolver = async user => {
  return getDocuments(user)
}

module.exports = {
  Mutation: {
    updateUserProfile: updateUserProfileResolver,
  },
  User: {
    displayName: displayNameResolver,
    color: async user => {
      if (user.color !== null) return user.color

      const arrayColor = [
        '#D9E3F0',
        '#F47373',
        '#697689',
        '#37D67A',
        '#2CCCE4',
        '#555555',
        '#dce775',
        '#ff8a65',
        '#ba68c8',
      ]

      return arrayColor[Math.floor(Math.random() * arrayColor.length)]
    },
  },
  Query: {
    getUser: async (_, { id }, ctx) => {
      const user = await User.query().findById(id)
      logger.info('getUser', { user })
      pubsubManager
      return user
    },
  },
}
