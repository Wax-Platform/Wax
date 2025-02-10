const { modelTypes, BaseModel, logger } = require('@coko/server')
const { Team, TeamMember } = require('@pubsweet/models')
const Y = require('yjs')
const config = require('config')

const Template = require('../template/template.model')

const AUTHOR_TEAM = config.teams.nonGlobal.author
const VIEWER_TEAM = config.teams.nonGlobal.viewer

const { stringNotEmpty, arrayOfObjectsNullable, idNullable } = modelTypes

class Doc extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'doc'
  }

  static get tableName() {
    return 'docs'
  }

  static get relationMappings() {
    return {
      template: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Template,
        join: {
          from: 'docs.templateId',
          to: 'templates.id',
        },
      },
    }
  }

  static get schema() {
    return {
      type: 'object',
      properties: {
        identifier: stringNotEmpty,
        docs_prosemirror_delta: arrayOfObjectsNullable,
        docs_y_doc_state: {
          type: 'binary',
        },
        templateId: idNullable,
      },
    }
  }

  async addMemberAsViewer(userId) {
    const authorTeam = await Team.query().findOne({
      objectId: this.id,
      objectType: 'doc',
      role: AUTHOR_TEAM.role,
    })

    const isAuthor = await TeamMember.query().findOne({
      teamId: authorTeam.id,
      userId,
    })

    if (!isAuthor) {
      let viewerTeam = await Team.query().findOne({
        objectId: this.id,
        objectType: 'doc',
        role: VIEWER_TEAM.role,
      })

      if (!viewerTeam) {
        viewerTeam = await Team.insert({
          objectId: this.id,
          objectType: 'doc',
          role: VIEWER_TEAM.role,
          displayName: VIEWER_TEAM.displayName,
        })
      }

      const isViewer = await TeamMember.query().findOne({
        teamId: viewerTeam.id,
        userId,
      })

      if (!isViewer) {
        await Team.addMember(viewerTeam.id, userId)
      }

      return viewerTeam
    }

    return false
  }

  static async createDoc({ userId, identifier, ...payload }, options) {
    const { trx } = options || {}
    const WSSharedDoc = require('../../services/yjs/wsSharedDoc')
    const doc = new WSSharedDoc(identifier, userId)
    doc.gc = true

    const {
      delta = doc.getText('prosemirror').toDelta(),
      state = Y.encodeStateAsUpdate(doc),
      templateId = null,
    } = payload
    logger.info('Creating template for user:', userId)

    const createdDoc = await Doc.query(trx)
      .insert({
        docs_prosemirror_delta: delta,
        docs_y_doc_state: state,
        identifier,
        templateId,
      })
      .returning('*')

    if (userId) {
      const authorTeam = await Team.insert({
        objectId: createdDoc.id,
        objectType: 'doc',
        role: AUTHOR_TEAM.role,
        displayName: AUTHOR_TEAM.displayName,
      })

      await Team.addMember(authorTeam.id, userId)
    }

    return createdDoc
  }

  static async getSharedDocs(userId) {
    let allDocs = []
    if (userId) {
      const teamMembers = await TeamMember.query().where({ userId })
      const teams = (teamMembers || []).map(teamMember => teamMember.teamId)

      if (teams.length > 0) {
        const userDocNodes = await Team.query()
          .whereIn('id', teams)
          .andWhere({ objectType: 'doc', role: 'viewer' })

        allDocs = await Doc.query().whereIn(
          'id',
          userDocNodes.map(docNode => docNode.objectId),
        )
      }
    }

    return allDocs
  }

  static async isMyDoc(id, userId) {
    let teamMember = null
    const teamAuthorOfDoc = await Team.query().findOne({
      objectType: 'doc',
      objectId: id,
      role: 'author',
    })

    if (teamAuthorOfDoc) {
      teamMember = await TeamMember.query().findOne({
        teamId: teamAuthorOfDoc.id,
        userId,
      })
    }

    return teamMember
  }

  static async deleteDoc(id) {
    const doc = await Doc.query().findById(id)
    if (doc) {
      await Doc.query().deleteById(id)
    }
  }

  static async updateTemplateId(docId, templateId) {
    await Doc.query().patch({ templateId }).where('id', docId)
  }
}

module.exports = Doc
