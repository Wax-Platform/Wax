const path = require('path')
const fs = require('fs-extra')
const get = require('lodash/get')
const config = require('config')
const { fileStorage, logger } = require('@coko/server')
const Template = require('../../models/template/template.model')
const { writeFile, readFile } = require('../../utilities/filesystem')
const { fixFontFaceUrls } = require('./converters')

const uploadsDir = get(config, ['pubsweet-server', 'uploads'], 'uploads')

module.exports = async (templateId, fontAbsoluteUrl = '/fonts') => {
  try {
    const template = await Template.findById(templateId)
    const templateFiles = await template.getFiles()

    const fonts = []
    const stylesheets = []

    const tempAssetsPath = path.join(
      `${process.cwd()}`,
      uploadsDir,
      'temp',
      'web',
      `${new Date().getTime()}`,
    )

    for (let i = 0; i < templateFiles.length; i += 1) {
      const { id: dbId, name } = templateFiles[i]

      const storedObject =
        templateFiles[i].getStoredObjectBasedOnType('original')

      const { key, mimetype, extension } = storedObject

      const originalFilename = name

      if (mimetype === 'text/css') {
        const target = `${tempAssetsPath}/${originalFilename}`
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
        const target = `${tempAssetsPath}/${name}`
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

    await fs.ensureDir(tempAssetsPath)

    await Promise.all(
      stylesheets.map(async stylesheet => {
        const { key, target } = stylesheet
        return fileStorage.download(key, target)
      }),
    )

    await Promise.all(
      fonts.map(async font => {
        const { key, target } = font
        return fileStorage.download(key, target)
      }),
    )

    const stylesheetContent = await readFile(stylesheets[0].target)
    const fixedCSS = fixFontFaceUrls(stylesheetContent, fonts, fontAbsoluteUrl)
    await writeFile(`${stylesheets[0].target}`, fixedCSS)

    const activeFonts = fonts
      .map(f => f.target)
      .filter(
        f =>
          stylesheetContent.indexOf(f.substring(f.lastIndexOf('/') + 1)) !== -1,
      )

    return {
      stylesheet: stylesheets[0].target,
      fonts: activeFonts,
      tempAssetsPath,
    }
  } catch (error) {
    logger.error(error)
    throw new Error(error)
  }
}
