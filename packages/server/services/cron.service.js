const { useTransaction, logger, cron } = require('@coko/server')

const fs = require('fs-extra')
const path = require('path')
const config = require('config')
const find = require('lodash/find')

const { BookComponent, Lock, BookComponentState, BookComponentTranslation } =
  require('../models').models

const { broadcastUnlock } = require('./bookComponentLock.service')

const { STATUSES } = require('../api/graphql/bookComponent/constants')

const tempDirectoryCleanUp =
  (config.has('tempDirectoryCleanUp') &&
    JSON.parse(config.get('tempDirectoryCleanUp'))) ||
  false

// default run every one hour
const tempDirectoryCRONJobSchedule =
  (config.has('tempDirectoryCRONJobSchedule') &&
    config.get('tempDirectoryCRONJobSchedule')) ||
  '0 * * * *'

// default is 30 minutes
const tempDirectoryCRONJobOffset =
  (config.has('tempDirectoryCRONJobOffset') &&
    config.get('tempDirectoryCRONJobOffset') &&
    parseInt(config.get('tempDirectoryCRONJobOffset'), 10)) ||
  1800000

const tempRootDirectory = path.join(__dirname, '..', 'uploads/temp')

const getTempDir = serviceSubfolder => {
  return `${tempRootDirectory}/${serviceSubfolder}`
}

const exportServiceDirectories = {
  paged: getTempDir('paged'),
  epub: getTempDir('epub'),
  pdf: getTempDir('pdf'),
  icml: getTempDir('icml'),
}

if (tempDirectoryCleanUp) {
  logger.info(
    `cleanup job and will be registered with params ${tempDirectoryCRONJobSchedule} and ${tempDirectoryCRONJobOffset}`,
  )
  cron.schedule(tempDirectoryCRONJobSchedule, async () => {
    try {
      logger.info('running cleanup job for temp files')
      const keys = Object.keys(exportServiceDirectories)
      await Promise.all(
        keys.map(async key => {
          let subDirectories

          if (fs.pathExistsSync(exportServiceDirectories[key])) {
            subDirectories = fs.readdirSync(exportServiceDirectories[key])
          }

          if (subDirectories && subDirectories.length > 0) {
            logger.info(`found temp directories for ${key}`)
            subDirectories.forEach(subDirectory => {
              if (
                fs
                  .lstatSync(
                    path.resolve(
                      `${path.join(__dirname, '..', 'uploads/temp', key)}`,
                      subDirectory,
                    ),
                  )
                  .isDirectory()
              ) {
                const cronRunTime =
                  new Date().getTime() - tempDirectoryCRONJobOffset

                if (subDirectory <= cronRunTime) {
                  logger.info(`deleting sub-directory ${subDirectory}`)
                  return fs.remove(
                    `${exportServiceDirectories[key]}/${subDirectory}`,
                  )
                }
              }

              return false
            })
          }

          return false
        }),
      )
    } catch (e) {
      throw new Error(e)
    }
  })
}

// run every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  try {
    logger.info(`executing locks clean-up procedure for idle locks`)

    await useTransaction(async tr => {
      const { result: locks } = await Lock.find({}, { trx: tr })

      const bookComponentIds = locks.map(lock => lock.foreignId)

      if (bookComponentIds.length > 0) {
        const lockedBookComponents = await BookComponentTranslation.query(
          tr,
        ).whereIn('bookComponentId', bookComponentIds)

        await Promise.all(
          lockedBookComponents.map(async lockedBookComponent => {
            const { updated, bookComponentId } = lockedBookComponent
            const lastUpdate = new Date(updated).getTime()
            const now = new Date().getTime()

            const associatedLock = find(locks, {
              foreignId: bookComponentId,
            })

            const { created } = associatedLock
            const lockCreatedAt = new Date(created).getTime()

            const timeElapsedFromContentUpdate = now - lastUpdate
            const timeElapsedFromLockAcquirement = now - lockCreatedAt

            // one day of inactivity in content and 30 minutes since lock acquired
            if (
              timeElapsedFromContentUpdate > 86400000 &&
              timeElapsedFromLockAcquirement > 1800000
            ) {
              await Lock.query(tr).delete().where({
                foreignId: bookComponentId,
                foreignType: 'bookComponent',
              })

              await BookComponentState.query(tr)
                .patch({ status: STATUSES.UNLOCKED_DUE_INACTIVITY })
                .where({ bookComponentId })

              const { id, bookId } = await BookComponent.query(tr).findById(
                bookComponentId,
              )

              await broadcastUnlock(id, bookId)

              return true
            }

            return false
          }),
        )
      }

      return []
    }, {})
  } catch (e) {
    throw new Error(e)
  }
})
