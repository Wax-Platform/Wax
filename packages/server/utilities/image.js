const cheerio = require('cheerio')
const crypto = require('crypto')
const find = require('lodash/find')
const fs = require('fs-extra')
const config = require('config')

const { uuid } = require('@coko/server')

const { createFile } = require('@coko/server/src/models/file/file.controller')

const { getBookComponent } = require('../controllers/bookComponent.controller')

const fileStorageImageGatherer = book => {
  const images = []
  book.divisions.forEach(division => {
    division.bookComponents.forEach(bookComponent => {
      const { content } = bookComponent
      const $ = cheerio.load(content)

      $('img').each((_, node) => {
        const $node = $(node)

        if ($node.attr('data-fileid')) {
          images.push($node.attr('data-fileid'))
        }
      })
    })
  })

  return images
}

const xsweetImagesHandler = async (content, bookComponentId) => {
  const { bookId } = await getBookComponent(bookComponentId)

  if (!bookId) {
    throw new Error(`book with id ${bookId} does not exists`)
  }

  const imageMapper = {}
  const imageToFileMapper = {}

  if (content && content.length > 0) {
    const $ = cheerio.load(content)
    // first run aggregate
    $('img').each((_, elem) => {
      const $elem = $(elem)
      const src = $elem.attr('src')

      if (src && src.includes('data:image') && src.includes('base64')) {
        const pseudoId = uuid()
        $elem.attr('pseudo-id', pseudoId)
        imageMapper[pseudoId] = src
      }
    })

    await Promise.all(
      Object.keys(imageMapper).map(async imageId => {
        const file = await recreateImageFromBlob(imageMapper[imageId], bookId)
        imageToFileMapper[imageId] = file.id
        return true
      }),
    ).catch(e => {
      throw new Error(e.message)
    })

    // second run replace
    $('img').each((_, elem) => {
      const $elem = $(elem)
      const pseudoId = $elem.attr('pseudo-id')

      if (pseudoId) {
        $elem.attr('data-fileid', imageToFileMapper[pseudoId])
        $elem.removeAttr('pseudo-id')
        $elem.removeAttr('src')
      }
    })
    return $('body').html()
  }

  return content
}

const imageFinder = (content, fileId) => {
  let found = false

  if (content && content.length > 0) {
    const $ = cheerio.load(content)

    $('img').each((i, elem) => {
      const $elem = $(elem)
      const fId = $elem.attr('data-fileid')

      if (fId === fileId) {
        found = true
      }
    })
  }

  return found
}

const replaceImageSource = async (content, filesFetcher) => {
  const $ = cheerio.load(content)
  const fileIds = []

  $('img').each((i, elem) => {
    const $elem = $(elem)
    const fileId = $elem.attr('data-fileid')

    if (fileId && fileId !== 'null') {
      fileIds.push(fileId)
    }
  })

  if (fileIds.length > 0) {
    const files = await filesFetcher(fileIds)

    $('img').each((i, elem) => {
      const $elem = $(elem)
      const fileId = $elem.attr('data-fileid')

      const correspondingFile = find(files, { id: fileId })

      if (correspondingFile) {
        const { url, alt } = correspondingFile

        const serverUrl = config.has('serverUrl')
          ? config.get('serverUrl')
          : undefined

        $elem.attr('src', `${serverUrl}/file/${fileId}`)

        if (alt) {
          $elem.attr('alt', alt)
        }
      } else {
        $elem.attr('src', '')
        $elem.attr('alt', '')
      }
    })
  }

  return $('body').html()
}

const recreateImageFromBlob = async (imageSrc, bookId) => {
  try {
    if (!bookId) {
      throw new Error('book id is required')
    }

    const splitted = imageSrc.split('base64,')
    const cleanedBase64Data = splitted[1].trim()
    const imageExtension = splitted[0].split('/')[1].split(';')[0]

    if (!cleanedBase64Data) {
      throw new Error('corrupted base64 provided')
    }

    if (!imageExtension) {
      throw new Error(`could not determine asset's extension`)
    }

    const filename = `${crypto
      .randomBytes(6)
      .toString('hex')}.${imageExtension}`

    const tempFilepath = `uploads/temp/${filename}`

    fs.writeFileSync(tempFilepath, cleanedBase64Data, 'base64')

    const fileStream = fs.createReadStream(tempFilepath)

    return createFile(fileStream, filename, null, null, [], bookId)
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  fileStorageImageGatherer,
  imageFinder,
  replaceImageSource,
  recreateImageFromBlob,
  xsweetImagesHandler,
}
