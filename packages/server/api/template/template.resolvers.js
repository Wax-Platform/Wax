const { logger } = require('@coko/server')
const Template = require('../../models/template/template.model')
const { capitalize } = require('lodash')

const seedUserTemplates = async userId => {
  const systemTemplates = await Template.query().where('category', 'system')
  logger.info('Seeding user templates', systemTemplates)
  await Promise.all(
    systemTemplates.map(async template => {
      const { docId, fileId, displayName, meta, status, rawCss } = template
      return Template.query().insert({
        userId,
        docId,
        fileId,
        displayName,
        category: 'user',
        meta,
        status,
        rawCss,
      })
    }),
  )
}

const resolvers = {
  Template: {
    displayName: async template => {
      return capitalize(template.displayName.split('.')[0])
    },
    meta: async template => {
      const { meta } = template
      return JSON.stringify(meta)
    },
    isForked: async template => {
      !!template.fileId
    },
  },
  Query: {
    getSystemTemplates: async () => {
      const systemTemplates = await Template.query().where('category', 'system')
      return systemTemplates
    },
    getUserTemplates: async (_, __, ctx) => {
      const { user: userId } = ctx
      logger.info('Getting user templates', userId)
      const userTemplates = await Template.query()
        .where('userId', userId)
        .andWhere('category', 'user')
      if (!userTemplates.length) {
        await seedUserTemplates(userId)
        return Template.query()
          .where('userId', userId)
          .andWhere('category', 'user')
      }
      return userTemplates
    },
  },
  Mutation: {
    createTemplate: async (_, { input }) => {
      const {
        userId,
        docId,
        fileId,
        displayName,
        category,
        meta,
        status,
        rawCss,
      } = input

      const newTemplate = await Template.query().insert({
        userId,
        docId,
        fileId,
        displayName,
        category,
        meta,
        status,
        rawCss,
      })
      return newTemplate.id
    },
    updateTemplateCss: async (_, { id, rawCss }) => {
      const updatedTemplate = await Template.query().patchAndFetchById(id, {
        rawCss,
      })
      return updatedTemplate.id
    },
    deleteTemplate: async (_, { input }) => {
      const { id } = input
      await Template.query().deleteById(id)
      return id
    },
  },
}

module.exports = resolvers
