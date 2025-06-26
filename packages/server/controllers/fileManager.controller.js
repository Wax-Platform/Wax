const { createFile, deleteFiles } = require('@coko/server')

const { FileManager } = require('../models').models

const getUserFileManagerHandler = async (_, {}, ctx) => {
  const fileManager = await FileManager.query()
    .where({
      userId: ctx.userId,
      parentId: null,
    })
    .withGraphFetched('file')

  return JSON.stringify(fileManager)
}

const uploadToFileManagerHandler = async (_, { files }, ctx) => {
  const uploadedFiles = []
  await Promise.all(
    files.map(async file => {
      const { createReadStream, filename } = await file
      const fileStream = createReadStream()

      uploadedFiles.push(
        await createFile(fileStream, filename, null, null, [], ctx.userId),
      )
    }),
  )

  await Promise.all(
    uploadedFiles.map(async file => {
      await FileManager.insert({
        name: file.name,
        fileId: file.id,
        userId: ctx.userId,
        metadata: { bookComponentId: [] },
      })
    }),
  )

  return uploadedFiles
}

const deleteFromFileManagerHandler = async (_, { ids }, ctx) => {
  await FileManager.query().delete().whereIn('fileId', ids)
  await deleteFiles(ids)
}

const updateMetadataFileManagerHandler = async (_, { fileId, input }, ctx) => {
  await FileManager.query()
    .patch({
      metadata: input,
    })
    .where({ fileId })

  return fileId
}

module.exports = {
  getUserFileManagerHandler,
  uploadToFileManagerHandler,
  deleteFromFileManagerHandler,
  updateMetadataFileManagerHandler,
}
