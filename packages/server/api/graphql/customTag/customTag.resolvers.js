const { logger, pubsubManager } = require('@coko/server')

const { CUSTOM_TAGS_UPDATED } = require('./constants')

const {
  getCustomTags,
  addCustomTag,
} = require('../../../controllers/customTags.controller')

const getCustomTagsHandler = async (_, input, ctx) => {
  try {
    logger.info('custom tags resolver: executing getCustomTags use case')
    return getCustomTags()
  } catch (e) {
    throw new Error(e)
  }
}

const addCustomTagHandler = async (_, { input }, ctx) => {
  try {
    logger.info('custom tags resolver: executing addCustomTag use case')
    
    const { label, tagType } = input

    const newCustomTag = await addCustomTag(label, tagType)
    const updatedCustomTags = await getCustomTags()
    const subPayload = []

    updatedCustomTags.forEach(tag => subPayload.push(tag.id))

    subscriptionManager.publish(CUSTOM_TAGS_UPDATED, {
      customTagsUpdated: subPayload,
    })
    logger.info('custom tags resolver: broadcasting new custom tag to clients')
    return newCustomTag
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  Query: {
    getCustomTags: getCustomTagsHandler,
  },
  Mutation: {
    addCustomTag: addCustomTagHandler,
  },
  Subscription: {
    customTagsUpdated: {
      subscribe: async () => {
        
        return subscriptionManager.asyncIterator(CUSTOM_TAGS_UPDATED)
      },
    },
  },
}
