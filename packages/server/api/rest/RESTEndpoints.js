const { pubsubManager, logger } = require('@coko/server')
const fs = require('fs-extra')
const config = require('config')
const mime = require('mime-types')
const get = require('lodash/get')
const { NotFoundError } = require('objection')
const express = require('express')
const path = require('node:path')

const uploadsDir = get(config, ['pubsweet-server', 'uploads'], 'uploads')
const { readFile } = require('../../utilities/filesystem')
const { xsweetImagesHandler } = require('../../utilities/image')

const { BookComponent, ServiceCallbackToken, Book } =
  require('../../models').models

const {
  BOOK_COMPONENT_UPLOADING_UPDATED,
  BOOK_COMPONENT_UPDATED,
  STATUSES,
} = require('../graphql/bookComponent/constants')

const { BOOK_UPDATED } = require('../graphql/book/constants')

const {
  updateContent,
  updateUploading,
  // deleteBookComponent,
  getBookComponent,
  setStatus,
} = require('../../controllers/bookComponent.controller')

const RESTEndpoints = app => {
  app.use('/api/xsweet', async (req, res) => {
    try {
      const pubsub = await pubsubManager.getPubsub()
      const { body } = req

      const {
        objectId: bookComponentId,
        responseToken,
        convertedContent,
        serviceCallbackTokenId,
        error,
      } = body

      res.status(200).json({
        msg: 'ok',
      })

      if (!convertedContent && error) {
        throw new Error('error in xsweet conversion')
      }

      const { result: serviceCallbackToken } = await ServiceCallbackToken.find({
        id: serviceCallbackTokenId,
        responseToken,
        bookComponentId,
      })

      if (serviceCallbackToken.length !== 1) {
        throw new Error('unknown service token or conflict')
      }

      const contentWithImagesHandled = await xsweetImagesHandler(
        convertedContent,
        bookComponentId,
      )

      const uploading = false
      await updateContent(bookComponentId, contentWithImagesHandled, 'en')

      await updateUploading(bookComponentId, uploading)
      const updatedBookComponent = await BookComponent.findById(bookComponentId)
      const belongingBook = await Book.findById(updatedBookComponent.bookId)
      await ServiceCallbackToken.deleteById(serviceCallbackTokenId)

      pubsub.publish(BOOK_COMPONENT_UPLOADING_UPDATED, {
        bookComponentUploadingUpdated: updatedBookComponent.id,
      })

      pubsub.publish(BOOK_UPDATED, {
        bookUpdated: belongingBook.id,
      })
    } catch (error) {
      const pubsub = await pubsubManager.getPubsub()
      const { body } = req

      const { objectId: bookComponentId } = body

      if (!(error instanceof NotFoundError)) {
        const bookComp = await getBookComponent(bookComponentId)
        await updateUploading(bookComponentId, false)
        await setStatus(bookComponentId, STATUSES.CONVERSION_ERROR)

        const belongingBook = await Book.findById(bookComp.bookId)

        pubsub.publish(BOOK_COMPONENT_UPDATED, {
          bookComponentUpdated: bookComponentId,
        })

        pubsub.publish(BOOK_UPDATED, {
          bookUpdated: belongingBook.id,
        })
      }

      // log error
      logger.error(error)
    }
  })
  app.use('/api/fileserver/cleanup/:scope/:hash', async (req, res, next) => {
    const { scope, hash } = req.params
    const filePath = `${process.cwd()}/${uploadsDir}/${scope}/${hash}`

    try {
      await fs.remove(filePath)
      res.end()
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
  app.use('/api/fileserver/:scope/:location/:file', async (req, res, next) => {
    const { location, file } = req.params

    try {
      const filePath = `${process.cwd()}/${uploadsDir}/temp/previewer/${location}/${file}`

      if (fs.existsSync(filePath)) {
        const mimetype = mime.lookup(filePath)
        const fileContent = await readFile(filePath, 'binary')
        res.setHeader('Content-Type', `${mimetype}`)
        res.setHeader('Content-Disposition', `attachment; filename=${file}`)
        res.write(fileContent, 'binary')
        res.end()
      } else {
        throw new Error('file was cleaned')
      }
    } catch (error) {
      res.status(500).json({ error })
    }
  })
  app.use(
    '/languages',
    express.static(path.join(__dirname, '../../', 'config/languages')),
  )
}

module.exports = RESTEndpoints
