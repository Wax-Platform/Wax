const {
  subscriptionManager,
  logger,
  deleteFiles,
  createFile,
} = require('@coko/server')

const fs = require('node:fs')
const path = require('node:path')
const { UPDATE_APPLICATION_PARAMETERS } = require('./constants')
const { File } = require('../../../models').models

const {
  getApplicationParameters,
  updateApplicationParameters,
} = require('../../../controllers/applicationParameter.controller')

const getApplicationParametersHandler = async (_, args, ctx) => {
  try {
    const { context, area } = args
    logger.info(
      'application parameters resolver: executing getApplicationParameters use case',
    )

    return getApplicationParameters(context, area)
  } catch (e) {
    throw new Error(e)
  }
}

const updateApplicationParametersHandler = async (_, { input }, ctx) => {
  try {
    const { context, area, config } = input
    

    logger.info(
      'application parameters resolver: executing updateApplicationParameters use case',
    )

    const updatedApplicationParameters = await updateApplicationParameters(
      context,
      area,
      config,
    )

    logger.info(
      'application parameters resolver: broadcasting updated application parameters to clients',
    )

    subscriptionManager.publish(UPDATE_APPLICATION_PARAMETERS, {
      updateApplicationParameters: updatedApplicationParameters.id,
    })

    return updatedApplicationParameters
  } catch (e) {
    throw new Error(e)
  }
}

const uploadTranslationHandler = async (_, { file, code }) => {
  const { createReadStream } = await file

  // find and delete old file
  const oldTranslationFile = await File.query()
    .select('*')
    .where('name', code)
    .whereJsonSupersetOf('tags', ['translation'])

  if (oldTranslationFile.length) {
    await deleteFiles([oldTranslationFile[0].id])
  }

  const fileStream = createReadStream()

  // ACL: 'public-read' in the params of fileStorage.uploadFileHandler() to make the url permanent
  const { id } = await createFile(
    fileStream,
    code,
    null,
    null,
    ['translation'],
    null,
  )

  // save a copy in the mounted folder
  // NOTE: if the s3 file url would be permanent we wouldn't need to do this
  await new Promise(resolve => {
    createReadStream()
      .pipe(
        fs.createWriteStream(
          path.join(__dirname, '../../../config/languages', `${code}.json`),
        ),
      )
      .on('close', resolve)
  })

  return id
}

module.exports = {
  Query: {
    getApplicationParameters: getApplicationParametersHandler,
  },
  Mutation: {
    updateApplicationParameters: updateApplicationParametersHandler,
    uploadTranslation: uploadTranslationHandler,
  },
  Subscription: {
    updateApplicationParameters: {
      subscribe: async () => {
        
        return subscriptionManager.asyncIterator(UPDATE_APPLICATION_PARAMETERS)
      },
    },
  },
}
