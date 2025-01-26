const { exec } = require('child_process')
const { fileStorage, logger, useTransaction } = require('@coko/server')
const fs = require('fs-extra')
const path = require('path')
const Template = require('../models/template/template.model')
const { category } = require('../config/templates/defaultTemplate')

const TEMPLATES_URLS = [
  'https://gitlab.coko.foundation/coko-org/products/ketty/ketty-templates/vanilla',
  'https://gitlab.coko.foundation/coko-org/products/ketty/ketty-templates/apollo',
  'https://gitlab.coko.foundation/coko-org/products/ketty/ketty-templates/aphrodite',
  'https://gitlab.coko.foundation/coko-org/products/ketty/ketty-templates/zeus',
  'https://gitlab.coko.foundation/coko-org/products/ketty/ketty-templates/gaia',
  'https://gitlab.coko.foundation/coko-org/products/ketty/ketty-templates/tenberg',
  'https://gitlab.coko.foundation/coko-org/products/ketty/ketty-templates/eclypse',
]

const execute = async command =>
  new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error.message)
      } else {
        resolve(stdout)
      }
    })
  })

const cloneRepository = async (gitUrl, templateFolderPath) => {
  await execute(`rm -rf ${templateFolderPath}`)
  await execute(`git clone ${gitUrl} ${templateFolderPath}`)
}

const readDirectoryContents = directoryPath => {
  return fs.readdirSync(directoryPath)
}

const uploadFileToS3 = async (fileContents, s3Key) => {
  const uploadedImage = await fileStorage.upload(fileContents, s3Key, {
    forceObjectKeyValue: s3Key,
  })
  return uploadedImage[0].key
}

const insertFileRecord = async (trx, name, key, mimetype, extension, size) => {
  const { File } = require('@coko/server')
  return File.query(trx).insert({
    name,
    storedObjects: [
      {
        type: 'original',
        key,
        mimetype,
        extension,
        size,
      },
    ],
  })
}

const uploadCssFile = async (trx, cssFolder, fileName, s3BaseKey) => {
  const cssFilePath = path.join(cssFolder, fileName)
  if (fs.existsSync(cssFilePath)) {
    const cssFileContents = fs.readFileSync(cssFilePath, 'utf-8')

    const s3Key = `${s3BaseKey}/${fileName}`
    const storedObjectKey = await uploadFileToS3(cssFileContents, s3Key)

    const cssFile = await insertFileRecord(
      trx,
      fileName,
      storedObjectKey,
      'text/css',
      'css',
      Buffer.byteLength(cssFileContents),
    )

    const template = await Template.query(trx).insert({
      fileId: cssFile.id,
      rawCss: cssFileContents,
      displayName: fileName,
      status: 'public',
      category: 'system',
    })

    // logger.info('Inserted template:', { template })
    return cssFile.id // so wherin template fileIds append meta: manifest.json and images
  }
}

const uploadFontFile = async (trx, fontFolder, fileName, s3BaseKey) => {
  const fontFilePath = path.join(fontFolder, fileName)
  if (fs.existsSync(fontFilePath)) {
    const fontFileContents = fs.readFileSync(fontFilePath)

    const extension = path.extname(fileName).substring(1)
    let mimetype
    switch (extension) {
      case 'ttf':
        mimetype = 'font/ttf'
        break
      case 'otf':
        mimetype = 'font/otf'
        break
      case 'woff':
        mimetype = 'font/woff'
        break
      case 'woff2':
        mimetype = 'font/woff2'
        break
      default:
        mimetype = 'application/octet-stream'
    }

    // Upload the font file to S3
    const s3Key = `${s3BaseKey}/${fileName}`
    const storedObjectKey = await uploadFileToS3(fontFileContents, s3Key)

    // Store the font file reference using the File model
    await insertFileRecord(
      trx,
      fileName,
      storedObjectKey,
      mimetype,
      extension,
      Buffer.byteLength(fontFileContents),
    )
  }
}

const getCssFileContentsFromURL = async url => {
  try {
    const response = await get(url, { responseType: 'arraybuffer' })
    const base64 = Buffer.from(response.data, 'binary').toString('base64')

    const buffer = Buffer.from(base64, 'base64')

    const passThroughStream = new stream.PassThrough()

    passThroughStream.end(buffer)
    return { stream: passThroughStream, base64 }
  } catch (error) {
    logger.error('Error fetching CSS file:', error)
    return ''
  }
}

const getFontFileContentsFromURL = async url => {
  try {
    const response = await get(url, { responseType: 'arraybuffer' })
    const base64 = Buffer.from(response.data, 'binary').toString('base64')

    const buffer = Buffer.from(base64, 'base64')

    const passThroughStream = new stream.PassThrough()

    passThroughStream.end(buffer)
    return { stream: passThroughStream, base64 }
  } catch (error) {
    logger.error('Error fetching font file:', error)
    return ''
  }
}

const fetchAndStoreTemplate = async (
  url = 'https://gitlab.coko.foundation/coko-org/products/ketty/ketty-templates/vanilla',
  options = {},
  templateBasePath = path.join(__dirname, '..', 'templates'),
  s3BaseKey = 'templates',
) => {
  const { trx } = options
  const tempTemplateFolderName = url.substring(url.lastIndexOf('/') + 1)
  const gitUrl = url.endsWith('.git') ? url : `${url}.git`
  const templateFolderPath = path.join(templateBasePath, tempTemplateFolderName)

  try {
    await fs.ensureDir(templateBasePath)

    await cloneRepository(gitUrl, templateFolderPath)

    const fileIds = []
    const sourceRoot = templateFolderPath
    const distFolder = path.join(sourceRoot, 'dist')
    const cssOnRoot = path.join(sourceRoot, 'css')

    if (fs.existsSync(distFolder) || fs.existsSync(cssOnRoot)) {
      const cssFolder = fs.existsSync(cssOnRoot)
        ? cssOnRoot
        : path.join(distFolder, 'css')

      const cssFiles = readDirectoryContents(cssFolder).filter(fn =>
        fn.endsWith('.css'),
      )

      for (const fileName of cssFiles) {
        const fileId = await uploadCssFile(
          trx,
          cssFolder,
          fileName,
          `${s3BaseKey}/${tempTemplateFolderName}/css`,
        )
        fileIds.push(fileId)
      }
      // const fontsFolder = path.join(distFolder, 'fonts')
      // const fontFiles = readDirectoryContents(fontsFolder)

      // for (const fileName of fontFiles) {
      //   await uploadFontFile(
      //     trx,
      //     fontsFolder,
      //     fileName,
      //     `${s3BaseKey}/${tempTemplateFolderName}/fonts`,
      //   )
      // }
    }
    const manifestFile = path.join(sourceRoot, 'template.json')

    if (fs.existsSync(manifestFile)) {
      const raw = fs.readFileSync(manifestFile)
      const manifest = JSON.parse(raw)
      // logger.info('Manifest:', manifest)
      // logger.info('File IDs:', fileIds)
      await Template.query(trx)
        .whereIn('fileId', fileIds)
        .patch({ meta: manifest })
    }

    await fs.remove(templateFolderPath)
  } catch (e) {
    await fs.remove(templateFolderPath)
    logger.error('Error fetching and storing template:', e)
  }
}

const fetchAndStoreAllTemplates = async () => {
  return useTransaction(
    tr => {
      return Promise.all(
        TEMPLATES_URLS.map(async url =>
          fetchAndStoreTemplate(url, { trx: tr }),
        ),
      )
    },
    { passedTrxOnly: true },
  )
}

module.exports = {
  execute,
  fetchAndStoreTemplate,
  fetchAndStoreAllTemplates,
}
