const { logger } = require('@coko/server')
const { exec } = require('child_process')
const fs = require('fs-extra')
const path = require('path')
const config = require('config')

const map = require('lodash/map')
const find = require('lodash/find')

const Template = require('../../models/template/template.model')

const { createFile, deleteFiles } = require('../../controllers/file.controller')

const { dirContents } = require('../../utilities/filesystem')

const File = require('../../models/file/file.model')

const execute = async command =>
  new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error.message)
      }

      return resolve(stdout)
    })
  })

const filesChecker = async folder => {
  // the .map has no place in the below array but exists there as it is
  // created during the build process of template's css
  const allowedFiles = ['.css', '.otf', '.woff', '.woff2', '.ttf', '.map']

  const regexFiles = new RegExp(
    `([a-zA-Z0-9s_\\.-:])+(${allowedFiles.join('|')})$`,
  )

  const availableAssets = []

  if (fs.existsSync(path.join(folder, 'fonts'))) {
    availableAssets.push(path.join(folder, 'fonts'))
  }

  if (fs.existsSync(path.join(folder, 'css'))) {
    availableAssets.push(path.join(folder, 'css'))
  }

  const everythingChecked = await Promise.all(
    map(availableAssets, async parentFolder => {
      const dirFiles = await fs.readdir(parentFolder)

      const checkedFiles = map(dirFiles, file => {
        if (!regexFiles.test(file)) {
          return false
        }

        return true
      })

      return !checkedFiles.includes(false)
    }),
  )

  return !everythingChecked.includes(false)
}

const createTemplate = async (
  sourceRoot,
  data,
  cssFile,
  notes,
  options = {},
) => {
  try {
    const { trx, ignoreConfig } = options

    const featurePODEnabled =
      config.has('featurePOD') &&
      ((config.get('featurePOD') && JSON.parse(config.get('featurePOD'))) ||
        false)

    const normalizedTemplates = config.get('templates').map(t => ({
      label: t.label.toLowerCase(),
      url: t.url,
      assetsRoot: t.assetsRoot.replace(/^\/+/, '').replace(/\/+$/, ''),
    }))

    const {
      isDefault,
      name: originalName,
      author,
      target,
      trimSize,
      thumbnailFile,
    } = data

    const name = featurePODEnabled
      ? originalName
      : `${originalName} (${notes})`.toLocaleLowerCase()

    let foundTemplate = find(normalizedTemplates, { label: name })

    if (!ignoreConfig) {
      foundTemplate = find(normalizedTemplates, { label: name })

      if (!foundTemplate) {
        throw new Error(
          `template with name ${name} was not fetched from source`,
        )
      }

      if (!foundTemplate.assetsRoot) {
        throw new Error(
          `template with name ${name} does not contain assetsRoot in its configuration`,
        )
      }
    } else {
      foundTemplate = { assetsRoot: 'dist' }
    }

    const assetsRoot = path.join(sourceRoot, foundTemplate.assetsRoot)
    const areAssetsOK = await filesChecker(assetsRoot)

    if (!areAssetsOK) {
      throw new Error(
        `an unsupported file exists in either ${foundTemplate.assetsRoot}/css, ${foundTemplate.assetsRoot}/fonts. The supported files are .css, .otf, .woff, .woff2, .ttf`,
      )
    }

    logger.info('Checking if template with that name already exists')

    const templateExists = await findExistingTemplate(
      { name, target, trimSize, notes },
      trx,
    )

    if (templateExists.length > 1) {
      throw new Error('multiple records found for the same template')
    }

    if (templateExists.length === 0) {
      logger.info('About to create a new template')

      const newTemplate = await Template.insert(
        {
          name,
          author,
          target,
          trimSize,
          default: isDefault,
          notes,
        },
        { trx },
      )

      logger.info(`New template created with id ${newTemplate.id}`)

      const fontsPath = path.join(assetsRoot, 'fonts')

      if (fs.existsSync(fontsPath)) {
        const contents = await dirContents(fontsPath)

        await Promise.all(
          contents.map(async font => {
            const absoluteFontPath = path.join(fontsPath, font)

            return createFile(
              fs.createReadStream(absoluteFontPath),
              font,
              null,
              null,
              [],
              newTemplate.id,
              {
                trx,
                forceObjectKeyValue: `templates/${newTemplate.id}/${font}`,
              },
            )
          }),
        )
      }

      const cssPath = path.join(assetsRoot, 'css')

      if (fs.existsSync(cssPath)) {
        const absoluteCSSPath = path.join(cssPath, cssFile)

        if (fs.existsSync(absoluteCSSPath)) {
          await createFile(
            fs.createReadStream(absoluteCSSPath),
            cssFile,
            null,
            null,
            [],
            newTemplate.id,
            {
              trx,
              forceObjectKeyValue: `templates/${newTemplate.id}/${cssFile}`,
            },
          )
        } else {
          throw new Error('Stylesheet does not exist')
        }
      }

      if (thumbnailFile) {
        const thumbnailPath = path.join(assetsRoot, thumbnailFile)

        if (fs.existsSync(thumbnailPath)) {
          const thumbnail = await createFile(
            fs.createReadStream(thumbnailPath),
            thumbnailFile,
            null,
            null,
            [],
            newTemplate.id,
            {
              trx,
            },
          )

          await Template.patchAndFetchById(
            newTemplate.id,
            { thumbnailId: thumbnail.id },
            { trx },
          )
        } else {
          throw new Error('Thumbnail image does not exist')
        }
      }

      return newTemplate.id
    }

    const files = await File.find({ objectId: templateExists[0].id }, { trx })

    const fileIds = files.result.map(file => file.id)

    logger.info(
      `deleting files with ids ${fileIds} associated with template id ${templateExists[0].id}`,
    )

    try {
      await deleteFiles(fileIds, true, { trx })
    } catch (e) {
      if (e.message.includes('The specified key does not exist.')) {
        logger.error(
          `Corrupted template with id ${templateExists[0].id}. All the associated files will be removed from the db and will be recreated`,
        )
        await File.deleteByIds(fileIds)
      }
    }

    const fontsPath = path.join(assetsRoot, 'fonts')

    if (fs.existsSync(fontsPath)) {
      const contents = await dirContents(fontsPath)

      await Promise.all(
        contents.map(async font => {
          const absoluteFontPath = path.join(fontsPath, font)

          return createFile(
            fs.createReadStream(absoluteFontPath),
            font,
            null,
            null,
            [],
            templateExists[0].id,
            {
              trx,
              forceObjectKeyValue: `templates/${templateExists[0].id}/${font}`,
            },
          )
        }),
      )
    }

    const cssPath = path.join(assetsRoot, 'css')

    if (fs.existsSync(cssPath)) {
      const absoluteCSSPath = path.join(cssPath, cssFile)

      await createFile(
        fs.createReadStream(absoluteCSSPath),
        cssFile,
        null,
        null,
        [],
        templateExists[0].id,
        {
          trx,
          forceObjectKeyValue: `templates/${templateExists[0].id}/${cssFile}`,
        },
      )
    }

    if (thumbnailFile) {
      const thumbnailPath = path.join(assetsRoot, thumbnailFile)

      if (fs.existsSync(thumbnailPath)) {
        const thumbnail = await createFile(
          fs.createReadStream(thumbnailPath),
          thumbnailFile,
          null,
          null,
          [],
          templateExists[0].id,
          {
            trx,
          },
        )

        await Template.patchAndFetchById(
          templateExists[0].id,
          { thumbnailId: thumbnail.id, default: isDefault },
          { trx },
        )
      }
    }

    return templateExists[0].id
  } catch (e) {
    throw new Error(e)
  }
}

const cleanTemplatesFolder = async () => {
  try {
    return execute(`rm -rf ${path.join(__dirname, '..', '..', 'templates')}`)
  } catch (e) {
    throw new Error(e.message)
  }
}

const getTemplates = async () => {
  try {
    const normalizedTemplates = config.has('templates')
      ? config.get('templates').map(t => ({
          label: t.label.toLowerCase(),
          url: t.url,
          branch: t.branch,
          assetsRoot: t.assetsRoot.replace(/^\/+/, '').replace(/\/+$/, ''),
        }))
      : []

    await cleanTemplatesFolder()

    return Promise.all(
      normalizedTemplates.map(async templateDetails => {
        const { url, label, branch } = templateDetails
        return execute(
          `git clone ${url} ${
            branch ? `--branch ${branch}` : ''
          } ./templates/${label} `,
        )
      }),
    )
  } catch (e) {
    throw new Error(e)
  }
}

const findExistingTemplate = async ({ name, target, trimSize, notes }, trx) => {
  return trimSize
    ? Template.query(trx)
        .whereRaw('lower("name") = ?', name)
        .andWhere({ target, trimSize, notes })
    : Template.query(trx)
        .whereRaw('lower("name") = ?', name)
        .andWhere({ target, notes })
}

const persistTemplates = async (
  {
    name,
    url,
    target,
    author,
    thumbnailFile,
    supportedNoteTypes,
    ignoreConfig,
    shouldBeDefault,
    sourceRoot,
    recreate,
  },
  { trx },
) => {
  let tempaltesCreated = 0

  try {
    if (target.pagedjs?.length) {
      logger.info(`PagedJS Templates for ${name}`)
      await Promise.all(
        supportedNoteTypes.map(async noteType => {
          return Promise.all(
            target.pagedjs.map(async data => {
              const { trimSize, file } = data

              const templateExists = await findExistingTemplate(
                { name, target: 'pagedjs', trimSize, notes: noteType },
                trx,
              )

              if (templateExists.length === 0 || recreate) {
                const pagedData = {
                  name,
                  author,
                  target: 'pagedjs',
                  trimSize,
                  thumbnailFile,
                  isDefault: shouldBeDefault,
                }

                const newTemplate = await createTemplate(
                  sourceRoot,
                  pagedData,
                  file,
                  noteType,
                  {
                    trx,
                    ignoreConfig,
                  },
                )

                if (newTemplate) {
                  await Template.query(trx).patchAndFetchById(newTemplate, {
                    url,
                  })

                  tempaltesCreated += 1
                }

                return
              }

              logger.info(
                `Pagedjs template for ${name} already exists, do nothing.`,
              )
            }),
          )
        }),
      )
    }

    if (target.epub?.file) {
      const epubData = {
        name,
        author,
        target: 'epub',
        isDefault: shouldBeDefault,
        thumbnailFile,
      }

      logger.info(`EPUB Templates for ${name}`)
      await Promise.all(
        supportedNoteTypes.map(async noteType => {
          const templateExists = await findExistingTemplate(
            { name, target: 'epub', trimSize: null, notes: noteType },
            trx,
          )

          if (templateExists.length === 0) {
            const newTemplate = await createTemplate(
              sourceRoot,
              epubData,
              target.epub?.file,
              noteType,
              { trx, ignoreConfig },
            )

            if (newTemplate) {
              await Template.query(trx).patchAndFetchById(newTemplate, {
                url,
              })

              tempaltesCreated += 1
            }

            return
          }

          logger.info('EPUB tempalte already exists, do nothing.')
        }),
      )
    }

    if (target.web?.file) {
      await Promise.all(
        supportedNoteTypes.map(async noteType => {
          const templateExists = await findExistingTemplate(
            { name, target: 'web', trimSize: null, notes: noteType },
            trx,
          )

          if (templateExists.length === 0) {
            const { file } = target.web

            const webData = {
              name,
              author,
              target: 'web',
              isDefault: shouldBeDefault,
              thumbnailFile,
            }

            const newTemplate = await createTemplate(
              sourceRoot,
              webData,
              file,
              noteType,
              {
                trx,
                ignoreConfig,
              },
            )

            if (newTemplate) {
              await Template.query(trx).patchAndFetchById(newTemplate, {
                url,
              })

              tempaltesCreated += 1
            }

            return
          }

          logger.info('Web tempalte already exists, do nothing.')
        }),
      )
    }

    return tempaltesCreated
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  execute,
  createTemplate,
  getTemplates,
  findExistingTemplate,
  persistTemplates,
}
