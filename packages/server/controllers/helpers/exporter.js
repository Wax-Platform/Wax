// const cheerio = require('cheerio')
const fs = require('fs-extra')
const path = require('path')
const config = require('config')
const get = require('lodash/get')
// const findIndex = require('lodash/findIndex')
const crypto = require('crypto')

// const {
//   cleanHTML,
//   cleanDataAttributes,
//   convertedContent,
// } = require('./converters')

// const bookConstructor = require('./bookConstructor')

// const {
//   generateContainer,
//   generateTitlePage,
//   generateCopyrightsPage,
// } = require('./htmlGenerators')

const { EPUBPreparation } = require('./EPUBPreparation')
const ICMLPreparation = require('./ICMLPreparation')
const PagedJSPreparation = require('./PagedJSPreparation')
const EPUBArchiver = require('./EPUBArchiver')
const PagedJSArchiver = require('./PagedJSArchiver')
const ICMLArchiver = require('./ICMLArchiver')
// const scriptsRunner = require('./scriptsRunner')

const Template = require('../../models/template/template.model')

const prepareBook = require('./prepareBook')

const uploadsDir = get(config, ['uploads'], 'uploads')

const {
  epubcheckerHandler,
  icmlHandler,
  pdfHandler,
} = require('../microServices.controller')

// const levelMapper = { 0: 'one', 1: 'two', 2: 'three' }

const getURL = relativePath => {
  const serverUrl = config.has('serverUrl')
    ? config.get('serverUrl')
    : undefined

  // temp code for solving docker networking for macOS
  if (process.env.NODE_ENV !== 'production') {
    return `${serverUrl.replace('server', 'localhost')}/${relativePath}`
  }

  return `${serverUrl}/${relativePath}`
}

const featurePODEnabled =
  config.has('featurePOD') &&
  ((config.get('featurePOD') && JSON.parse(config.get('featurePOD'))) || false)

const ExporterService = async (
  bookId,
  bookComponentId,
  templateId,
  previewer,
  fileExtension,
  icmlNotes,
  { isbn, ...additionalExportOptions },
) => {
  try {
    let template

    if (fileExtension !== 'icml') {
      template = await Template.findById(templateId)
    }

    const book = await prepareBook(bookId, bookComponentId, template, {
      fileExtension,
      icmlNotes,
      ...(featurePODEnabled &&
        additionalExportOptions && {
          ...additionalExportOptions,
          isbn,
        }),
      includeTOC: false,
      includeCopyrights: false,
      includeTitlePage: false,
      includeCoverPage: false,
    })

    if (fileExtension === 'epub') {
      const assetsTimestamp = `${new Date().getTime()}`
      const EPUBFileTimestamp = `${new Date().getTime() + 1}` // delay it a bit

      const EPUBtempFolderAssetsPath = path.join(
        `${process.cwd()}`,
        uploadsDir,
        'temp',
        'epub',
        assetsTimestamp,
      )

      const EPUBtempFolderFilePath = path.join(
        `${process.cwd()}`,
        uploadsDir,
        'temp',
        'epub',
        EPUBFileTimestamp,
      )

      await EPUBPreparation(book, template, EPUBtempFolderAssetsPath, isbn)

      const filename = await EPUBArchiver(
        EPUBtempFolderAssetsPath,
        EPUBtempFolderFilePath,
      )

      const { outcome, messages } = await epubcheckerHandler(
        `${EPUBtempFolderFilePath}/${filename}`,
      )

      if (outcome === 'not valid') {
        let errors = ''

        for (let i = 0; i < messages.length; i += 1) {
          const { message } = messages[i]
          errors += `${message} - `
        }

        throw new Error(errors)
      }

      await fs.remove(EPUBtempFolderAssetsPath)

      const localPath = path.join(
        uploadsDir,
        'temp',
        'epub',
        EPUBFileTimestamp,
        filename,
      )

      return {
        localPath,
        path: getURL(localPath),
      }
    }

    if (previewer === 'pagedjs' || fileExtension === 'pdf') {
      const assetsTimestamp = `${new Date().getTime()}`
      const zippedFileTimestamp = `${new Date().getTime() + 1}` // delay it a bit
      const PDFFileTimestamp = `${new Date().getTime() + 2}` // delay it a bit

      const pagedJStempFolderAssetsPathForPDF = path.join(
        `${process.cwd()}`,
        uploadsDir,
        'temp',
        'paged',
        assetsTimestamp,
      )

      const pagedJStempFolderAssetsPathForPreviewer = path.join(
        `${process.cwd()}`,
        uploadsDir,
        'temp',
        'previewer',
        assetsTimestamp,
      )

      console.log(pagedJStempFolderAssetsPathForPreviewer, 11111111111111)

      const zippedTempFolderFilePath = path.join(
        `${process.cwd()}`,
        uploadsDir,
        'temp',
        'paged',
        zippedFileTimestamp,
      )

      const PDFtempFolderFilePath = path.join(
        `${process.cwd()}`,
        uploadsDir,
        'temp',
        'paged',
        PDFFileTimestamp,
      )

      if (fileExtension === 'pdf') {
        const PDFFilename = `${crypto.randomBytes(32).toString('hex')}.pdf`
        await PagedJSPreparation(
          book,
          template,
          pagedJStempFolderAssetsPathForPDF,
          true,
        )

        const zippedAssetsFilename = await PagedJSArchiver(
          pagedJStempFolderAssetsPathForPDF,
          zippedTempFolderFilePath,
        )

        const url = await pdfHandler(
          `${zippedTempFolderFilePath}/${zippedAssetsFilename}`,
          PDFtempFolderFilePath,
          PDFFilename,
        )

        await fs.remove(pagedJStempFolderAssetsPathForPDF)
        await fs.remove(zippedTempFolderFilePath)

        const localPath = path.join(
          uploadsDir,
          'temp',
          'paged',
          PDFFileTimestamp,
          PDFFilename,
        )

        // pagedjs-cli
        return {
          localPath,
          path: url,
          validationResult: undefined,
        }
      }

      await PagedJSPreparation(
        book,
        template,
        pagedJStempFolderAssetsPathForPreviewer,
      )

      return {
        path: `${assetsTimestamp}/template/${templateId}`,
        validationResult: undefined,
      }
    }

    if (fileExtension === 'icml') {
      const assetsTimestamp = `${new Date().getTime()}`
      const zippedFileTimestamp = `${new Date().getTime() + 1}` // delay it a bit

      const ICMLtempFolderAssetsPath = path.join(
        `${process.cwd()}`,
        uploadsDir,
        'temp',
        'icml',
        assetsTimestamp,
      )

      const ICMLtempFolderFilePath = path.join(
        `${process.cwd()}`,
        uploadsDir,
        'temp',
        'icml',
        zippedFileTimestamp,
      )

      await ICMLPreparation(book, ICMLtempFolderAssetsPath)
      await icmlHandler(ICMLtempFolderAssetsPath)
      await fs.remove(`${ICMLtempFolderAssetsPath}/index.html`)

      const filename = await ICMLArchiver(
        ICMLtempFolderAssetsPath,
        ICMLtempFolderFilePath,
      )

      await fs.remove(ICMLtempFolderAssetsPath)

      return {
        path: getURL(
          path.join(uploadsDir, 'temp', 'icml', zippedFileTimestamp, filename),
        ),
        validationResult: undefined,
      }
    }

    return null
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = ExporterService
