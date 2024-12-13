const { Team, TeamMember } = require('@coko/server')
const PubSubDoc = require('../../models/doc/doc.model')
const User = require('../../models/user/user.model')

const getDocResolver = async (_, { identifier }) =>
  PubSubDoc.query().findOne({ identifier })

module.exports = {
  Query: {
    getDocument: getDocResolver,
  },
  Doc: {
    owner: async doc => {
      const team = await Team.query().findOne({
        objectId: doc.id,
        role: 'author',
        objectType: 'doc',
      })

      if (team) {
        const teamMember = await TeamMember.query().findOne({ teamId: team.id })
        return teamMember ? User.query().findById(teamMember.userId) : null
      }

      return null
    },
  },
}
