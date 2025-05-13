const { logger, useTransaction } = require('@coko/server')

const Template = require('../../models/template/template.model')
const ExportProfile = require('../../models/exportProfile/exportProfile.model')
const File = require('../../models/file/file.model')
const { deleteFiles } = require('../../controllers/file.controller')

const deleteTemplate = async id => {
  try {
    await useTransaction(async trx => {
      const template = await Template.findById(id, { trx })

      const defaultPdf = await Template.findOne(
        {
          target: 'pagedjs',
          default: true,
        },
        { trx },
      )

      const defaultEpub = await Template.findOne(
        {
          target: 'epub',
          default: true,
        },
        { trx },
      )

      const defaults = {
        pdf: defaultPdf.id,
        epub: defaultEpub.id,
      }

      const files = await File.find({ objectId: template.id }, { trx })
      const fileIds = files.result.map(file => file.id)

      logger.info(
        `deleting files with ids ${fileIds} associated with template id ${template.id}`,
      )

      await deleteFiles(fileIds, true, { trx })

      const profiles = await ExportProfile.find(
        {
          templateId: template.id,
        },
        { trx },
      )

      await Promise.all(
        profiles.result.map(async profile => {
          const { format } = profile

          await ExportProfile.patchAndFetchById(
            profile.id,
            {
              templateId: defaults[format],
            },
            { trx },
          )
        }),
      )

      logger.info(`deleting template with id ${template.id}`)
      await Template.deleteById(template.id, { trx })
    })

    process.exit(0)
  } catch (error) {
    logger.error(error)
    process.exit(1)
  }
}

const id = process.argv[2]
deleteTemplate(id)
