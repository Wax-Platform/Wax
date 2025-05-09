/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-restricted-syntax */
const { useTransaction, logger, fileStorage } = require('@coko/server')
const crypto = require('crypto')
const config = require('config')
const AWS = require('aws-sdk')
const { Document, Embedding } = require('../models').models
const { splitFileContent } = require('./helpers/fileChunks')

const { embeddings } = require('./openAi.controller')
const { safeKey, emptyUndefinedOrNull } = require('../utilities/utils')

const KB_FILES_DIRNAME = 'kbfiles'

const createDocument = async ({ file, maxLng, bookId }, options = {}) => {
  try {
    const { trx } = options

    return useTransaction(
      async tr => {
        logger.info(`Uploading file ${JSON.stringify(file)}`)

        try {
          const { filename } = await file
          const extension = filename.split('.').pop()
          const originalDirName = filename.replace(`.${extension}`, '')
          logger.info(`EXTENSION: ${JSON.stringify(extension)}`)
          const allObjects = await fileStorage.list()

          const existingKeys = allObjects.Contents.map(so => so.Key)

          let dirName = await safeKey(originalDirName, existingKeys)

          const currentDocuments = await Document.find({ bookId })
          const docNames = currentDocuments.result.map(doc => doc.name)

          if (docNames.find(n => n === dirName)) {
            let prefix = 1
            const newKey = () => `${dirName}(${prefix})`

            while (docNames.find(n => n === newKey())) {
              prefix += 1
            }

            dirName = newKey()
          }

          const sections = await splitFileContent(file, extension, maxLng)

          const uploadedChunks = await Promise.all(
            sections.map(section => {
              const hashedFilename = crypto.randomBytes(6).toString('hex')
              const forceObjectKeyValue = `${KB_FILES_DIRNAME}/${dirName}/${hashedFilename}.txt`
              return fileStorage.upload(
                section.fragment,
                `${hashedFilename}.txt`,
                {
                  forceObjectKeyValue,
                },
              )
            }),
          )

          logger.info(`Generating Embeddings`)

          const splitSections = []
          const size = 20

          for (let i = 0; i < sections.length; i += size) {
            splitSections.push(sections.slice(i, i + size))
          }

          for await (const partial of splitSections) {
            await Promise.all(
              partial.map(({ fragment, heading, fragmentIndex }, i) =>
                embeddings(fragment).then(data =>
                  Embedding.insertNewEmbedding({
                    bookId,
                    embedding: JSON.parse(data).data[0].embedding,
                    storedObjectKey: uploadedChunks[i][0].key,
                    filename: dirName,
                    section: heading,
                    index: fragmentIndex,
                    trx: tr,
                  }),
                ),
              ),
            )
          }

          logger.info(`Embeddings generated successfully`)

          const sectionsKeys = sections.map((_, i) => uploadedChunks[i][0].key)

          const document = await Document.createDocument(
            dirName,
            extension,
            sectionsKeys,
            bookId,
            tr,
          )

          return document
        } catch (error) {
          logger.error(error)
          throw error
        }
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`Error creating document: ${e.message}`)
    throw new Error(e)
  }
}

const getDocuments = async bookId => {
  try {
    logger.info(`Get documents`)
    return Document.getAlldocuments(bookId)
  } catch (e) {
    logger.error(`Error creating document: ${e.message}`)
    throw new Error(e)
  }
}

const deleteFolder = async id => {
  try {
    return Document.deleteFolder(id)
  } catch (e) {
    logger.error('folder could not be deleted')
    throw new Error(e)
  }
}

const getFileContents = async objectKey => {
  const {
    accessKeyId,
    secretAccessKey,
    bucket,
    protocol,
    host,
    port,
    s3ForcePathStyle,
  } = config.get('fileStorage')

  if (!protocol) {
    throw new Error(
      'Missing required protocol param for initializing file storage',
    )
  }

  if (!host) {
    throw new Error('Missing required host param for initializing file storage')
  }

  if (!bucket) {
    throw new Error(
      'Missing required bucket param for initializing file storage',
    )
  }

  const serverUrl = `${protocol}://${host}${port ? `:${port}` : ''}`

  const s3 = new AWS.S3({
    accessKeyId,
    signatureVersion: 'v4',
    secretAccessKey,
    s3ForcePathStyle: !emptyUndefinedOrNull(s3ForcePathStyle)
      ? JSON.parse(s3ForcePathStyle)
      : true,
    endpoint: serverUrl,
  })

  return new Promise((resolve, reject) => {
    s3.getObject({ Bucket: bucket, Key: objectKey }, (err, data) => {
      if (err) {
        logger.error(err)
        reject(err)
      } else {
        const storedObject = data.Body.toString('utf-8')
        resolve(storedObject)
      }
    })
  })
}

module.exports = {
  createDocument,
  getDocuments,
  deleteFolder,
  getFileContents,
}
