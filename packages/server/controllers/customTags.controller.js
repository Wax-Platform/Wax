const { logger, useTransaction } = require('@coko/server')
const CustomTag = require('../models/customTag/customTag.model')

const getCustomTags = async (options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        logger.info('>>> fetching all the custom tags')

        const { result: customTags } = await CustomTag.find(
          { deleted: false },
          { trx: tr },
        )

        if (!customTags) {
          throw new Error(`CustomTags error: Could not fetch Tags`)
        }

        return customTags
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    throw new Error(e)
  }
}

const addCustomTag = async (label, tagType, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const newCustomTag = await CustomTag.insert(
          {
            label,
            tagType,
          },
          { trx: tr },
        )

        logger.info(`>>> new custom tag created with id ${newCustomTag.id}`)
        return newCustomTag
      },
      { trx },
    )
  } catch (e) {
    throw new Error(e)
  }
}

const updateCustomTag = async (tags, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        await Promise.all(
          tags.map(async tag => {
            const { id, deleted, tagType, label } = tag
            logger.info(`>>> updating custom tag with id ${id}`)
            return CustomTag.patchAndFetchById(
              id,
              {
                label,
                deleted,
                tagType,
              },
              { trx: tr },
            )
          }),
        )

        const { result: customTags } = await CustomTag.find(
          { deleted: false },
          { trx: tr },
        )

        return customTags
      },
      { trx },
    )
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  getCustomTags,
  addCustomTag,
  updateCustomTag,
}
