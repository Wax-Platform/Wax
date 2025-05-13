/*
  TO DO

  Update division's "bookComponents" array of ids on insert.

  Read valid component type values from config and make it an enum
*/

const { BaseModel } = require('@coko/server')

const { uuid } = require('@coko/server')

const Base = require('../ketidaBase')

const { boolean, booleanDefaultFalse, id, integerPositive, string } =
  require('../helpers').schema

class BookComponent extends Base {
  constructor(properties) {
    super(properties)
    this.type = 'bookComponent'
  }

  static get tableName() {
    return 'BookComponent'
  }

  static get relationMappings() {
    /* eslint-disable global-require */
    const Book = require('../book/book.model')
    const Division = require('../division/division.model')
    const BookComponentState = require('../bookComponentState/bookComponentState.model')
    /* eslint-enable global-require */
    return {
      book: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Book,
        join: {
          from: 'BookComponent.bookId',
          to: 'Book.id',
        },
      },
      division: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Division,
        join: {
          from: 'BookComponent.divisionId',
          to: 'Division.id',
        },
      },
      bookComponentState: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: BookComponentState,
        join: {
          from: 'BookComponent.id',
          to: 'BookComponentState.bookComponentId',
        },
      },
    }
  }

  static get schema() {
    return {
      type: 'object',
      required: ['bookId', 'componentType', 'divisionId'],
      properties: {
        archived: booleanDefaultFalse,
        bookId: id,
        /*
          component type (eg. 'chapter', 'part' etc) needs to be loose, as
          its accepted values are configurable
          OR read from config (doable?)
        */
        componentType: string,
        parentComponentId: id,
        divisionId: id,
        pagination: {
          type: 'object',
          properties: {
            left: boolean,
            right: boolean,
          },
          default: {
            left: false,
            right: false,
          },
        },
        referenceId: id,

        /*
          counters
        */
        equationCounter: integerPositive,
        figureCounter: integerPositive,
        noteCounter: integerPositive,
        pageCounter: integerPositive,
        tableCounter: integerPositive,
        wordCounter: integerPositive,
      },
    }
  }

  /*
    If there is no reference id, assume it is a new component and generate one.
  */
  $beforeInsert() {
    super.$beforeInsert()
    this.referenceId = this.referenceId || uuid()
  }

  getBook() {
    return this.$relatedQuery('book')
  }

  getDivision() {
    return this.$relatedQuery('division')
  }

  getBookComponentState() {
    return this.$relatedQuery('bookComponentState')
  }

  /* eslint-disable no-shadow */
  static async isMyBookComponent(id, userId) {
    /* eslint-disable global-require */
    const Team = require('../team/team.model')
    const TeamMember = require('../teamMember/teamMember.model')
    /* eslint-enable global-require */

    let teamMember = null

    const teamOwnerOfDoc = await Team.query().findOne({
      objectType: 'bookComponent',
      objectId: id,
      role: 'owner',
    })

    if (teamOwnerOfDoc) {
      teamMember = await TeamMember.query().findOne({
        teamId: teamOwnerOfDoc.id,
        userId,
      })
    }

    return !!teamMember
  }

  static async getSharedBookComponents(userId) {
    /* eslint-disable global-require */
    const Team = require('../team/team.model')
    const TeamMember = require('../teamMember/teamMember.model')
    /* eslint-enable global-require */

    let allBookCompoments = []

    if (userId) {
      const teamMembers = await TeamMember.query().where({ userId })
      const teams = (teamMembers || []).map(teamMember => teamMember.teamId)

      if (teams.length > 0) {
        const userDocNodes = await Team.query()
          .whereIn('id', teams)
          .andWhere({ objectType: 'bookComponent', role: 'collaborator' })

        if (userDocNodes.length > 0) {
          allBookCompoments = await BookComponent.query().whereIn(
            'id',
            userDocNodes.map(docNode => docNode.objectId),
          )
        }
      }
    }

    return allBookCompoments
  }

  static async getUserBookComponentDetails(userId, bookComponentId, options) {
    try {
      const { trx } = options

      const queryBuilder = BookComponent.query(trx)
        .leftJoin(
          'book_component_translation',
          'book_component_translation.book_component_id',
          'book_component.id',
        )
        .leftJoin('teams', 'teams.object_id', 'book_component.id')
        .leftJoin('team_members', 'team_members.team_id', 'teams.id')
        .leftJoin('users', 'users.id', 'team_members.user_id')
        .leftJoin('identities', 'identities.user_id', 'users.id')

      return queryBuilder
        .select([
          'book_component.id',
          'book_component_translation.title as title',
          'users.given_names as name',
          'identities.email',
        ])
        .where({
          'book_component.deleted': false,
          'users.id': userId,
          'book_component.id': bookComponentId,
        })
        .skipUndefined()
        .first()
    } catch (e) {
      throw new Error(e.message)
    }
  }
}

module.exports = BookComponent
