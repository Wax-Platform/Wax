const { Doc, Team, TeamMember, User } = require('@pubsweet/models')
const Template = require('../../models/template/template.model')
const { logger } = require('@coko/server')

const getDocResolver = async (_, { identifier }) => {
  const doc = await Doc.query().findOne({ identifier })
  return doc
}
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
    template: async doc => {
      const docTemplate = await Template.query().findById(doc.templateId)
      return docTemplate
    },
    title: async doc => {
      const ResourceTree = require('../../models/resourceTree/resourceTree.model')

      const titleFromResource = await ResourceTree.query().findOne({
        docId: doc.id,
      })
      return titleFromResource.title || ''
    },
    resourceId: async doc => {
      const ResourceTree = require('../../models/resourceTree/resourceTree.model')

      const resource = await ResourceTree.query().findOne({ docId: doc.id })
      return resource.id
    },
  },
}
