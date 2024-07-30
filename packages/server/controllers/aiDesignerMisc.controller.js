const { logger } = require('@coko/server')
const { AiDesignerMisc } = require('../models')
const getAidMiscByUserIdResolver = async (_, { input }) => {
  const { userId, docId } = input
  logger.info(AiDesignerMisc)
  const foundOrNew = await AiDesignerMisc.findByUserIdOrCreate({
    userId,
    docId,
  })

  return foundOrNew
}
module.exports = {
  getAidMiscByUserIdResolver,
}
