/*
  TO DO

  Define comments when wax 2 is up.
  Comment item userId should be related to the user table.
  Resolve user name when getting comments.

  Uploading (should it be here, or can we get away with simply
    writing it in localstorage?)
*/

const { BaseModel } = require('@coko/server')

const Base = require('../ketidaBase')

const { array, booleanDefaultFalse, id, string, integerPositive } =
  require('../helpers').schema

class BookComponentState extends Base {
  constructor(properties) {
    super(properties)
    this.type = 'bookComponentState'
  }

  static get tableName() {
    return 'BookComponentState'
  }

  static get relationMappings() {
    /* eslint-disable global-require */
    const BookComponent = require('../bookComponent/bookComponent.model')
    /* eslint-enable global-require */
    return {
      bookComponent: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: BookComponent,
        join: {
          from: 'BookComponentState.bookComponentId',
          to: 'BookComponent.id',
        },
      },
    }
  }

  static get schema() {
    return {
      type: 'object',
      required: ['bookComponentId'],
      properties: {
        bookComponentId: id,
        comments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
              //  TODO FOREIGN userId:
              content: {
                type: 'string',
                minLength: 1,
              },
            },
          },
        },
        trackChangesEnabled: booleanDefaultFalse,
        uploading: booleanDefaultFalse,
        includeInToc: booleanDefaultFalse,
        runningHeadersRight: string,
        runningHeadersLeft: string,
        // left loose on purpose to allow for configurability
        workflowStages: array,
        status: integerPositive,
      },
    }
  }

  getBookComponent() {
    return this.$relatedQuery('bookComponent')
  }
}

module.exports = BookComponentState
