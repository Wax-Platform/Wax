const { logger, fileStorage, useTransaction } = require('@coko/server')
const Template = require('../../models/template/template.model')
const { capitalize } = require('lodash')
const { fetchAndStoreTemplate } = require('../../services/files.service')

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
    rawCss: async template => {
      const { meta, rawCss } = template
      const { fontsReplacement } = meta || {}
      let css = rawCss

      if (fontsReplacement) {
        const fontPromises = Object.entries(fontsReplacement).map(
          async ([fontName, storedObjectKey]) => {
            const fontUrl = await fileStorage.getURL(storedObjectKey)
            const normalizedFontName = fontName.replace(
              /^\.\.\/fonts\/|^\/fonts\//,
              '',
            )
            const fontRegex1 = new RegExp(`url\\(['"]?${fontName}['"]?\\)`, 'g')
            const fontRegex2 = new RegExp(
              `url\\(['"]?/fonts/${normalizedFontName}['"]?\\)`,
              'g',
            )
            const fontRegex3 = new RegExp(
              `url\\(['"]?../fonts/${normalizedFontName}['"]?\\)`,
              'g',
            )
            css = css.replace(fontRegex1, `url('${fontUrl}')`)
            css = css.replace(fontRegex2, `url('${fontUrl}')`)
            css = css.replace(fontRegex3, `url('${fontUrl}')`)
          },
        )
        await Promise.all(fontPromises)
      }

      return css
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
    fetchAndCreateTemplateFromUrl: async (_, { url }, ctx) => {
      const { user: userId } = ctx
      try {
        await useTransaction(
          async trx => {
            await fetchAndStoreTemplate(url, trx, {
              userId,
              category: 'user',
              status: 'private',
            })
          },
          { passedTrxOnly: true },
        )
        return true
      } catch (error) {
        logger.error('Error fetching and storing template:', error)
        return false
      }
    },
  },
}

module.exports = resolvers
