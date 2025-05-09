#!/usr/bin/env node

const {
  logger,
  useTransaction,
  fileStorage,
  deleteFiles,
} = require('@coko/server')

const { db, createFile } = require('@coko/server')
const fs = require('node:fs')
const path = require('node:path')

const { File, ApplicationParameter } = require('../../models').models

const configBooksprints = require('../../config/modules/bookBuilderBooksprints')
const configVanilla = require('../../config/modules/bookBuilderVanilla')
const configOEN = require('../../config/modules/bookBuilderOEN')
const configKetidaV2 = require('../../config/modules/applicationParametersKetida2')

const featureBookStructureEnabled =
  (process.env.FEATURE_BOOK_STRUCTURE &&
    JSON.parse(process.env.FEATURE_BOOK_STRUCTURE)) ||
  false

const featurePODEnabled =
  (process.env.FEATURE_POD && JSON.parse(process.env.FEATURE_POD)) || false

const flavour = process.env.WAX_FLAVOUR

const whichConfig = async () => {
  let config = configVanilla

  if (featureBookStructureEnabled && flavour !== 'BOOKSPRINTS') {
    config = configOEN
  }

  if (featurePODEnabled && flavour !== 'BOOKSPRINTS') {
    config = configKetidaV2
  }

  if (flavour === 'BOOKSPRINTS') {
    config = configBooksprints
  }

  return config
}

const truncate = async () => {
  await db.raw(`truncate table application_parameter cascade`)
  logger.info(`truncate table application parameter`)
}

const seedApplicationParameters = async () => {
  try {
    if (!flavour) {
      throw new Error('env variable WAX_FLAVOUR is needed in order to continue')
    }

    const selectedConfig = await whichConfig()

    const areas = Object.keys(selectedConfig)

    if (selectedConfig.instance === 'KETIDA_V2') {
      // preserve params that can be configured via admin dashboard
      return useTransaction(async trx =>
        Promise.all(
          areas.map(async area => {
            const appParam = await ApplicationParameter.find({
              context: 'bookBuilder',
              area,
            })

            const [existingParam] = appParam.result
            let languages = []

            switch (area) {
              // create termsAndConditions and aiEnabled if they don't exist
              case 'termsAndConditions':
              case 'aiEnabled':
              case 'exportsConfig':
              case 'chatGptApiKey':
                if (!existingParam) {
                  logger.info(
                    `Creating new Application Parameter: ${JSON.stringify(
                      selectedConfig[area],
                    )}`,
                  )
                  return ApplicationParameter.insert(
                    {
                      context: 'bookBuilder',
                      area,
                      config: JSON.stringify(selectedConfig[area]),
                    },
                    { trx },
                  )
                }

                return appParam

              case 'languages':
                if (!existingParam) {
                  logger.info(
                    `Creating new Application Parameter: ${JSON.stringify(
                      selectedConfig[area],
                    )}`,
                  )

                  selectedConfig[area].forEach(async defaultLanguage => {
                    logger.info(
                      `Uploading standard language file for ${defaultLanguage.name}`,
                    )

                    // NB: if a language is added in the default config, it must have a corresponding translations file in config/languages
                    await createFile(
                      fs.createReadStream(
                        path.join(
                          __dirname,
                          '../../config/languages',
                          `${defaultLanguage.code}.json`,
                        ),
                      ),
                      `${defaultLanguage.code}-standard.json`,
                      null,
                      null,
                      ['translation'],
                      null,
                    )
                  })

                  return ApplicationParameter.insert(
                    {
                      context: 'bookBuilder',
                      area,
                      config: JSON.stringify(selectedConfig[area]),
                    },
                    { trx },
                  )
                }

                // merge existingParam with the default config
                languages = [
                  ...existingParam.config,
                  ...selectedConfig.languages,
                ].filter(
                  (lang, index, self) =>
                    index === self.findIndex(l => l.code === lang.code),
                )

                // download translation files from s3 and add them in the config folder
                languages.forEach(async language => {
                  const { code, standardised } = language

                  if (standardised) {
                    logger.info(
                      `(Re)crete standard language file for ${language.name}`,
                    )

                    // delete old file, create new one from what is in the repo
                    const storedStandardTranslation = await File.query()
                      .first('*')
                      .where('name', `${code}-standard.json`)
                      .whereJsonSupersetOf('tags', ['translation'])

                    storedStandardTranslation &&
                      (await deleteFiles([storedStandardTranslation.id]))

                    await createFile(
                      fs.createReadStream(
                        path.join(
                          __dirname,
                          '../../config/languages',
                          `${language.code}.json`,
                        ),
                      ),
                      `${language.code}-standard.json`,
                      null,
                      null,
                      ['translation'],
                      null,
                    )
                  } else {
                    // download custom file from s3 and add it in the right folder
                    logger.info(
                      `Apply previously uploaded custom language file for ${language.name}`,
                    )

                    const translationsFile = await File.query()
                      .first('*')
                      .where('name', code)
                      .whereJsonSupersetOf('tags', ['translation'])

                    if (translationsFile) {
                      const { key } =
                        translationsFile.getStoredObjectBasedOnType('original')

                      await fileStorage.download(
                        key,
                        path.join(
                          __dirname,
                          '../../config/languages',
                          `${code}.json`,
                        ),
                      )
                    }
                  }
                })

                if (languages.length > existingParam.config.length) {
                  return ApplicationParameter.patchAndFetchById(
                    existingParam.id,
                    {
                      config: JSON.stringify(languages),
                    },
                  )
                }

                return appParam

              // for other params, update them if they exist, create them if they don't
              default:
                if (existingParam) {
                  return existingParam.update(
                    {
                      config: JSON.stringify(selectedConfig[area]),
                    },
                    { trx },
                  )
                }

                // if param doesn't exist, create it
                return ApplicationParameter.insert(
                  {
                    context: 'bookBuilder',
                    area,
                    config: JSON.stringify(selectedConfig[area]),
                  },
                  { trx },
                )
            }
          }),
        ),
      )
    }

    await truncate()
    return useTransaction(async trx =>
      Promise.all(
        areas.map(async area => {
          logger.info(
            `New Application Parameter created: ${JSON.stringify(
              selectedConfig[area],
            )}`,
          )
          return ApplicationParameter.insert(
            {
              context: 'bookBuilder',
              area,
              config: JSON.stringify(selectedConfig[area]),
            },
            { trx },
          )
        }),
      ),
    )
  } catch (e) {
    logger.error(e.message)
    throw new Error(e)
  }
}

module.exports = seedApplicationParameters
