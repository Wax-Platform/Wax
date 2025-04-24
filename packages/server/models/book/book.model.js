const { Model, ValidationError } = require('objection')
const { get, isEmpty } = require('lodash')

const { uuid } = require('@coko/server')

const Base = require('../ketidaBase')

const {
  booleanDefaultFalse,
  id,
  string,
  year,
  booleanDefaultTrue,
  dateOrNull,
} = require('../helpers').schema

const outlineItem = {
  type: 'object',
  additionalProperties: false,
  $id: 'outline_item',
  properties: {
    id,
    title: string,
    type: string,
    parentId: id,
    children: {
      type: 'array',
      additionalProperties: false,
      default: [],
      items: {
        $ref: 'outline_item',
      },
    },
  },
}

const contentStructureItem = {
  type: 'object',
  $id: 'content_structure_item',
  additionalProperties: false,
  properties: {
    id,
    type: string,
    displayName: string,
  },
}

const levelItem = {
  type: 'object',
  additionalProperties: false,
  $id: 'level_item',
  properties: {
    id,
    type: string,
    displayName: string,
    contentStructure: {
      type: 'array',
      additionalProperties: false,
      default: [],
      items: contentStructureItem,
    },
  },
}

const bookStructure = {
  type: ['object', 'null'],
  default: null,
  additionalProperties: false,
  $id: 'book_structure',
  properties: {
    id,
    levels: {
      type: 'array',
      default: [],
      additionalProperties: false,
      items: levelItem,
    },
    outline: {
      type: 'array',
      default: [],
      additionalProperties: false,
      items: outlineItem,
    },
    finalized: booleanDefaultFalse,
    showWelcome: booleanDefaultTrue,
  },
}

const isbnItem = {
  type: 'object',
  additionalProperties: false,
  properties: {
    isbn: { type: 'string' },
    label: { type: 'string' },
  },
  required: ['isbn'],
}

const podMetadata = {
  type: ['object'],
  additionalProperties: false,
  properties: {
    authors: string,
    bottomPage: string,
    copyrightLicense: string,
    isbns: {
      type: 'array',
      additionalProperties: false,
      default: [],
      items: isbnItem,
      uniqueItems: true,
    },
    licenseTypes: {
      type: 'object',
      additionalProperties: false,
      properties: {
        NC: {
          type: ['boolean', 'null'],
        },
        SA: {
          type: ['boolean', 'null'],
        },
        ND: {
          type: ['boolean', 'null'],
        },
      },
    },
    ncCopyrightHolder: string,
    ncCopyrightYear: dateOrNull,
    publicDomainType: string,
    saCopyrightHolder: string,
    saCopyrightYear: dateOrNull,
    topPage: string,
  },
}

const statusFieldSchema = {
  type: 'integer',
  minimum: 0,
  default: 0,
}

// const previewerConfiguration = {
//   type: ['object', 'null'],
//   additionalProperties: false,
//   properties: {
//     additionalProperties: false,
//     templateId: { type: ['string', 'null'], format: 'uuid', default: null },
//     trimSize: { type: ['string', 'null'], default: null },
//     additionalExportOptions: {
//       includeTOC: { type: 'boolean', default: true },
//       includeCopyrights: { type: 'boolean', default: true },
//       includeTitlePage: { type: 'boolean', default: true },
//     },
//   },
// }

// const associatedTemplatesSchema = {
//   type: 'object',
//   additionalProperties: false,
//   properties: {
//     pagedjs: {
//       type: 'array',
//       additionalProperties: false,
//       items: previewerConfiguration,
//     },
//     epub: previewerConfiguration,
//     icml: previewerConfiguration,
//   },
//   default: {
//     pagedjs: [],
//     epub: null,
//     icml: null,
//   },
// }
const cover = {
  type: 'array',
  additionalProperties: false,
  items: {
    type: 'object',
    properties: {
      fileId: id,
      altText: string,
    },
  },
}

const webPublishInfo = {
  type: 'object',
  additionalProperties: false,
  properties: {
    published: { type: 'boolean', default: false },
    firstPublished: dateOrNull,
    lastUpdated: dateOrNull,
    profileId: id,
    publicUrl: { type: 'string', default: null },
  },
  default: {
    published: false,
    firstPublished: null,
    lastUpdated: null,
    profileId: null,
    publicUrl: '',
  },
}

class Book extends Base {
  constructor(properties) {
    super(properties)
    this.type = 'book'
  }

  static get tableName() {
    return 'Book'
  }

  static get relationMappings() {
    /* eslint-disable global-require */
    const BookCollection = require('../bookCollection/bookCollection.model')
    const ExportProfile = require('../exportProfile/exportProfile.model')
    /* eslint-enable global-require */
    return {
      bookCollection: {
        relation: Model.BelongsToOneRelation,
        modelClass: BookCollection,
        join: {
          from: 'Book.collectionId',
          to: 'BookCollection.id',
        },
      },
      exportProfiles: {
        relation: Model.HasManyRelation,
        modelClass: ExportProfile,
        join: {
          from: 'book.id',
          to: 'export_profiles.book_id',
        },
      },
    }
  }

  async getExportProfiles(tr = undefined) {
    return this.$relatedQuery('exportProfiles', tr)
  }

  static async getAllBooks(options, collectionId = undefined) {
    try {
      const { trx, showArchived, page, pageSize, orderBy } = options

      let queryBuilder = Book.query(trx).leftJoin(
        'book_translation',
        'book_translation.book_id',
        'book.id',
      )

      if (orderBy) {
        if (orderBy.column === 'title') {
          queryBuilder.orderByRaw(
            `LOWER(book_translation.title) ${orderBy.order} NULLS LAST`,
          )
        } else {
          queryBuilder = queryBuilder.orderBy([orderBy])
        }
      }

      if (
        (Number.isInteger(page) && !Number.isInteger(pageSize)) ||
        (!Number.isInteger(page) && Number.isInteger(pageSize))
      ) {
        throw new Error(
          'both page and pageSize integers needed for paginated results',
        )
      }

      if (Number.isInteger(page) && Number.isInteger(pageSize)) {
        if (page < 0) {
          throw new Error(
            'invalid index for page (page should be an integer and greater than or equal to 0)',
          )
        }

        if (pageSize <= 0) {
          throw new Error(
            'invalid size for pageSize (pageSize should be an integer and greater than 0)',
          )
        }

        queryBuilder = queryBuilder.page(page, pageSize)
      }

      const res = await queryBuilder
        .select([
          'book.id',
          'book.collectionId',
          'book.publicationDate',
          'book.archived',
          'book.bookStructure',
          'book.divisions',
          'book.thumbnailId',
          'book_translation.title',
        ])
        .groupBy('book.id', 'book_translation.title')
        .where({
          'book.deleted': false,
          'book.archived': showArchived,
          'book.collectionId': collectionId,
        })
        .skipUndefined()

      const { results, total } = res

      return {
        result: page !== undefined ? results : res,
        totalCount: total || res.length,
      }
    } catch (e) {
      throw new Error(e.message)
    }
  }

  static async getUserBooks(userId, options) {
    try {
      const { trx, showArchived, page, pageSize, orderBy, collectionId } =
        options

      let queryBuilder = Book.query(trx)
        .leftJoin('book_translation', 'book_translation.book_id', 'book.id')
        .leftJoin('teams', 'book.id', 'teams.object_id')
        .leftJoin('team_members', 'teams.id', 'team_members.team_id')
        .leftJoin('users', 'team_members.user_id', 'users.id')

      if (orderBy) {
        if (orderBy.column === 'title') {
          queryBuilder = queryBuilder.orderByRaw(
            `LOWER(book_translation.title) ${orderBy.order} NULLS LAST`,
          )
        } else {
          queryBuilder = queryBuilder.orderBy([orderBy])
        }
      }

      if (
        (Number.isInteger(page) && !Number.isInteger(pageSize)) ||
        (!Number.isInteger(page) && Number.isInteger(pageSize))
      ) {
        throw new Error(
          'both page and pageSize integers needed for paginated results',
        )
      }

      if (Number.isInteger(page) && Number.isInteger(pageSize)) {
        if (page < 0) {
          throw new Error(
            'invalid index for page (page should be an integer and greater than or equal to 0)',
          )
        }

        if (pageSize <= 0) {
          throw new Error(
            'invalid size for pageSize (pageSize should be an integer and greater than 0)',
          )
        }

        queryBuilder = queryBuilder.page(page, pageSize)
      }

      const res = await queryBuilder
        .select([
          'book.id',
          'book.collectionId',
          'book.publicationDate',
          'book.archived',
          'book.bookStructure',
          'book.divisions',
          'book.thumbnailId',
          'book.cover',
          'book_translation.title',
        ])
        .groupBy('book.id', 'book_translation.title')
        .where({
          'book.deleted': false,
          'book.archived': showArchived,
          'users.id': userId,
          'book.collectionId': collectionId,
        })
        .skipUndefined()

      const { results, total } = res

      return {
        result: page !== undefined ? results : res,
        totalCount: total || res.length,
      }
    } catch (e) {
      throw new Error(e.message)
    }
  }

  static async getUserBookDetails(userId, bookId, options) {
    try {
      const { trx } = options

      const queryBuilder = Book.query(trx)
        .leftJoin('book_translation', 'book_translation.book_id', 'book.id')
        .leftJoin('teams', 'teams.object_id', 'book.id')
        .leftJoin('team_members', 'team_members.team_id', 'teams.id')
        .leftJoin('users', 'users.id', 'team_members.user_id')
        .leftJoin('identities', 'identities.user_id', 'users.id')

      return queryBuilder
        .select([
          'book.id',
          'book_translation.title as title',
          'users.given_names as name',
          'identities.email',
        ])
        .where({
          'book.deleted': false,
          'users.id': userId,
          'book.id': bookId,
        })
        .skipUndefined()
        .first()
    } catch (e) {
      throw new Error(e.message)
    }
  }

  static get schema() {
    return {
      type: 'object',
      $id: 'book',
      properties: {
        archived: booleanDefaultFalse,
        collectionId: id,
        divisions: {
          $id: 'division_item',
          type: 'array',
          items: id,
          default: [],
        },
        bookStructure,
        referenceId: id,
        publicationDate: string,
        edition: {
          type: 'integer',
          minimum: 0,
          maximum: 100,
        },
        copyrightStatement: string,
        copyrightYear: year,
        copyrightHolder: string,
        isbn: string,
        issn: string,
        issnL: string,
        license: string,
        podMetadata,
        status: statusFieldSchema,
        // associatedTemplates: associatedTemplatesSchema,
        thumbnailId: id,
        cover,
        webPublishInfo,
      },
    }
  }

  // Takes into consideration up to three levels of nesting
  ensureIds() {
    if (this.bookStructure) {
      if (!this.bookStructure.id) {
        this.bookStructure.id = uuid()
      }

      this.bookStructure.levels.forEach((level, index) => {
        if (!level.id) {
          this.bookStructure.levels[index].id = uuid()
        }

        level.contentStructure.forEach((contentItem, itemIndex) => {
          if (!contentItem.id) {
            this.bookStructure.levels[index].contentStructure[itemIndex].id =
              uuid()
          }
        })
      })
      this.bookStructure.outline.forEach(
        (outlineItemLevelOne, levelOneIndex) => {
          const levelOneId = uuid()

          if (!outlineItemLevelOne.id) {
            this.bookStructure.outline[levelOneIndex].id = levelOneId
            this.bookStructure.outline[levelOneIndex].parentId = levelOneId
          }

          outlineItemLevelOne.children.forEach(
            (outlineItemLevelTwo, levelTwoIndex) => {
              const levelTwoId = uuid()

              if (!outlineItemLevelTwo.id) {
                this.bookStructure.outline[levelOneIndex].children[
                  levelTwoIndex
                ].id = levelTwoId
                this.bookStructure.outline[levelOneIndex].children[
                  levelTwoIndex
                ].parentId = levelOneId
              }

              outlineItemLevelTwo.children.forEach(
                (outlineItemLevelThree, levelThreeIndex) => {
                  const levelThreeId = uuid()

                  if (!outlineItemLevelThree.id) {
                    this.bookStructure.outline[levelOneIndex].children[
                      levelTwoIndex
                    ].children[levelThreeIndex].id = levelThreeId
                    this.bookStructure.outline[levelOneIndex].children[
                      levelTwoIndex
                    ].children[levelThreeIndex].parentId = levelTwoId
                  }
                },
              )
            },
          )
        },
      )
    }
  }

  validatePodMetadataIsbns() {
    const isbns = get(this.podMetadata, 'isbns')
    const fieldDuplicates = {}

    if (isEmpty(isbns)) {
      return
    }

    const checkForDuplicates = (items, itemPath) => {
      if (!isEmpty(items)) {
        // Identify duplicate
        const valueCount = {}
        const duplicates = []
        items.forEach(item => {
          const trimmedValue = get(item, itemPath, '').trim()

          if (!isEmpty(trimmedValue)) {
            valueCount[trimmedValue] = (valueCount[trimmedValue] || 0) + 1

            if (valueCount[trimmedValue] === 2) {
              duplicates.push(trimmedValue)
            }
          }
        })

        if (!isEmpty(duplicates)) {
          fieldDuplicates[itemPath] = duplicates
        }
      }
    }

    checkForDuplicates(isbns, 'label')
    checkForDuplicates(isbns, 'isbn')

    if (!isEmpty(fieldDuplicates)) {
      throw new ValidationError({
        message: 'ISBN list should not contain duplicate labels or values',
        type: 'ISBNDuplicateError',
        data: fieldDuplicates,
      })
    }

    if (isbns.length > 1) {
      isbns.forEach(item => {
        if (isEmpty(item.label?.trim())) {
          throw new ValidationError({
            message: 'ISBN label is required when there are multiple ISBNs',
            type: 'ISBNLabelError',
          })
        }
      })
    }

    isbns.forEach(item => {
      // isbn MAY NOT be empty
      if (isEmpty(item.isbn?.trim())) {
        throw new ValidationError({
          message: 'ISBN value is required',
          type: 'ISBNValueError',
        })
      }

      // isbn MAY ONLY CONTAIN ' ', '-' or '0-9'
      if (item.isbn.search(/[^\s\-0-9]/) !== -1) {
        throw new ValidationError({
          message: 'ISBN values may only contain spaces, dashes and digits',
          type: 'ISBNValueError',
        })
      }
    })
  }

  $beforeInsert() {
    super.$beforeInsert()
    // If no reference id is given, assume that this is a new book & create one
    this.referenceId = this.referenceId || uuid()
    this.ensureIds()
    this.validatePodMetadataIsbns()
  }

  $beforeUpdate() {
    super.$beforeUpdate()
    this.ensureIds()
    this.validatePodMetadataIsbns()
  }

  // static async beforeDelete({ asFindQuery, transaction }) {
  //   try {
  //     /* eslint-disable global-require */
  //     const ExportProfile = require('../exportProfile/exportProfile.model')
  //     const BookExportProfile = require('../bookExportProfile/bookExportProfile.model')
  //     /* eslint-enable global-require */

  //     const affectedItems = await asFindQuery().select('id')

  //     const { id: toBeDeletedBookId } = affectedItems[0]

  //     const { result: exportProfiles } = await BookExportProfile.find(
  //       {
  //         bookId: toBeDeletedBookId,
  //       },
  //       { trx: transaction },
  //     )

  //     return ExportProfile.query(transaction)
  //       .delete()
  //       .whereIn(
  //         'id',
  //         exportProfiles.map(exportProfile => exportProfile.id),
  //       )
  //   } catch (e) {
  //     throw new Error(e.message)
  //   }
  // }
}

module.exports = Book
