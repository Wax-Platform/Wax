const {
  BaseModel,
  Team,
  TeamMember,
  modelJsonSchemaTypes,
} = require('@coko/server')

const config = require('config')

const {
  addBookComponent,
} = require('../../controllers/bookComponent.controller')

const { booleanDefaultFalse, idNullable, stringNullable, arrayOfIds } =
  modelJsonSchemaTypes

const OWNER_TEAM = config
  .get('teams.nonGlobal')
  .find(team => team.role === 'owner')

class DocTreeManager extends BaseModel {
  static get tableName() {
    return 'doc_tree_manager'
  }

  static get schema() {
    return {
      type: 'object',
      properties: {
        title: stringNullable,
        parentId: idNullable,
        bookComponentId: idNullable,
        isFolder: booleanDefaultFalse,
        children: arrayOfIds,
        renameLock: booleanDefaultFalse,
      },
    }
  }

  // Here we create the resource and the team for that Resource
  static async createResource({
    title,
    isFolder,
    parentId,
    userId,
    options = {},
  }) {
    const insertedResource = await DocTreeManager.query(options.trx)
      .insertGraph({ title, isFolder, parentId })
      .returning('*')

    if (userId) {
      const authorTeam = await Team.query(options.trx).insert({
        objectId: insertedResource.id,
        objectType: 'docTreeManager',
        role: OWNER_TEAM.role,
        displayName: OWNER_TEAM.displayName,
      })

      await Team.addMember(authorTeam.id, userId, { trx: options.trx })
    }

    return insertedResource
  }

  static async createUserRootFolder(userId, options = {}) {
    return DocTreeManager.createResource({
      title: 'Root Folder',
      isFolder: true,
      parentId: null,
      userId,
      options,
    })
  }

  static async findRootFolderOfUser(userId, options = { trx: null }) {
    if (!userId) {
      return DocTreeManager.query(options.trx).findOne({ parentId: null })
    }

    const teamMembers = await TeamMember.query(options.trx).where({ userId })

    const teams = (teamMembers || []).map(teamMember => teamMember.teamId)

    if (teams.length > 0) {
      const userDocNodes = await Team.query(options.trx)
        .whereIn('id', teams)
        .andWhere({ objectType: 'docTreeManager', role: 'owner' })

      return DocTreeManager.query(options.trx)
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
    userId,
    bookComponent,
    options = { trx: null },
  }) {
    let parent = await DocTreeManager.query(options.trx).findOne({ id })

    // Find or create the root folder for that specific user
    if (!parent) {
      parent = await DocTreeManager.findRootFolderOfUser(userId, {
        trx: options.trx,
      })

      if (!parent && userId) {
        // if this is the first time that this user creates a document
        // create a root Node
        parent = await DocTreeManager.createUserRootFolder(userId, {
          trx: options.trx,
        })
      }
    }

    const insertedResource = await DocTreeManager.createResource({
      title: title || 'Untitled',
      isFolder: false,
      parentId: parent.id,
      userId,
      trx: options.trx,
    })

    parent.children.unshift(insertedResource.id)
    await DocTreeManager.query(options.trx)
      .patch({ children: parent.children })
      .findOne({ id: parent.id })

    const bookComponentInserted = await addBookComponent(
      bookComponent.divisionId,
      bookComponent.bookId,
      bookComponent.componentType,
      null,
      userId,
      {
        trx: options.trx,
      },
    )

    const docTree = await DocTreeManager.query(options.trx)
      .patch({ bookComponentId: bookComponentInserted.id })
      .findOne({ id: insertedResource.id })
      .returning('*')

    return docTree
  }

  static async getUserTreeResources(userId) {
    let allFiles = null

    if (userId) {
      const teamMembers = await TeamMember.query().where({ userId })
      const teams = (teamMembers || []).map(teamMember => teamMember.teamId)

      if (teams.length > 0) {
        const userDocNodes = await Team.query()
          .whereIn('id', teams)
          .andWhere({ objectType: 'docTreeManager', role: 'owner' })

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
