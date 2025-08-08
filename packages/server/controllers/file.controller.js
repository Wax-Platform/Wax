const { logger, useTransaction, fileStorage } = require('@coko/server')

const {
  createFile,
  deleteFiles,
} = require('@coko/server/src/models/file/file.controller')

const map = require('lodash/map')
const forEach = require('lodash/forEach')
const find = require('lodash/find')
const { File, BookComponent } = require('../models').models

const { imageFinder } = require('../utilities/image')

const updateFile = async (id, data, options = {}) => {
  try {
    const { trx } = options

    return useTransaction(
      async tr => {
        logger.info(`>>> updating file with id ${id}`)

        return File.patchAndFetchById(id, data, { trx: tr })
      },
      { trx },
    )
  } catch (e) {
    throw new Error(e)
  }
}

const updateFiles = async (ids, data, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        logger.info(`>>> updating files with ids ${ids}`)
        return File.query(tr).patch(data).whereIn(ids)
      },
      { trx },
    )
  } catch (e) {
    throw new Error(e)
  }
}

const getEntityFiles = async (
  entityId,
  orderParams = undefined,
  options = {},
) => {
  try {
    const { trx } = options
    logger.info(`>>> fetching files for entity with  id ${entityId}`)
    return useTransaction(
      async tr => {
        if (orderParams) {
          const orderByParams = orderParams.map(option => {
            const { key, order } = option
            return { column: key, order }
          })

          logger.info(`>>> constructing orderBy params: ${orderByParams}`)

          const { result } = await File.find(
            { objectId: entityId },
            { trx: tr, orderBy: orderByParams },
          )

          return result
        }

        const { result } = await File.find({ objectId: entityId }, { trx: tr })

        return result
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    throw new Error(e)
  }
}

const getFiles = async (options = {}) => {
  try {
    const { trx } = options
    logger.info(`>>> fetching all files`)
    return useTransaction(
      async tr => {
        const { result } = await File.find({}, { trx: tr })
        return result
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    throw new Error(e)
  }
}

const getSpecificFiles = async (ids, options = {}) => {
  try {
    const { trx } = options
    logger.info(`>>> fetching the files with ids ${ids}`)
    return useTransaction(async tr => File.query(tr).whereIn('id', ids), {
      trx,
      passedTrxOnly: true,
    })
  } catch (e) {
    throw new Error(e)
  }
}

const getFile = async (id, options = {}) => {
  try {
    const { trx } = options
    logger.info(`>>> fetching the file with id ${id}`)

    const file = await useTransaction(
      async tr => File.findById(id, { trx: tr }),
      { trx, passedTrxOnly: true },
    )

    return file
  } catch (e) {
    throw new Error(e)
  }
}

const getFileURL = async (id, type = 'original', options = {}) => {
  try {
    const { trx } = options
    logger.info(`>>> fetching the file with id ${id}`)

    const file = await useTransaction(
      async tr => File.findOne({ id }, { trx: tr }),
      { trx, passedTrxOnly: true },
    )

    if (!file) {
      return ''
    }

    const { key } = file.getStoredObjectBasedOnType(type)

    return fileStorage.getURL(key)
  } catch (e) {
    throw new Error(e)
  }
}

const getChatFileURL = async (file, size) => {
  const target = file.storedObjects.find(o => {
    if (!o.mimetype.startsWith('image')) {
      return o.type === 'original'
    }

    return o.type === size
  })

  const { key } = target
  return fileStorage.getURL(key)
}

const getObjectKey = async (id, type = 'original', options = {}) => {
  try {
    const { trx } = options
    logger.info(`>>> fetching the file with id ${id}`)

    const file = await useTransaction(
      async tr => File.findOne({ id }, { trx: tr }),
      { trx, passedTrxOnly: true },
    )

    if (!file) {
      return undefined
    }

    const { key } = file.getStoredObjectBasedOnType(type)

    return key
  } catch (e) {
    throw new Error(e)
  }
}

const getContentFiles = async (fileIds, options = {}) => {
  try {
    const { trx } = options
    logger.info(`>>> gathering image files with ids ${fileIds} from content`)
    return useTransaction(
      async tr => {
        const files = await getSpecificFiles(fileIds, { trx: tr })

        /* eslint-disable no-param-reassign */
        const result = await Promise.all(
          map(files, async file => {
            const { key: keyMedium, mimetype } =
              file.getStoredObjectBasedOnType('medium')

            const { key } = file.getStoredObjectBasedOnType('original')

            if (mimetype.match(/^image\//)) {
              file.url = await fileStorage.getURL(keyMedium)
              return file
            }

            file.url = await fileStorage.getURL(key)
            /* eslint-enable no-param-reassign */

            return file
          }),
        )

        // case of orphan files
        if (fileIds.length > files.length) {
          fileIds.forEach(fileId => {
            if (!find(files, { id: fileId })) {
              result.push({ id: fileId, url: '', alt: '' })
            }
          })
        }

        return result
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    throw new Error(e)
  }
}

const isFileInUse = async (bookId, fileId, options = {}) => {
  try {
    const { trx } = options
    logger.info(
      `>>> checking if the image with id ${fileId} is in use inside the book with id ${bookId}`,
    )
    return useTransaction(
      async tr => {
        const foundIn = []

        const bookComponentsOfBook = await BookComponent.query(tr)
          .select('book_component.id', 'book_component_translation.content')
          .leftJoin(
            'book_component_translation',
            'book_component.id',
            'book_component_translation.book_component_id',
          )
          .where({
            'book_component.book_id': bookId,
            'book_component.deleted': false,
            languageIso: 'en',
          })

        forEach(bookComponentsOfBook, bookComponent => {
          const { content, id } = bookComponent

          if (imageFinder(content, fileId)) {
            foundIn.push(id)
          }
        })
        logger.info(`>>> found in book components ${foundIn}`)
        return foundIn
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  createFile,
  updateFile,
  updateFiles,
  deleteFiles,
  getEntityFiles,
  getFiles,
  getSpecificFiles,
  getFile,
  getFileURL,
  getChatFileURL,
  getObjectKey,
  getContentFiles,
  isFileInUse,
}
