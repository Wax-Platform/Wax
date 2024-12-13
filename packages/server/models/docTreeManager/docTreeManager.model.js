const {
  modelJsonSchemaTypes,
  BaseModel,
  logger,
  Team,
  TeamMember,
} = require('@coko/server')
const { Doc } = require('../../models')
const config = require('config')

const { booleanDefaultFalse, idNullable, stringNullable, arrayOfIds } =
  modelJsonSchemaTypes

const AUTHOR_TEAM = config.teams.nonGlobal.author

class DocTreeManager extends BaseModel {
  static get tableName() {
    return 'doc_tree_manager'
  }

  static get schema() {
    return {
      properties: {
        title: stringNullable,
        parentId: idNullable,
        docId: idNullable,
        isFolder: booleanDefaultFalse,
        children: arrayOfIds,
      },
    }
  }

  // Here we create the resource and the team for that Resource
  static async createResource({ title, isFolder, parentId, userId }) {
    try {
      const insertedResource = await DocTreeManager.query()
        .insertGraph({ title, isFolder, parentId })
        .returning('*')
      if (userId) {
        const authorTeam = await Team.insert({
          objectId: insertedResource.id,
          objectType: 'docTreeManager',
          role: AUTHOR_TEAM.role,
          displayName: AUTHOR_TEAM.displayName,
        })

        await Team.addMember(authorTeam.id, userId)
      }
      return insertedResource
    } catch (e) {
      logger.info('EEEEEEEEEEEEEEEEEEEEEEE')
    }
  }

  static async createUserRootFolder(userId) {
    return await DocTreeManager.createResource({
      title: 'Root',
      isFolder: true,
      parentId: null,
      userId,
    })
  }

  static async findRootFolderOfUser(userId) {
    if (!userId) {
      return await DocTreeManager.query().findOne({ parentId: null })
    }

    const teamMembers = await TeamMember.query().where({ userId })

    const teams = (teamMembers || []).map(teamMember => teamMember.teamId)

    if (teams.length > 0) {
      const userDocNodes = await Team.query()
        .whereIn('id', teams)
        .andWhere({ objectType: 'docTreeManager', role: 'author' })

      return await DocTreeManager.query()
        .whereIn(
          'id',
          userDocNodes.map(docNode => docNode.objectId),
        )
        .findOne({ parentId: null })
    }

    return false
  }

  static async createNewFolderResource({ id = null, title, userId }) {
    let parent = await DocTreeManager.query().findOne({ id })

    // Find or create the root folder for that specific user
    if (!parent) {
      parent = await DocTreeManager.findRootFolderOfUser(userId)
      if (!parent && userId) {
        // if this is the first time that this user creates a document
        // create a root Node
        parent = await DocTreeManager.createUserRootFolder(userId)
      }
    }

    if (parent) {
      const insertedResource = await DocTreeManager.createResource({
        title: title || 'New Folder',
        isFolder: true,
        parentId: parent.id,
        userId,
      })

      parent.children.unshift(insertedResource.id)
      await DocTreeManager.query()
        .patch({ children: parent.children })
        .findOne({ id: parent.id })

      return insertedResource
    }

    return null
  }

  static async createNewDocumentResource({
    id = null,
    title,
    identifier,
    delta,
    state,
    userId,
  }) {
    let parent = await DocTreeManager.query().findOne({ id })
    try {
      // Find or create the root folder for that specific user
      if (!parent) {
        parent = await DocTreeManager.findRootFolderOfUser(userId)
        if (!parent && userId) {
          // if this is the first time that this user creates a document
          // create a root Node
          parent = await DocTreeManager.createUserRootFolder(userId)
        }
      }
      logger.info(`\x1b[32m ${JSON.stringify(parent)}`)
      const insertedResource = await DocTreeManager.createResource({
        title: title || 'New document',
        isFolder: false,
        parentId: parent.id,
        userId,
      })

      parent.children.unshift(insertedResource.id)
      await DocTreeManager.query()
        .patch({ children: parent.children })
        .findOne({ id: parent.id })

      const doc = await Doc.createDoc({ delta, state, identifier, userId })

      const docTree = await DocTreeManager.query()
        .patch({ docId: doc.id })
        .findOne({ id: insertedResource.id })
        .returning('*')

      return docTree
    } catch (error) {
      logger.info(error)
    }
  }

  static async getUserTreeResources(userId) {
    let allFiles = null
    if (userId) {
      const teamMembers = await TeamMember.query().where({ userId })
      const teams = (teamMembers || []).map(teamMember => teamMember.teamId)

      if (teams.length > 0) {
        const userDocNodes = await Team.query()
          .whereIn('id', teams)
          .andWhere({ objectType: 'docTreeManager', role: 'author' })

        allFiles = await DocTreeManager.query().whereIn(
          'id',
          userDocNodes.map(docNode => docNode.objectId),
        )
      }
    } else {
      allFiles = await DocTreeManager.query()
    }

    return allFiles
  }
}

module.exports = DocTreeManager
