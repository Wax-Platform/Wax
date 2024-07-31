const { logger } = require('@coko/server')
const { AiDesignerMisc } = require('../models')

const getOrCreateAidMiscResolver = async (_, { input }, ctx) => {
  const { docId } = input
  logger.info(AiDesignerMisc)
  const foundOrNew = await AiDesignerMisc.findByUserIdOrCreate({
    userId: ctx.user,
    docId,
  })

  return foundOrNew
}
const getAidMiscById = async (_, { id }) => {
  try {
    const aidmisc = await AiDesignerMisc.query().findById(id)
    return aidmisc
  } catch (err) {
    logger.error(`No record found in table: "${AiDesignerMisc.tableName}"`, err)
    return null
  }
}
const getCssTemplate = async (_, input, ctx) => {
  const userId = ctx.user
  try {
    const css = await AiDesignerMisc.updateTemplates({ userId, ...input })
    return css
  } catch (error) {
    logger.error('No template found', error)
    return null
  }
}

const updateSnippetsResolver = async (_, { snippets }, ctx) => {
  const userId = ctx.user
  try {
    const updatedSnippets = await AiDesignerMisc.updateSnippets(
      userId,
      snippets,
    )
    return updatedSnippets
  } catch (error) {
    logger.error('No snippets found', error)
    return null
  }
}

module.exports = {
  getAidMiscById,
  getOrCreateAidMiscResolver,
  getCssTemplate,
  updateSnippetsResolver,
}
