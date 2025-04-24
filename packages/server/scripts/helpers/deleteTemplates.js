const { logger } = require('@coko/server')

const {
  connectToFileStorage,
} = require('@coko/server/src/services/fileStorage')

const Template = require('../../models/template/template.model')
const { deleteFiles } = require('../../controllers/file.controller')
const File = require('../../models/file/file.model')

const deleteTemplates = async () => {
  try {
    const templates = await Template.query()

    await connectToFileStorage()

    await Promise.all(
      templates.map(async template => {
        const files = await File.find({ objectId: template.id })

        const fileIds = files.result.map(file => file.id)

        logger.info(
          `deleting files with ids ${fileIds} associated with template id ${template.id}`,
        )

        await deleteFiles(fileIds, true)

        logger.info(`deleting template with id ${template.id}`)
        await Template.deleteById(template.id)
      }),
    )
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = deleteTemplates
