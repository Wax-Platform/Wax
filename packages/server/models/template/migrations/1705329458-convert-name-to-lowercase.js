const { logger, useTransaction } = require('@coko/server')
const { Template } = require('@pubsweet/models')

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      const templates = await Template.query(trx)
      return Promise.all(
        templates.map(async template => {
          const { name: storedName, id } = template
          return Template.patchAndFetchById(
            id,
            {
              name: storedName.toLowerCase(),
            },
            { trx },
          )
        }),
      )
    })
  } catch (e) {
    logger.error(e)
    throw new Error(
      'Migration: Template: converting all the template names to lower case failed',
    )
  }
}
