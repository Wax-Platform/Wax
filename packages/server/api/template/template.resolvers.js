const { logger, fileStorage } = require('@coko/server')
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
      return !!template.fileId
    },
    imageUrl: async template => {
      const { meta } = template
      const imageUrl = meta?.imageKey
        ? await fileStorage.getURL(meta?.imageKey)
        : ''
      return imageUrl
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
    createTemplate: async (_, { input }, ctx) => {
      const { user: userId } = ctx

      try {
        const newTemplate = await Template.query().insert({
          userId,
          category: 'user',
          status: 'private',
          ...input,
        })
        return newTemplate.id
      } catch (error) {
        logger.error('Error creating template', error)
        throw new Error('Error creating template', error)
      }
    },
    updateTemplateCss: async (_, { id, ...restFields }) => {
      const updatedTemplate = await Template.query().patchAndFetchById(id, {
        ...restFields,
      })
      return updatedTemplate.id
    },
    deleteTemplate: async (_, { id }) => {
      await Template.query().deleteById(id)
      return id
    },
    renameTemplate: async (_, { id, displayName }) => {
      const updatedTemplate = await Template.query().patchAndFetchById(id, {
        displayName,
      })
      return updatedTemplate.id
    },
  },
}

module.exports = resolvers
