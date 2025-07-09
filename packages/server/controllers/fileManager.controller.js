const { createFile, deleteFiles } = require('@coko/server')
const { FileManager } = require('../models').models
const DocTreeManager = require('../models/docTreeManager/docTreeManager.model')

const getUserFileManagerHandler = async (_, {}, ctx) => {
  const fileManager = await FileManager.query()
    .where({
      userId: ctx.userId,
      parentId: null,
    })
    .withGraphFetched('file')

  const bookComponents = await Promise.all(
    fileManager.map(file =>
      DocTreeManager.query().whereIn(
        'bookComponentId',
        file.metadata.bookComponentId,
      ),
    ),
  )

  const fileManagerWithBookComponent = fileManager.map((file, fileIndex) => {
    const bookComponentChapter = file.metadata.bookComponentId.map(id =>
      bookComponents[fileIndex].find(bookComponent => {
        return bookComponent && bookComponent.bookComponentId === id
      }),
    )

    return {
      ...file,
      metadata: {
        ...file.metadata,
        bookComponentId: bookComponentChapter,
      },
    }
  })

  return JSON.stringify(fileManagerWithBookComponent)
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

const updateComponentIdInFileManagerHandler = async (
  _,
  { bookComponentId, input },
  ctx,
) => {
  if (input?.added.length > 0) {
    const files = await FileManager.query().whereIn('fileId', input.added)
    await Promise.all(
      files.map(file =>
        FileManager.query()
          .patch({
            metadata: {
              ...file.metadata,
              bookComponentId: [
                ...file.metadata.bookComponentId,
                bookComponentId,
              ],
            },
          })
          .findOne({ id: file.id }),
      ),
    )
  }

  if (input?.removed.length > 0) {
    const files = await FileManager.query().whereIn('fileId', input.removed)
    await Promise.all(
      files.map(file =>
        FileManager.query()
          .patch({
            metadata: {
              ...file.metadata,
              bookComponentId: file.metadata.bookComponentId.filter(
                id => id !== bookComponentId,
              ),
            },
          })
          .findOne({ id: file.id }),
      ),
    )
  }

  return []
}

module.exports = {
  getUserFileManagerHandler,
  uploadToFileManagerHandler,
  deleteFromFileManagerHandler,
  updateMetadataFileManagerHandler,
  updateComponentIdInFileManagerHandler,
}
