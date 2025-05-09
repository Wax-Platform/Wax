const { logger, useTransaction } = require('@coko/server')

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      const templates = await trx('template').select('id', 'name')

      await Promise.all(
        templates.map(async template => {
          const { id, name } = template
          await trx('template')
            .where({ id })
            .update({ name: name.toLowerCase() })
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

exports.down = async () => {}
