const { exec } = require('child_process')
const { fileStorage, logger, useTransaction } = require('@coko/server')
const fs = require('fs-extra')
const path = require('path')
const Template = require('../models/template/template.model')
const { callOn } = require('../utilities/utils')

const TEMPLATES_URLS = [
  'https://gitlab.coko.foundation/coko-org/products/ketty/ketty-templates/vanilla',
  'https://gitlab.coko.foundation/coko-org/products/ketty/ketty-templates/apollo',
  'https://gitlab.coko.foundation/coko-org/products/ketty/ketty-templates/aphrodite',
  'https://gitlab.coko.foundation/coko-org/products/ketty/ketty-templates/zeus',
  'https://gitlab.coko.foundation/coko-org/products/ketty/ketty-templates/gaia',
  'https://gitlab.coko.foundation/coko-org/products/ketty/ketty-templates/tenberg',
  'https://gitlab.coko.foundation/coko-org/products/ketty/ketty-templates/eclypse',
  'https://gitlab.coko.foundation/coko-org/products/ketty/ketty-templates/atosh',
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

const uploadCssFile = async (
  trx,
  cssFolder,
  fileName,
  s3BaseKey,
  templateOptions,
  userId,
) => {
  const ResourceTree = require('../models/resourceTree/resourceTree.model')
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
      status: userId ? 'private' : 'public',
      category: userId ? 'user' : 'system',
      ...templateOptions,
    })

    if (userId) {
      const parent = await ResourceTree.query(trx)
        .where({
          resourceType: 'sys',
          title: 'My Templates',
          userId,
        })
        .first()
      logger.info('Parent:', { title: parent.title, id: parent.id })

      const safeTitle = await ResourceTree.getSafeName(
        {
          id: null,
          title: fileName,
          parentId: parent.id,
        },
        { trx },
      )

      logger.info('Safe title:', safeTitle)
      logger.info('template id', template.id)

      const insertedResource = await ResourceTree.createResource(
        {
          title: safeTitle,
          resourceType: 'template',
          extension: 'template',
          parentId: parent.id,
          templateId: template.id,
          userId,
        },
        { trx },
      )
      parent.children.unshift(insertedResource.id)

      await ResourceTree.query(trx).where({ id: parent.id }).patch({
        children: parent.children,
      })
    }

    // logger.info('Inserted template:', { template })
    return cssFile.id // so wherin template fileIds append meta: manifest.json and images
  }
}

const uploadFontFile = async (trx, fontFolder, fileName, s3BaseKey) => {
  const fontFilePath = path.join(fontFolder, fileName)
  if (fs.existsSync(fontFilePath)) {
    const fontFileContents = fs.readFileSync(fontFilePath)

    const extension = path.extname(fileName).substring(1)
    const mimetype = callOn(extension, {
      ttf: () => 'font/ttf',
      otf: () => 'font/otf',
      woff: () => 'font/woff',
      woff2: () => 'font/woff2',
      default: () => 'application/octet-stream',
    })

    // Upload the font file to S3
    const s3Key = `${s3BaseKey}/${fileName}`
    const storedObjectKey = await uploadFileToS3(fontFileContents, s3Key)

    // Store the font file reference using the File model
    const fontFile = await insertFileRecord(
      trx,
      fileName,
      storedObjectKey,
      mimetype,
      extension,
      Buffer.byteLength(fontFileContents),
    )

    return { storedObjectKey, id: fontFile.id }
  }
}

const fetchAndStoreTemplate = async ({
  url = 'https://gitlab.coko.foundation/coko-org/products/ketty/ketty-templates/vanilla',
  options = {},
  templateOptions = {},
  templateBasePath = path.join(__dirname, '..', 'templates'),
  s3BaseKey = 'templates',
  userId,
}) => {
  const { trx } = options
  const tempTemplateFolderName = url.substring(url.lastIndexOf('/') + 1)
  const gitUrl = url.endsWith('.git') ? url : `${url}.git`
  const templateFolderPath = path.join(templateBasePath, tempTemplateFolderName)

  try {
    await fs.ensureDir(templateBasePath)

    await cloneRepository(gitUrl, templateFolderPath)

    const fileIds = []
    let imageKey = null
    let fontsReplacement = {}
    let fontIds = []
    const sourceRoot = templateFolderPath
    const distFolder = path.join(sourceRoot, 'dist')
    const cssOnRoot = path.join(sourceRoot, 'css')

    if (fs.existsSync(distFolder)) {
      const templateImage = readDirectoryContents(distFolder).find(fn =>
        fn.endsWith('.png'),
      )

      if (templateImage) {
        const imageFilePath = path.join(distFolder, templateImage)
        const imageFileContents = fs.createReadStream(imageFilePath)
        const s3Key = `_${templateImage}`
        imageKey = await uploadFileToS3(imageFileContents, s3Key)
      }
    }

    if (fs.existsSync(distFolder) || fs.existsSync(cssOnRoot)) {
      const cssFolder = fs.existsSync(cssOnRoot)
        ? cssOnRoot
        : path.join(distFolder, 'css')

      const cssFiles = readDirectoryContents(cssFolder).filter(fn =>
        fn.endsWith('.css'),
      )

      for (const fileName of cssFiles) {
        logger.info(`${s3BaseKey}/${tempTemplateFolderName}/css`)
        const fileId = await uploadCssFile(
          trx,
          cssFolder,
          fileName,
          `${s3BaseKey}/${tempTemplateFolderName}/css`,
          templateOptions,
          userId,
        )
        fileIds.push(fileId)
      }
      const fontsFolder = path.join(distFolder, 'fonts')

      if (fs.existsSync(fontsFolder)) {
        const fontFiles = readDirectoryContents(fontsFolder)
        for (const fileName of fontFiles) {
          const fontFile = await uploadFontFile(
            trx,
            fontsFolder,
            fileName,
            `${s3BaseKey}/${tempTemplateFolderName}/fonts`,
          )
          // use the relative path to the font file as the key to replace in the CSS
          fontsReplacement[`../fonts/${fileName}`] = fontFile.storedObjectKey
          fontIds.push(fontFile.id)
        }
      }
    }
    const manifestFile = path.join(sourceRoot, 'template.json')

    if (fs.existsSync(manifestFile)) {
      const raw = fs.readFileSync(manifestFile)
      const manifest = JSON.parse(raw)
      // logger.info('Manifest:', manifest)
      // logger.info('File IDs:', fileIds)
      await Template.query(trx)
        .whereIn('fileId', fileIds)
        .patch({
          meta: {
            ...manifest,
            fontIds,
            fontsReplacement,
            ...(imageKey ? { imageKey } : {}),
          },
        })
    }

    await fs.remove(templateFolderPath)
  } catch (e) {
    await fs.remove(templateFolderPath)
    logger.error('Error fetching and storing template:', e)
  }
}

const fetchAndStoreAllTemplates = async () => {
  return useTransaction(
    tr =>
      Promise.all(
        TEMPLATES_URLS.map(async url =>
          fetchAndStoreTemplate({ url, options: { trx: tr } }),
        ),
      ),
    { passedTrxOnly: true },
  )
}

module.exports = {
  execute,
  fetchAndStoreTemplate,
  fetchAndStoreAllTemplates,
}
