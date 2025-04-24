const { logger, useTransaction } = require('@coko/server')
const ApplicationParameter = require('../models/applicationParameter/applicationParameter.model')

const {
  labels: { APPLICATION_PARAMETERS_CONTROLLER },
} = require('./constants')

const getApplicationParameters = async (context, area, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        if (context && area) {
          logger.info(
            `${APPLICATION_PARAMETERS_CONTROLLER} getApplicationParameters: fetching application parameters for ${context} - ${area}`,
          )

          const ap = await ApplicationParameter.query(tr)
            .skipUndefined()
            .where({ context, area })

          return ap
        }

        logger.info(
          `${APPLICATION_PARAMETERS_CONTROLLER} getApplicationParameters: fetching application parameters`,
        )

        return ApplicationParameter.query(tr)
          .skipUndefined()
          .where({ context, area })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(
      `${APPLICATION_PARAMETERS_CONTROLLER} getApplicationParameters: ${e.message}`,
    )
    throw new Error(e)
  }
}

const updateApplicationParameters = async (
  context,
  area,
  config,
  options = {},
) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        logger.info(
          `${APPLICATION_PARAMETERS_CONTROLLER} updateApplicationParameters: updating application parameters for ${context} - ${area}`,
        )

        const { result: applicationParameters } =
          await ApplicationParameter.find(
            {
              context,
              area,
            },
            { trx: tr },
          )

        if (applicationParameters.length !== 1) {
          throw new Error(
            'multiple records for the same application parameters context and area',
          )
        }

        const { id } = applicationParameters[0]

        return ApplicationParameter.patchAndFetchById(
          id,
          {
            config,
          },
          { trx: tr },
        )
      },
      { trx },
    )
  } catch (e) {
    logger.error(
      `${APPLICATION_PARAMETERS_CONTROLLER} updateApplicationParameters: ${e.message}`,
    )
    throw new Error(e)
  }
}

module.exports = {
  getApplicationParameters,
  updateApplicationParameters,
}
