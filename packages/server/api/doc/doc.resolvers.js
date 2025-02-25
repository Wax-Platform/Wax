const { Doc, Team, TeamMember, User } = require('@pubsweet/models')
const { logger } = require('@coko/server')

const getDocResolver = async (_, { identifier }) => {
  const doc = await Doc.query()
    .where({ identifier })
    .select('templateId', 'identifier', 'id')

  logger.info('doc', doc)
  return doc[0]
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
    templateId: async doc => {
      const Template = require('../../models/template/template.model')

      if (!doc.templateId) {
        const template = await Template.query().findOne({ category: 'user' })
        logger.info('templateId', doc.templateId)
        logger.info('template', template.id)
        await Doc.query().patch({ templateId: template.id }).where('id', doc.id)
        return template.id
      }

      return doc.templateId
    },
    // template: async doc => {
    //   const docTemplate = await Template.query().findById(doc.templateId)
    //   return docTemplate
    // },
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
    path: async doc => {
      const ResourceTree = require('../../models/resourceTree/resourceTree.model')
      const path = await ResourceTree.getDocPath(doc.id)

      return path
    },
    sharedWith: async (doc, _, ctx) => {
      const ResourceTree = require('../../models/resourceTree/resourceTree.model')

      const resource = await ResourceTree.query().findOne({ docId: doc.id })
      const userId = ctx.user
      const sharedWith = await ResourceTree.getSharedWith(resource.id)
      const users = await User.query().whereIn('id', sharedWith)
      return users.filter(user => user.id !== userId)
    },
  },
  Mutation: {
    updateDocumentTemplate: async (_, { id, templateId }) => {
      try {
        await Doc.query().patch({ templateId }).where('id', id)
        return true
      } catch (e) {
        logger.error(e)
        return false
      }
    },
  },
}
