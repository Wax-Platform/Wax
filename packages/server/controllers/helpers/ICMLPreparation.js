const { fileStorage } = require('@coko/server')
const cheerio = require('cheerio')
const fs = require('fs-extra')
const mime = require('mime-types')
const map = require('lodash/map')

const { getObjectKey } = require('../file.controller')

const { download } = fileStorage

const { generatePagedjsContainer } = require('./htmlGenerators')
const { writeFile } = require('../../utilities/filesystem')
const { fileStorageImageGatherer } = require('../../utilities/image')

const ICMLPreparation = async (book, tempFolderPath) => {
  try {
    const images = []

    await fs.ensureDir(tempFolderPath)
    const gatheredImages = fileStorageImageGatherer(book)
    const objectKeyMapper = {}

    await Promise.all(
      map(gatheredImages, async fileId => {
        const retrievedObjectKey = await getObjectKey(fileId)

        if (retrievedObjectKey) {
          objectKeyMapper[fileId] = retrievedObjectKey
          return
        }

        delete objectKeyMapper[fileId]

        // objectKeyMapper[fileId] = await getObjectKey(fileId)
        // return true
      }),
    )
    book.divisions.forEach(division => {
      division.bookComponents.forEach(bookComponent => {
        const { content, id } = bookComponent
        const $ = cheerio.load(content)

        $('img').each((index, node) => {
          const $node = $(node)
          const constructedId = `image-${id}-${index}`
          const dataFileId = $node.attr('data-fileid')

          if (dataFileId) {
            const key = objectKeyMapper[dataFileId]

            if (!key) {
              return
            }

            const mimetype = mime.lookup(key)
            const target = `${tempFolderPath}/${key}`

            images.push({
              id: constructedId,
              key,
              target,
              mimetype,
            })
            $node.attr('src', `./${key}`)
          }
        })
        $('figure').each((_, node) => {
          const $node = $(node)
          const srcExists = $node.attr('src')

          if (srcExists) {
            $node.removeAttr('src')
          }
        })
        /* eslint-disable no-param-reassign */
        bookComponent.content = $.html('body')
        /* eslint-enable no-param-reassign */
      })
    })

    await Promise.all(
      map(images, async image => {
        const { key, target } = image
        return download(key, target)
      }),
    )
    const output = cheerio.load(generatePagedjsContainer(book.title))
    book.divisions.forEach(division => {
      division.bookComponents.forEach(bookComponent => {
        const { content } = bookComponent
        output('body').append(content)
      })
    })

    await writeFile(`${tempFolderPath}/index.html`, output.html())
    return true
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = ICMLPreparation
