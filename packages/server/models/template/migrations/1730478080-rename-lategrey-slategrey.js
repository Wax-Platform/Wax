const { logger, useTransaction } = require('@coko/server')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      await knex('template').transacting(trx).where('name', 'lategrey').update({
        name: 'slategrey',
      })
    })
  } catch (e) {
    logger.error(e)
    throw new Error(
      'Migration: Template: renamed "lategrey" to "slategrey" successfully.',
    )
  }
}

exports.down = async knex => {
  try {
    return useTransaction(async trx => {
      await knex('template')
        .transacting(trx)
        .where('name', 'slategrey')
        .update({
          name: 'lategrey',
        })
    })
  } catch (e) {
    logger.error(e)
    throw new Error(
      `Migration: Template: renaming "lategrey" to "slategrey" failed`,
    )
  }
}
