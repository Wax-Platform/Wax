const { fileStorage } = require('@coko/server')
const fs = require('fs-extra')
const config = require('config')
const path = require('path')
const get = require('lodash/get')
const find = require('lodash/find')
const crypto = require('crypto')

const Template = require('../../models/template/template.model')
const Book = require('../../models/book/book.model')

const createBookHTML = require('./createBookHTML')
const generateHash = require('./generateHash')
const prepareBook = require('./prepareBook')

const uploadsDir = get(config, ['uploads'], 'uploads')

const generateBookHashes = async (
  bookId,
  templateId,
  format,
  includedComponents,
  isbn,
) => {
  const template = await Template.findById(templateId)
  const book = await Book.findById(bookId)

  if (!template) {
    throw new Error(`template with id ${templateId} does not exist`)
  }

  const templateFiles = await template.getFiles()
  let stylesheet

  templateFiles.forEach(file => {
    const storedObject = file.getStoredObjectBasedOnType('original')
    const { mimetype } = storedObject

    if (mimetype === 'text/css') {
      stylesheet = storedObject
    }
  })

  if (!stylesheet) {
    throw new Error(`template with id ${templateId} does not have a stylesheet`)
  }

  // make stylesheet hash
  const stylesheetFilename = `${crypto.randomBytes(32).toString('hex')}.css`

  const dir = path.join(`${process.cwd()}`, uploadsDir, 'temp', 'stylesheets')

  const tempStylesheetPath = path.join(dir, stylesheetFilename)

  await fs.ensureDir(dir)

  await fileStorage.download(stylesheet.key, tempStylesheetPath)

  const stylesheetHash = await generateHash(fs.readFileSync(tempStylesheetPath))

  await fs.remove(tempStylesheetPath)
  const isEPUB = format === 'epub'

  const preparedBook = await prepareBook(bookId, template, {
    fileExtension: format,
    includeTOC: includedComponents.toc,
    includeCopyrights: includedComponents.copyright,
    includeTitlePage: includedComponents.titlePage,
    isbn,
  })

  const bookHTML = await createBookHTML(preparedBook)

  const contentHash = await generateHash(bookHTML)
  const clonePODMetadata = { ...book.podMetadata }

  if (isEPUB) {
    const found = find(book?.podMetadata?.isbns, { isbn })

    if (found) {
      clonePODMetadata.isbns = [found]
    } else {
      clonePODMetadata.isbns = []
    }
  }

  const metadataHash = await generateHash(
    JSON.stringify({
      clonePODMetadata,
      title: preparedBook.title,
      subtitle: preparedBook.subtitle,
    }),
  )

  return { contentHash, metadataHash, stylesheetHash }
}

module.exports = generateBookHashes
