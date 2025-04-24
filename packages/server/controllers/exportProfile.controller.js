const fs = require('fs')
const moment = require('moment')

const {
  useTransaction,
  logger,
  makeOAuthCall: authenticatedCall,
} = require('@coko/server')

const FormData = require('form-data')
const config = require('config')
const find = require('lodash/find')
const findIndex = require('lodash/findIndex')
const clone = require('lodash/clone')

const {
  labels: { EXPORT_PROFILE_CONTROLLER },
} = require('./constants')

const ExportProfile = require('../models/exportProfile/exportProfile.model')
const BookTranslation = require('../models/bookTranslation/bookTranslation.model')

const exporter = require('./helpers/exporter')

const generateHash = require('./helpers/generateHash')
const generateBookHashes = require('./helpers/generateBookHashes')

const getExportProfile = async (id, options = {}) => {
  try {
    const { trx } = options
    logger.info(
      `${EXPORT_PROFILE_CONTROLLER} getExportProfile: fetching export profile with id ${id}`,
    )

    const exportProfile = await useTransaction(
      async tr => ExportProfile.findOne({ id, deleted: false }, { trx: tr }),
      { trx, passedTrxOnly: true },
    )

    if (!exportProfile) {
      throw new Error(`export profile with id: ${id} does not exist`)
    }

    return exportProfile
  } catch (e) {
    logger.error(`${EXPORT_PROFILE_CONTROLLER} getExportProfile: ${e.message}`)
    throw new Error(e)
  }
}

const getBookExportProfiles = async (bookId, options = {}) => {
  try {
    const { trx } = options
    logger.info(
      `${EXPORT_PROFILE_CONTROLLER} getBookExportProfiles: fetching export profiles for book with id ${bookId}`,
    )

    return useTransaction(
      async tr => ExportProfile.find({ bookId, deleted: false }, { trx: tr }),
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(
      `${EXPORT_PROFILE_CONTROLLER} getBookExportProfiles: ${e.message}`,
    )
    throw new Error(e)
  }
}

const createExportProfile = async (data, options = {}) => {
  try {
    const { trx } = options
    logger.info(
      `${EXPORT_PROFILE_CONTROLLER} createExportProfile: creating export profiles for book with id ${data.bookId}`,
    )

    return useTransaction(async tr => ExportProfile.insert(data, { trx: tr }), {
      trx,
    })
  } catch (e) {
    logger.error(
      `${EXPORT_PROFILE_CONTROLLER} createExportProfile: ${e.message}`,
    )
    throw e
  }
}

const updateExportProfile = async (id, data, options = {}) => {
  try {
    const { trx } = options
    logger.info(
      `${EXPORT_PROFILE_CONTROLLER} updateExportProfile: updating export profiles with id ${id}`,
    )

    return useTransaction(
      async tr => ExportProfile.patchAndFetchById(id, data, { trx: tr }),
      {
        trx,
      },
    )
  } catch (e) {
    logger.error(
      `${EXPORT_PROFILE_CONTROLLER} updateExportProfile: ${e.message}`,
    )
    throw new Error(e)
  }
}

const deleteExportProfile = async (id, options = {}) => {
  try {
    const { trx } = options
    logger.info(
      `${EXPORT_PROFILE_CONTROLLER} deleteExportProfile: deleting file with ids ${id}`,
    )
    return useTransaction(async tr => ExportProfile.deleteById(id), { trx })
  } catch (e) {
    logger.error(
      `${EXPORT_PROFILE_CONTROLLER} deleteExportProfile: ${e.message}`,
    )
    throw new Error(e)
  }
}

const createLuluProject = async (userId, exportProfileId, options = {}) => {
  try {
    const { trx } = options
    logger.info(
      `${EXPORT_PROFILE_CONTROLLER} createLuluProject: creating project on Lulu for export profile with id ${exportProfileId}`,
    )

    return useTransaction(
      async tr => {
        const exportProfile = await getExportProfile(exportProfileId, {
          trx: tr,
        })

        const { bookId, providerInfo } = exportProfile

        const alreadyExists = find(providerInfo, { providerLabel: 'lulu' })

        if (alreadyExists) {
          throw new Error(
            `project already exists on Lulu's end with id ${alreadyExists.externalProjectId}`,
          )
        }

        const bookTranslation = await BookTranslation.findOne(
          { bookId, languageIso: 'en' },
          { trx: tr },
        )

        if (!bookTranslation) {
          throw new Error(
            'book translation should exist before creating a project on Lulu',
          )
        }

        const { title, subtitle } = bookTranslation

        if (!title) {
          throw new Error(
            'book should have title before creating a project on Lulu',
          )
        }

        const declaredClientUrl =
          config.has('clientUrl') && config.get('clientUrl')

        const integrations =
          config.has('integrations') && config.get('integrations')

        if (!integrations) {
          throw new Error('integrations configurations is undefined')
        }

        const { lulu } = integrations

        if (!lulu) {
          throw new Error('lulu configurations is undefined')
        }

        const { baseAPIURL } = lulu

        const response = await authenticatedCall(userId, 'lulu', {
          method: 'post',
          url: baseAPIURL,
          headers: { 'Content-Type': 'application/json' },
          data: {
            language: 'eng',
            project_type: 'PRINTED_BOOK',
            ...(subtitle && { subtitle }),
            title,
            source_editor_url: `${declaredClientUrl}/books/${bookId}/producer`,
          },
        })

        const { id } = response

        const providerItem = {
          providerLabel: 'lulu',
          externalProjectId: id,
        }

        providerInfo.push(providerItem)

        return ExportProfile.patchAndFetchById(exportProfileId, {
          providerInfo,
        })
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${EXPORT_PROFILE_CONTROLLER} createLuluProject: ${e.message}`)
    throw new Error(e)
  }
}

const updateLuluProject = async (userId, exportProfileId, options = {}) => {
  try {
    const { trx } = options
    logger.info(
      `${EXPORT_PROFILE_CONTROLLER} updateLuluProject: updating project on Lulu for export profile with id ${exportProfileId}`,
    )
    return useTransaction(
      async tr => {
        const exportProfile = await getExportProfile(exportProfileId, { trx })

        const { bookId, providerInfo } = exportProfile

        const alreadyExists = find(providerInfo, { providerLabel: 'lulu' })

        if (!alreadyExists) {
          throw new Error(`there is no project created on Lulu`)
        }

        const bookTranslation = await BookTranslation.findOne(
          { bookId, languageIso: 'en' },
          { trx },
        )

        if (!bookTranslation) {
          throw new Error(
            'book translation should exist before creating a project on Lulu',
          )
        }

        const { title, subtitle } = bookTranslation

        if (!title) {
          throw new Error(
            'book should have title before creating a project on Lulu',
          )
        }

        const integrations =
          config.has('integrations') && config.get('integrations')

        if (!integrations) {
          throw new Error('integrations configurations is undefined')
        }

        const { lulu } = integrations

        if (!lulu) {
          throw new Error('lulu configurations is undefined')
        }

        const { baseAPIURL } = lulu

        return authenticatedCall(userId, 'lulu', {
          method: 'patch',
          url: `${baseAPIURL}/${alreadyExists.externalProjectId}`,
          headers: { 'Content-Type': 'application/json' },
          data: {
            language: 'eng', // ISO-639/2 code
            project_type: 'PRINTED_BOOK',
            ...(subtitle && { subtitle }),
            title,
          },
        })
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${EXPORT_PROFILE_CONTROLLER} updateLuluProject: ${e.message}`)
    throw new Error(e)
  }
}

const uploadToProvider = async (
  providerLabel,
  exportProfileId,
  userId,
  options = {},
) => {
  try {
    logger.info(
      `${EXPORT_PROFILE_CONTROLLER} uploadToProvider: uploading file on provider's end based on export profile with id ${exportProfileId}`,
    )
    const { trx } = options
    return useTransaction(
      async tr => {
        const exportProfile = await ExportProfile.findById(exportProfileId, {
          trx: tr,
        })

        if (!exportProfile) {
          throw new Error(
            `export profile with id ${exportProfileId} does not exist`,
          )
        }

        const { bookId, templateId, includedComponents, format, providerInfo } =
          exportProfile

        const bookHashes = await generateBookHashes(bookId, templateId)

        const PDFPath = await exporter(
          bookId,
          templateId,
          undefined,
          format,
          undefined,
          { includedComponents },
        )

        const fileMD5Hash = await generateHash(fs.createReadStream(PDFPath))
        const form = new FormData()
        form.append('file', fs.createReadStream(PDFPath))
        form.append('file_md5', fileMD5Hash)

        const integrations =
          config.has('integrations') && config.get('integrations')

        if (!integrations) {
          throw new Error('integrations configurations is undefined')
        }

        if (!integrations[providerLabel]) {
          throw new Error('lulu configurations is undefined')
        }

        const { baseAPIURL } = integrations[providerLabel]

        const providerIndex = findIndex(providerInfo, { providerLabel })

        if (providerIndex === -1) {
          throw new Error(
            `provider info undefined for provider ${providerLabel}`,
          )
        }

        const providerInfoClone = clone(providerInfo)

        const callPayload = {
          method: 'post',
          url: `${baseAPIURL}/${providerInfo[providerIndex].externalProjectId}/interior`,
          headers: {
            ...form.getHeaders(),
          },
          data: form,
        }

        await authenticatedCall(userId, providerLabel, callPayload)

        providerInfoClone[providerIndex].bookContentHash =
          bookHashes.contentHash
        providerInfoClone[providerIndex].bookContentHash =
          bookHashes.metadataHash
        providerInfoClone[providerIndex].templateHash =
          bookHashes.stylesheetHash
        providerInfoClone[providerIndex].lastSync = new Date().getTime()

        return ExportProfile.patchAndFetchById(
          exportProfileId,
          {
            providerInfo: providerInfoClone,
          },
          { trx: tr },
        )
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${EXPORT_PROFILE_CONTROLLER} uploadToProvider: ${e.message}`)
    throw new Error(e)
  }
}

const uploadToLulu = async (exportProfileId, userId, options = {}) => {
  try {
    logger.info(
      `${EXPORT_PROFILE_CONTROLLER} uploadToProvider: uploading file on provider's end based on export profile with id ${exportProfileId}`,
    )

    const { trx } = options

    const declaredClientUrl = config.has('clientUrl') && config.get('clientUrl')

    if (!declaredClientUrl) {
      throw new Error('Client url is missing from config')
    }

    const lulu =
      config.has('integrations.lulu') && config.get('integrations.lulu')

    if (!lulu) {
      throw new Error('Lulu configuration is missing')
    }

    const { baseAPIURL } = lulu

    if (!baseAPIURL) {
      throw new Error('Lulu base api url is missing')
    }

    return useTransaction(
      async tr => {
        const exportProfile = await ExportProfile.findById(exportProfileId, {
          trx: tr,
        })

        if (!exportProfile) {
          throw new Error(
            `export profile with id ${exportProfileId} does not exist`,
          )
        }

        const {
          bookId,
          providerInfo,
          templateId,
          includedComponents,
          format,
          isbn,
        } = exportProfile

        const bookTranslation = await BookTranslation.findOne(
          { bookId, languageIso: 'en' },
          { trx: tr },
        )

        if (!bookTranslation) {
          throw new Error(
            'book translation should exist before creating a project on Lulu',
          )
        }

        const { title, subtitle } = bookTranslation

        if (!title) {
          throw new Error(
            'book should have title before creating a project on Lulu',
          )
        }

        const alreadyExists = find(providerInfo, { providerLabel: 'lulu' })

        const commonData = {
          headers: { 'Content-Type': 'application/json' },
          data: {
            language: 'eng',
            project_type: 'PRINTED_BOOK',
            ...(subtitle && { subtitle }),
            title,
            source_editor_url: `${declaredClientUrl}/books/${bookId}/producer`,
          },
        }

        let data

        if (!alreadyExists) {
          data = {
            ...commonData,
            method: 'post',
            url: `${baseAPIURL}/`,
          }
        } else {
          data = {
            ...commonData,
            method: 'patch',
            url: `${baseAPIURL}/${alreadyExists.externalProjectId}/`,
          }
        }

        const response = await authenticatedCall(userId, 'lulu', data)

        if (!alreadyExists) {
          const { id } = response.data

          const providerItem = {
            providerLabel: 'lulu',
            externalProjectId: id,
          }

          providerInfo.push(providerItem)

          // return ExportProfile.patchAndFetchById(exportProfileId, {
          //   providerInfo,
          // })
        }

        const { localPath } = await exporter(
          bookId,
          templateId,
          undefined,
          format,
          undefined,
          {
            includeTitlePage: includedComponents.titlePage,
            includeTOC: includedComponents.toc,
            includeCopyrights: includedComponents.copyright,
            isbn,
          },
        )

        const bookHashes = await generateBookHashes(
          bookId,
          templateId,
          format,
          includedComponents,
          isbn,
        )

        const fileMD5Hash = await generateHash(fs.createReadStream(localPath))
        const form = new FormData()
        form.append('file', fs.createReadStream(localPath))
        form.append('file_md5', fileMD5Hash)

        const providerIndex = findIndex(providerInfo, { providerLabel: 'lulu' })

        if (providerIndex === -1) {
          throw new Error(`provider info undefined for provider lulu`)
        }

        const providerInfoClone = clone(providerInfo)

        const callPayload = {
          method: 'post',
          url: `${baseAPIURL}/${providerInfo[providerIndex].externalProjectId}/interior/`,
          headers: {
            ...form.getHeaders(),
          },
          data: form,
        }

        await authenticatedCall(userId, 'lulu', callPayload)

        providerInfoClone[providerIndex].bookContentHash =
          bookHashes.contentHash
        providerInfoClone[providerIndex].bookMetadataHash =
          bookHashes.metadataHash
        providerInfoClone[providerIndex].templateHash =
          bookHashes.stylesheetHash
        providerInfoClone[providerIndex].lastSync = moment().utc().toDate()

        return ExportProfile.patchAndFetchById(
          exportProfileId,
          {
            providerInfo: providerInfoClone,
          },
          { trx: tr },
        )
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${EXPORT_PROFILE_CONTROLLER} uploadToProvider: ${e.message}`)
    throw e
  }
}

module.exports = {
  getExportProfile,
  getBookExportProfiles,
  createExportProfile,
  updateExportProfile,
  deleteExportProfile,
  createLuluProject,
  updateLuluProject,
  uploadToLulu,
  uploadToProvider,
}
