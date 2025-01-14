const { modelTypes, BaseModel, logger } = require('@coko/server')
const { Team, TeamMember, Doc } = require('@pubsweet/models')
const config = require('config')

const { booleanDefaultFalse, idNullable, stringNullable, arrayOfIds } =
  modelTypes

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
      logger.info(e)
    }
  }

  static async getResource(id) {
    return DocTreeManager.query().findById(id)
  }

  static async getParentFolderByIdentifier(identifier) {
    const doc = await Doc.query().findOne({ identifier })
    const parentFolder = await DocTreeManager.query().findOne({
      docId: doc.id,
    })
    return parentFolder
  }

  static async moveResource({ id, newParentId, userId }) {
    const resource = await this.getResource(id)
    if (!resource) {
      throw new Error('Resource not found')
    }
    const parent = await this.getResource(resource.parentId)
    const newParent = await this.getResource(newParentId)

    if (!newParent.isFolder) {
      logger.info('New parent is not a folder')
      return this.openFolder(parent.id, 'id', userId)
    }

    parent.children = parent.children.filter(child => child.id !== id)
    newParent.children.push(id)
    // rename if childs will have the same name
    const safeName = await this.getSafeName({
      title: resource.title,
      id,
      parentId: newParentId,
    })
    await this.query().patch({ title: safeName }).findById(id)

    await this.query().patch({ parentId: newParentId }).findById(id)
    logger.info(`Resource ${id} moved to ${newParentId}`)
    await this.query().patch({ children: parent.children }).findById(parent.id)
    await this.query()
      .patch({ children: newParent.children })
      .findById(newParent.id)
    return this.openFolder(parent.id, 'id', userId)
  }

  static async getSafeName({ title, id, parentId }) {
    const existingResource = await this.getResource(id)
    const parent = await this.getResource(parentId || existingResource.parentId)
    const siblingNodes = await this.getChildren(parent.id)
    const existingTitles = siblingNodes.map(child => child.title)
    let safeTitle = title
    let i = 1
    while (existingTitles.includes(safeTitle)) {
      safeTitle = `${title} (${i})`
      i++
    }
    return safeTitle
  }

  static async getChildren(parentId) {
    const children = await this.query()
      .where({ parentId })
      .orderBy([
        { column: 'isFolder', order: 'desc' },
        { column: 'created', order: 'desc' },
      ])

    const getChildDocs = async children => {
      return Promise.all(
        children.map(async child => {
          if (!child.docId) return child
          const doc = await Doc.query().findOne({ id: child.docId })
          return {
            ...child,
            doc: doc ? { id: doc.id, identifier: doc.identifier } : null,
          }
        }),
      )
    }
    return getChildDocs(children)
  }

  static async checkNameAvailability({ parentId, title }) {
    const existingResource = await DocTreeManager.query()
      .findOne({ parentId })
      .where({ title })
    return !existingResource
  }

  static async openFolder(id, idType, userId) {
    const method =
      idType === 'identifier' ? 'getParentFolderByIdentifier' : 'getResource'
    const pathMap = {
      pathNames: [],
      pathIds: [],
    }

    const currentResource = id && (await DocTreeManager[method](id))
    let folder = currentResource

    if (!currentResource?.isFolder) {
      folder = currentResource?.parentId
        ? await DocTreeManager.query().findById(currentResource.parentId)
        : await DocTreeManager.findRootFolderOfUser(userId)
    }

    let current = folder

    while (current) {
      pathMap.pathNames.unshift(current.title)
      pathMap.pathIds.unshift(current.id)
      current = await DocTreeManager.query().findById(current.parentId)
    }

    const folderChildren = await DocTreeManager.getChildren(folder.id)
    return {
      path: pathMap,
      currentFolder: { ...folder, children: folderChildren },
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
    const parent = await DocTreeManager.getParentOrRoot(id, userId)

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

  static async getParentOrRoot(id, userId) {
    return (
      (await this.getResource(id)) ||
      (await this.findRootFolderOfUser(userId)) ||
      (await this.createUserRootFolder(userId))
    )
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

  static async deleteFolderAndChildren(id) {
    const resource = await DocTreeManager.query().findById(id)
    if (!resource) {
      throw new Error('Folder not found')
    }

    const collectIds = async (nodeId, ids = { folders: [], docs: [] }) => {
      const node = await DocTreeManager.query().findById(nodeId)
      if (node?.isFolder) {
        ids.folders.push(nodeId)
        await Promise.all(
          node.children.map(childId => collectIds(childId, ids)),
        )
      } else {
        ids.docs.push(nodeId)
      }
      return ids
    }

    const ids = await collectIds(id)

    if (ids.docs.length > 0) {
      await DocTreeManager.query().delete().whereIn('id', ids.docs)
    }

    if (ids.folders.length > 0) {
      await DocTreeManager.query().delete().whereIn('id', ids.folders)
    }

    await DocTreeManager.query().deleteById(id)
    logger.info(`Resource ${id} deleted successfully`)
    return id
  }

  static async rename({}) {}
}

module.exports = DocTreeManager
