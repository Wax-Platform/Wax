const { logger } = require('@coko/server')
const path = require('path')

const File = require('../file.model')
const FileTranslation = require('../../fileTranslation/fileTranslation.model')

exports.up = async knex => {
  try {
    const { result: files } = await File.find({})

    await Promise.all(
      files.map(async file => {
        const translation = await FileTranslation.findOne({ fileId: file.id })

        if (!file.mimetype.match(/^image\//)) {
          const storedObjects = []

          const storedObject = {
            type: 'original',
            key: file.objectKey,
            mimetype: file.mimetype,
            extension: file.extension,
            size: file.size,
          }

          storedObjects.push(storedObject)
          return file.patch({
            storedObjects,
            alt: translation ? translation.alt : '',
            name: `${file.name}.${file.extension}`,
            objectId:
              file.bookId || file.bookComponentId || file.templateId || null,
          })
        }

        const storedObjects = []

        const storedObjectOriginal = {
          type: 'original',
          key: file.objectKey,
          mimetype: file.mimetype,
          extension: file.extension,
          imageMetadata: {
            density: file.metadata.density,
            height: file.metadata.height,
            space: file.metadata.space,
            width: file.metadata.width,
          },
          size: file.size,
        }

        const storedObjectMedium = {
          type: 'medium',
          key:
            file.mimetype !== 'image/svg+xml'
              ? `${path.parse(file.objectKey).name}_medium.png`
              : `${path.parse(file.objectKey).name}_medium.svg`,
          mimetype:
            file.mimetype !== 'image/svg+xml' ? 'image/png' : 'image/svg+xml',
          extension: file.mimetype !== 'image/svg+xml' ? 'png' : 'svg',
          imageMetadata: {
            // this will be inconsistent for the case of existing images as it will hold original file's metadata
            density: file.metadata.density,
            height: file.metadata.height,
            space: file.metadata.space,
            width: file.metadata.width,
          },
          size: file.size, // this will be inconsistent for the case of existing images as it will be original file's size
        }

        const storedObjectSmall = {
          type: 'small',
          key:
            file.mimetype !== 'image/svg+xml'
              ? `${path.parse(file.objectKey).name}_small.png`
              : `${path.parse(file.objectKey).name}_small.svg`,
          mimetype:
            file.mimetype !== 'image/svg+xml' ? 'image/png' : 'image/svg+xml',
          extension: file.mimetype !== 'image/svg+xml' ? 'png' : 'svg',
          imageMetadata: {
            // this will be inconsistent for the case of existing images as it will hold original file's metadata
            density: file.metadata.density,
            height: file.metadata.height,
            space: file.metadata.space,
            width: file.metadata.width,
          },
          size: file.size, // this will be inconsistent for the case of existing images as it will be original file's size
        }

        storedObjects.push(storedObjectOriginal)
        storedObjects.push(storedObjectMedium)
        storedObjects.push(storedObjectSmall)
        return file.patch({
          storedObjects,
          alt: translation ? translation.alt : '',
          name: `${file.name}.${file.extension}`,
          objectId:
            file.bookId || file.bookComponentId || file.templateId || null,
        })
      }),
    )

    const hasColumnBookId = await knex.schema.hasColumn('files', 'book_id')

    const hasColumnBookComponentId = await knex.schema.hasColumn(
      'files',
      'book_component_id',
    )

    const hasColumnExtension = await knex.schema.hasColumn('files', 'extension')

    const hasColumnTemplateId = await knex.schema.hasColumn(
      'files',
      'template_id',
    )

    const hasColumnMimetype = await knex.schema.hasColumn('files', 'mimetype')
    const hasColumnSize = await knex.schema.hasColumn('files', 'size')
    const hasColumnSource = await knex.schema.hasColumn('files', 'source')

    const hasColumnObjectKey = await knex.schema.hasColumn(
      'files',
      'object_key',
    )

    const hasColumnMetadata = await knex.schema.hasColumn('files', 'metadata')
    const hasColumnDeleted = await knex.schema.hasColumn('files', 'deleted')

    const hasColumnForeignType = await knex.schema.hasColumn(
      'files',
      'foreign_type',
    )

    await knex.schema.table('files', table => {
      if (hasColumnBookId) {
        table.dropColumn('book_id')
      }

      if (hasColumnBookComponentId) {
        table.dropColumn('book_component_id')
      }

      if (hasColumnExtension) {
        table.dropColumn('extension')
      }

      if (hasColumnTemplateId) {
        table.dropColumn('template_id')
      }

      if (hasColumnMimetype) {
        table.dropColumn('mimetype')
      }

      if (hasColumnSize) {
        table.dropColumn('size')
      }

      if (hasColumnSource) {
        table.dropColumn('source')
      }

      if (hasColumnObjectKey) {
        table.dropColumn('object_key')
      }

      if (hasColumnMetadata) {
        table.dropColumn('metadata')
      }

      if (hasColumnDeleted) {
        table.dropColumn('deleted')
      }

      if (hasColumnForeignType) {
        table.dropColumn('foreign_type')
      }
    })

    await knex.schema.dropTableIfExists('file_translation')

    return true
  } catch (e) {
    logger.error(e)
    throw new Error(
      `Migration: Files: moving and migrating existing data failed`,
    )
  }
}

exports.down = async () => {}
