const { fileStorage } = require('@coko/server')
const cheerio = require('cheerio')
const fs = require('fs-extra')
const config = require('config')
const find = require('lodash/find')
const map = require('lodash/map')

const { getFileURL } = require('../file.controller')

const { generatePagedjsContainer } = require('./htmlGenerators')
const { fixFontFaceUrls } = require('./converters')
const { writeFile, readFile } = require('../../utilities/filesystem')
const { fileStorageImageGatherer } = require('../../utilities/image')

const PagedJSPreparation = async (
  book,
  template,
  pagedJStempFolderAssetsPath,
  pdf = false,
) => {
  try {
    const templateFiles = await template.getFiles()
    const fonts = []
    const stylesheets = []
    const scripts = template.exportScripts

    await fs.ensureDir(pagedJStempFolderAssetsPath)

    for (let i = 0; i < templateFiles.length; i += 1) {
      const { id: dbId, name } = templateFiles[i]

      const storedObject =
        templateFiles[i].getStoredObjectBasedOnType('original')

      const { key, mimetype, extension } = storedObject

      const originalFilename = name

      if (mimetype === 'text/css') {
        const target = `${pagedJStempFolderAssetsPath}/${originalFilename}`
        const id = `stylesheet-${dbId}-${i}`
        stylesheets.push({
          id,
          key,
          target,
          mimetype,
          originalFilename,
          extension,
        })
      } else {
        const target = `${pagedJStempFolderAssetsPath}/${name}`
        const id = `font-${dbId}-${i}`
        fonts.push({
          id,
          key,
          target,
          mimetype,
          originalFilename,
          extension,
        })
      }
    }

    if (stylesheets.length === 0) {
      throw new Error(
        'No stylesheet file exists in the selected template, export aborted',
      )
    }

    const gatheredImages = fileStorageImageGatherer(book)
    const freshImageLinkMapper = {}

    await Promise.all(
      map(gatheredImages, async fileId => {
        freshImageLinkMapper[fileId] = await getFileURL(fileId, 'medium')
        return true
      }),
    )
    book.divisions.forEach(division => {
      division.bookComponents.forEach(bookComponent => {
        const { content } = bookComponent
        const $ = cheerio.load(content)

        $('img').each((_, node) => {
          const $node = $(node)
          const dataFileId = $node.attr('data-fileid')

          if (dataFileId) {
            $node.attr('src', freshImageLinkMapper[dataFileId])
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
      map(stylesheets, async stylesheet => {
        const { key, target } = stylesheet
        return fileStorage.download(key, target)
      }),
    )
    await Promise.all(
      map(fonts, async font => {
        const { key, target } = font
        return fileStorage.download(key, target)
      }),
    )

    // Copy export scripts to temp folder which will be zipped and be send to service
    await Promise.all(
      map(scripts, async (script, i) => {
        const { value } = script
        const deconstructedValue = value.split('-')
        const label = deconstructedValue[0]
        const scope = deconstructedValue[1]

        const scriptsRootFolder =
          config.has('export') &&
          config.has('export.rootFolder') &&
          config.get('export.rootFolder')

        const availableScripts =
          config.has('export') &&
          config.has('export.scripts') &&
          config.get('export.scripts')

        if (!scriptsRootFolder || !availableScripts) {
          throw new Error(
            `something went wrong with your scripts configuration`,
          )
        }

        const foundScript = find(availableScripts, { label, scope })

        if (!foundScript) {
          throw new Error(
            `template has a script which does not exist in the configurations`,
          )
        }

        const constructedScriptPath = `${process.cwd()}/${scriptsRootFolder}/${
          foundScript.filename
        }`

        if (!fs.existsSync(constructedScriptPath)) {
          throw new Error(
            `the script file declared in the config does not exist under ${process.cwd()}/${scriptsRootFolder}/`,
          )
        }

        const targetPath = `${pagedJStempFolderAssetsPath}/${i + 1}.js`

        return fs.copy(constructedScriptPath, targetPath)
      }),
    )
    // SECTION END

    const stylesheetContent = await readFile(stylesheets[0].target)
    const fixedCSS = fixFontFaceUrls(stylesheetContent, fonts, '.')
    await writeFile(`${stylesheets[0].target}`, fixedCSS)

    const output = cheerio.load(generatePagedjsContainer(book.title))

    book.divisions.forEach(division => {
      division.bookComponents.forEach(bc => {
        const { content } = bc
        output('body').append(content)
      })
    })

    if (pdf) {
      output('<link/>')
        .attr('href', `./${stylesheets[0].originalFilename}`)
        .attr('type', 'text/css')
        .attr('rel', 'stylesheet')
        .appendTo('head')
    }

    await writeFile(`${pagedJStempFolderAssetsPath}/index.html`, output.html())
    return true
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = PagedJSPreparation
