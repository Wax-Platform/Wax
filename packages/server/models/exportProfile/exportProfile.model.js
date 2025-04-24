const objection = require('objection')
const Base = require('../ketidaBase')

const { id, date, string, stringNotEmpty } = require('../helpers').schema

const format = {
  enum: ['epub', 'pdf', 'web'],
}

const trimSize = {
  enum: ['8.5x11', '6x9', '5.5x8.5', null],
}

const providerItem = {
  type: 'object',
  additionalProperties: false,
  required: ['providerLabel', 'externalProjectId'],
  properties: {
    providerLabel: stringNotEmpty,
    externalProjectId: stringNotEmpty,
    bookMetadataHash: stringNotEmpty,
    bookContentHash: stringNotEmpty,
    templateHash: stringNotEmpty,
    lastSync: date,
  },
}

const includedComponents = {
  type: 'object',
  additionalProperties: false,
  properties: {
    toc: { type: 'boolean', default: true },
    copyright: { type: 'boolean', default: true },
    titlePage: { type: 'boolean', default: true },
    cover: { type: 'boolean', default: false },
  },
  default: {
    toc: true,
    copyright: true,
    titlePage: true,
    cover: false,
  },
}

const providerInfo = {
  type: 'array',
  default: [],
  additionalProperties: false,
  items: providerItem,
}

const downloadableAssets = {
  type: 'object',
  properties: {
    pdf: { type: 'boolean', default: false },
    epub: { type: 'boolean', default: false },
    pdfProfileId: { type: 'id', default: null },
    epubProfileId: { type: 'id', default: null },
  },
  default: {
    pdf: false,
    epub: false,
    pdfProfileId: null,
    epubProfileId: null,
  },
}

const runningBlocks = {
  type: 'object',
  properties: {
    customHeader: { type: 'string', default: '' },
    customFooter: { type: 'string', default: '' },
  },
  default: {
    customHeader: '',
    customFooter: '',
  },
}

class ExportProfile extends Base {
  constructor(properties) {
    super(properties)
    this.type = 'exportProfile'
  }

  static get tableName() {
    return 'ExportProfiles'
  }

  $beforeInsert(queryContext) {
    if (this.format === 'epub' && this.trimSize) {
      throw new objection.ValidationError({
        message: 'trim size is only valid option for PDF format',
        type: 'ValidationError',
      })
    }

    if (this.format === 'pdf' && !this.trimSize) {
      throw new objection.ValidationError({
        message: 'trim size is required for PDF format',
        type: 'ValidationError',
      })
    }

    super.$beforeInsert(queryContext)
  }

  static async beforeUpdate({ asFindQuery, inputItems }) {
    const affectedItems = await asFindQuery().select('*')
    affectedItems.forEach(item => {
      const { format: currentFormat, trimSize: currentTrimSize } = item

      inputItems.forEach(input => {
        const { format: incomingFormat, trimSize: incomingTrimSize } = input

        const finalFormat = incomingFormat || currentFormat

        const finalTrimSize =
          incomingTrimSize === undefined ? currentTrimSize : incomingTrimSize

        if (finalFormat === 'epub') {
          if (finalTrimSize) {
            throw new objection.ValidationError({
              message: 'trim size is only valid option for PDF format',
              type: 'ValidationError',
            })
          }
        }

        if (finalFormat === 'pdf') {
          if (!finalTrimSize) {
            throw new objection.ValidationError({
              message: 'trim size is required for PDF format',
              type: 'ValidationError',
            })
          }
        }
      })
    })
  }

  static get schema() {
    return {
      additionalProperties: false,
      type: 'object',
      required: ['bookId', 'displayName', 'format', 'templateId'],
      properties: {
        bookId: id,
        displayName: stringNotEmpty,
        templateId: id,
        includedComponents,
        format,
        trimSize,
        providerInfo,
        isbn: string,
        downloadableAssets,
        runningBlocks,
      },
    }
  }
}

module.exports = ExportProfile
