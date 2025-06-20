const { createFile } = require('@coko/server')
const { File, FileManager } = require('../models').models

const getUserFileManagerHandler = async (_, {}, ctx) => {
  const fileManager = await FileManager.query()
    .$relatedQuery('file')
    .where({ userId: ctx.userId, parentId: null })

  return JSON.stringify(fileManager)
}

const uploadToFileManagerHandler = async (_, { files }, ctx) => {
  const uploadedFiles = []
  await Promise.all(
    files.map(async file => {
      const { createReadStream, filename } = file
      const fileStream = createReadStream()

      uploadedFiles.push(
        await createFile(fileStream, filename, null, null, [], ctx.userId),
      )
    }),
  )

  await Promise.all(
    uploadedFiles.map(async file => {
      await FileManager.insert({
        name: file.filename,
        fileId: file.id,
        userId: ctx.user.id,
        metadata: { bookComponentId: [] },
      })
    }),
  )
}

const deleteFromFileManagerHandler = async (_, { ids }, ctx) => {}
const updateFileInFileManagerHandler = async (_, { ids }, ctx) => {}

module.exports = {
  getUserFileManagerHandler,
  uploadToFileManagerHandler,
  deleteFromFileManagerHandler,
  updateFileInFileManagerHandler,
}
