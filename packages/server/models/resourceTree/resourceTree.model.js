const {
  modelTypes,
  BaseModel,
  logger,
  useTransaction,
} = require('@coko/server')
const { Team, TeamMember, Doc, User } = require('@pubsweet/models')
const { idNullable, stringNullable, arrayOfIds, string } = modelTypes
const config = require('config')

const AUTHOR_TEAM = config.teams.nonGlobal.author
const RESOURCE_TYPES = ['doc', 'dir', 'root', 'system']
const TEAM_OBJECT_TYPE = 'resource'
const EXTENSIONS = ['doc', 'img', 'snip', 'css']
const TYPES_TO_EXCLUDE_FROM_TEAM = ['system', 'root']
const SYSTEM_FOLDERS = [
  'Templates',
  'Images',
  'Thrash',
  'Shared',
  'Favorites',
  'Documents',
]

const createIdentifier = () => {
  return Array.from(Array(20), () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join('')
}

const resourceTypeRankingSQL = `
    CASE 
      WHEN resource_type = 'system' THEN 1
      WHEN resource_type = 'dir' THEN 2
      WHEN resource_type = 'doc' THEN 3
      ELSE 4
    END
  `
class ResourceTree extends BaseModel {
  static get tableName() {
    return 'resource_tree'
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'resource_tree.userId',
          to: 'users.id',
        },
      },
      team: {
        relation: BaseModel.HasOneRelation,
        modelClass: Team,
        join: {
          from: 'resource_tree.id',
          to: 'teams.objectId',
        },
        filter: query => query.where('teams.objectType', TEAM_OBJECT_TYPE),
      },
    }
  }

  static get schema() {
    return {
      properties: {
        userId: idNullable,
        resourceType: { type: string, enum: RESOURCE_TYPES },
        extension: { type: string, enum: EXTENSIONS, nullable: true },
        title: stringNullable,
        parentId: idNullable,
        docId: idNullable,
        children: arrayOfIds,
      },
    }
  }

  static async createResource(
    { title, resourceType, parentId, userId, extension },
    options = {},
  ) {
    const { trx } = options
    try {
      // Check if the userId exists in the users table
      if (userId) {
        const userExists = await User.query(trx).findById(userId)
        if (!userExists) {
          throw new Error(`User with id ${userId} does not exist`)
        }
      }

      const insertedResource = await ResourceTree.query(trx).insert({
        title,
        resourceType,
        parentId,
        userId,
        extension,
      })

      if (!TYPES_TO_EXCLUDE_FROM_TEAM.includes(resourceType)) {
        const authorTeam = await Team.query(trx).insert({
          objectId: insertedResource.id,
          objectType: TEAM_OBJECT_TYPE,
          role: AUTHOR_TEAM.role,
          displayName: AUTHOR_TEAM.displayName,
        })

        await Team.addMember(authorTeam.id, userId, { trx })
      }

      return insertedResource
    } catch (e) {
      throw new Error(e)
    }
  }

  static async getResource(id, options = {}) {
    const { trx } = options
    return ResourceTree.query(trx).findById(id)
  }

  static async getParentFolderByIdentifier(identifier, options = {}) {
    const { trx } = options
    // logger.info(`Getting parent folder of ${identifier}`)
    const doc = await Doc.query(trx).findOne({ identifier })
    const { id: docId } = doc || {}
    // logger.info(`Doc found: ${doc?.id}`)
    if (!docId) return null
    const parentFolder = await this.query(trx).findOne({ docId })

    return parentFolder
  }

  static async moveResource({ id, newParentId, userId }, options = {}) {
    const { trx } = options
    const resource = await this.getResource(id, { trx })

    if (!resource) {
      throw new Error('Resource not found')
    }

    const source = await this.getResource(resource.parentId, { trx })
    const destination = await this.getResource(newParentId, { trx })

    if (!['dir', 'system'].includes(destination.resourceType)) {
      // logger.info('New parent is not a folder')
      return this.openFolder(source.id, 'id', userId)
    }

    source.children = source.children.filter(child => child.id !== id)
    destination.children.push(id)
    const safeName = await this.getSafeName(
      {
        title: resource.title,
        id,
        parentId: newParentId,
      },
      { trx },
    )
    await this.query(trx).patch({ title: safeName }).findById(id)

    await this.query(trx).patch({ parentId: newParentId }).findById(id)
    // logger.info(`Resource ${id} moved to ${newParentId}`)
    await this.query(trx)
      .patch({ children: source.children })
      .findById(source.id)
    await this.query(trx)
      .patch({ children: destination.children })
      .findById(destination.id)
    return source.id
  }

  static async getSafeName({ title, id, parentId }, options = {}) {
    const { trx } = options
    const existingResource = await this.getResource(id, { trx })
    const parent = await this.getResource(
      parentId || existingResource.parentId,
      { trx },
    )
    const siblingNodes = await this.getChildren(parent.id, { trx })
    const existingTitles = siblingNodes
      .filter(ch => ch.id !== id)
      .map(child => child.title)
    let safeTitle = title
    let i = 1
    while (existingTitles.includes(safeTitle)) {
      safeTitle = `${title} (${i})`
      i++
    }
    return safeTitle
  }

  static async getChildren(parentId, options = {}) {
    const { trx } = options
    const children = await this.query(trx)
      .where({ parentId })
      .orderByRaw(resourceTypeRankingSQL)
      .orderBy('created', 'desc')

    const getChildDocs = async children => {
      return Promise.all(
        children.map(async child => {
          if (!child.docId) return child
          const doc = await Doc.query(trx).findOne({ id: child.docId })
          return {
            ...child,
            doc: doc ? { id: doc.id, identifier: doc.identifier } : null,
          }
        }),
      )
    }
    return getChildDocs(children)
  }

  static async checkNameAvailability({ parentId, title }, options = {}) {
    const { trx } = options
    const existingResource = await ResourceTree.query(trx)
      .findOne({ parentId })
      .where({ title })
    return !existingResource
  }

  static async openFolder(id, resourceType, userId) {
    // logger.info(`Opening ${resourceType} from ${id} for user ${userId}`)

    return useTransaction(async trx => {
      // Acquire a row-level lock on the user's root folder
      let rootFolder = await ResourceTree.findRootFolderOfUser(userId, {
        trx,
        forUpdate: true,
      })

      // If no root folder is found, create one
      if (!rootFolder) {
        rootFolder = await ResourceTree.createUserRootFolder(userId, { trx })
        // logger.info(`Created root folder ${rootFolder.id} for user ${userId}`)
        return {
          path: [{ title: rootFolder.title, id: rootFolder.id }],
          currentFolder: { ...rootFolder, children: [] },
          requestAccessTo: null,
        }
      }

      // logger.info(`Found root folder ${rootFolder.id} for user ${userId}`)

      const isDoc = resourceType === 'doc'
      const method = isDoc ? 'getParentFolderByIdentifier' : 'getResource'

      let currentResource = id && (await ResourceTree[method](id, { trx }))

      // logger.info(`Current resource: ${currentResource?.id}`)
      let requestAccessTo = null

      const notOwner = currentResource && currentResource?.userId !== userId

      if (notOwner) {
        const team = await Team.query(trx)
          .where({
            objectId: currentResource?.id,
            objectType: TEAM_OBJECT_TYPE,
          })
          .first()

        if (team?.id) {
          // logger.info(`Checking if user ${userId} is a member of team ${team.id}`, )
          const isMember = await TeamMember.query(trx)
            .where({ teamId: team.id, userId })
            .first()

          if (!isMember) {
            // logger.info(`Requesting access to ${currentResource?.id}`)
            requestAccessTo = currentResource?.userId
            currentResource = null
          }
        }
      }

      // If no resource found or access denied, use the root folder
      if (!currentResource) {
        currentResource = rootFolder
      }

      // logger.info(`Current resource: ${currentResource?.id}`)

      let folder = currentResource

      if (!['dir', 'system'].includes(currentResource?.resourceType)) {
        folder = currentResource?.parentId
          ? await ResourceTree.query(trx).findById(currentResource?.parentId)
          : rootFolder
      }

      // logger.info(`Folder: ${folder?.id} is a ${folder?.resourceType}`)

      const path = await ResourceTree.buildPath(folder.id, { trx })
      const folderChildren = await ResourceTree.getChildren(folder.id, {
        trx,
      })

      return {
        path,
        currentFolder: { ...folder, children: folderChildren },
        requestAccessTo,
      }
    })
  }

  static async buildPath(id, options = {}) {
    const { trx } = options
    const path = []
    let current = await ResourceTree.query(trx).findById(id)

    while (current) {
      const { title, id } = current ?? {}
      path.unshift({ title, id })
      current = await ResourceTree.query(trx).findById(current.parentId)
    }

    return path
  }

  static async createSystemFolders(titles, rootFolder, userId, options = {}) {
    if (!Array.isArray(titles)) {
      throw new Error('Titles should be an array')
    }
    if (!rootFolder) {
      throw new Error('Root folder not found')
    }
    if (!userId) {
      throw new Error('User not found')
    }

    const { trx } = options
    return Promise.all(
      titles.map(async title => {
        await ResourceTree.createResource(
          {
            title,
            resourceType: 'system',
            parentId: rootFolder.id,
            userId,
          },
          { trx },
        )
        logger.info(`Created system folder "${title}" for user ${userId}`)
      }),
    )
  }

  static async createUserRootFolder(userId, options = {}) {
    const { trx } = options
    // logger.info(`Creating root folder for user ${userId}`)
    const rootFolder = await ResourceTree.createResource(
      {
        title: 'Root',
        resourceType: 'root',
        parentId: null,
        userId,
      },
      { trx },
    )
    await ResourceTree.createSystemFolders(SYSTEM_FOLDERS, rootFolder, userId, {
      trx,
    })

    return rootFolder
  }

  static async findRootFolderOfUser(userId, options = {}) {
    const { trx, forUpdate } = options
    if (!userId) {
      throw new Error('User not found')
    }

    // logger.info(`Finding root folder for user ${userId}`)
    const query = ResourceTree.query(trx)
      .where({
        userId,
        resourceType: 'root',
        title: 'Root',
      })
      .first()

    if (forUpdate) {
      query.forUpdate()
    }

    const rootFolder = await query

    // logger.info(`Found root folder ${rootFolder?.id} for user ${userId}`)
    return rootFolder || null
  }

  static async findSystemFolder(title, userId, options = {}) {
    const { trx } = options
    if (!userId) {
      throw new Error('User not found')
    }
    const systemFolder = await ResourceTree.query(trx).where({
      resourceType: 'system',
      title,
      userId,
    })

    return systemFolder
  }

  static async createNewFolderResource(
    { id = null, title = 'untitled', userId },
    options = {},
  ) {
    const { trx } = options
    const parent = await ResourceTree.getParentOrRoot(id, userId, { trx })

    if (parent) {
      const safeTitle = await ResourceTree.getSafeName(
        {
          title,
          id,
          parentId: parent.id,
        },
        { trx },
      )
      const insertedResource = await ResourceTree.createResource(
        {
          title: safeTitle,
          resourceType: 'dir',
          parentId: parent.id,
          userId,
        },
        { trx },
      )

      parent.children.unshift(insertedResource.id)
      await ResourceTree.query(trx)
        .patch({ children: parent.children })
        .findOne({ id: parent.id })

      return insertedResource
    }

    return null
  }

  static async getParentOrRoot(id, userId, options = {}) {
    const { trx } = options
    if (id) {
      const resource = await this.getResource(id, { trx })
      if (resource) {
        return resource
      }
    }

    let rootFolder = await this.findRootFolderOfUser(userId, { trx })
    if (!rootFolder) {
      rootFolder = await this.createUserRootFolder(userId, { trx })
    }

    return rootFolder
  }

  static async createNewDocumentResource(
    {
      id = null,
      title = 'untitled',
      extension = 'doc',
      identifier,
      delta,
      state,
      userId,
    },
    options = {},
  ) {
    const { trx } = options
    const parent = await ResourceTree.getParentOrRoot(id, userId, { trx })

    try {
      const safeTitle = await ResourceTree.getSafeName(
        {
          title,
          id,
          parentId: parent.id,
        },
        { trx },
      )

      const insertedResource = await ResourceTree.createResource(
        {
          title: safeTitle,
          resourceType: 'doc',
          extension,
          parentId: parent.id,
          userId,
        },
        { trx },
      )

      parent.children.unshift(insertedResource.id)
      await ResourceTree.query(trx)
        .patch({ children: parent.children })
        .findOne({ id: parent.id })

      const doc = await Doc.createDoc({ delta, state, identifier, userId })

      const resourceTree = await ResourceTree.query(trx)
        .patch({ docId: doc.id })
        .findOne({ id: insertedResource.id })
        .returning('*')

      return resourceTree
    } catch (error) {
      // logger.info(error)
    }
  }

  static async deleteFolderAndChildren(id, userId, options = {}) {
    const { trx } = options
    const resource = await ResourceTree.query(trx).findById(id)
    if (!resource) {
      throw new Error('Folder not found')
    }

    const docIds = []

    const collectIds = async (nodeId, ids = []) => {
      const node = await ResourceTree.query(trx).findById(nodeId)
      ids.push(nodeId)
      if (node?.resourceType === 'dir') {
        await Promise.all(
          node.children.map(childId => collectIds(childId, ids)),
        )
      } else if (node?.resourceType === 'doc') {
        docIds.push(node.docId)
      }
      return ids
    }

    const ids = await collectIds(id)
    const isOwner = resource.userId === userId

    if (!isOwner) {
      throw new Error('Access denied')
    } else {
      await Team.query(trx)
        .whereIn('objectId', [...ids, ...docIds])
        .delete()
      await ResourceTree.query(trx).delete().whereIn('id', ids)
      docIds.length && (await Doc.query(trx).delete().whereIn('id', docIds))
    }

    // logger.info(`Resource ${id} deleted successfully`)
    return id
  }

  static async bulkDeleteResources(ids, options = {}) {
    const { trx } = options
    return Promise.all(ids.map(id => this.deleteFolderAndChildren(id, { trx })))
  }

  static async moveResources({ ids, newParentId }, options = {}) {
    const { trx } = options
    return Promise.all(
      ids.map(id => this.moveResource({ id, newParentId }, { trx })),
    )
  }

  static async getDocPath(docId, options = {}) {
    const { trx } = options
    const resourceTree = await ResourceTree.query(trx).findOne({ docId })
    const path = []

    let current = resourceTree
    while (current) {
      path.unshift(current.id)
      current = await ResourceTree.query(trx).findById(current.parentId)
    }

    return path
  }

  static async shareResource(resourceId, userId, options = {}) {
    const { trx } = options
    try {
      const resource = await ResourceTree.query(trx).findById(resourceId)
      if (!resource) {
        throw new Error('Resource not found')
      }

      const team = await Team.query(trx)
        .where({ objectId: resourceId, objectType: TEAM_OBJECT_TYPE })
        .first()

      if (!team) {
        throw new Error('Team not found')
      }

      await Team.addMember(team.id, userId, { trx })
      return resource
    } catch (e) {
      // logger.info(e)
    }
  }

  static async unshareResource(resourceId, userId, options = {}) {
    const { trx } = options
    try {
      const resource = await ResourceTree.query(trx).findById(resourceId)
      if (!resource) {
        throw new Error('Resource not found')
      }

      const team = await Team.query(trx)
        .where({ objectId: resourceId, objectType: TEAM_OBJECT_TYPE })
        .first()

      if (!team) {
        throw new Error('Team not found')
      }

      await Team.removeMember(team.id, userId, { trx })
      return resource
    } catch (e) {
      // logger.info(e)
    }
  }

  static async addToFavorites(resourceId, userId, options = {}) {
    const { trx } = options
    try {
      const resource = await ResourceTree.query(trx).findById(resourceId)
      if (!resource) {
        throw new Error('Resource not found')
      }

      const favoritesFolder = await ResourceTree.findSystemFolder(
        'Favorites',
        userId,
        { trx },
      )

      if (!favoritesFolder) {
        throw new Error('Favorites folder not found')
      }

      favoritesFolder[0].children.unshift(resourceId)
      await ResourceTree.query(trx)
        .patch({ children: favoritesFolder.children })
        .findById(favoritesFolder.id)

      return resource
    } catch (e) {
      // logger.info(e)
    }
  }

  static async pasteResources({ ids, newParentId, action }, options = {}) {
    const { trx } = options
    return Promise.all(
      ids.map(id => {
        if (action === 'copy') {
          return this.copyResource({ id, newParentId }, { trx })
        }
        return this.moveResource({ id, newParentId }, { trx })
      }),
    )
  }

  static async copyResource({ id, newParentId }, options = {}) {
    const { trx } = options
    const resource = await this.getResource(id, { trx })

    if (!resource) {
      throw new Error('Resource not found')
    }

    const parent = await this.getResource(newParentId, { trx })
    const newResource = await this.createResource(
      {
        title: resource.title,
        resourceType: resource.resourceType,
        parentId: newParentId,
        userId: resource.userId,
        extension: resource.extension,
      },
      { trx },
    )

    if (resource.resourceType === 'doc') {
      const identifier = createIdentifier()
      const doc = await Doc.query(trx).findOne({ id: resource.docId })
      const newDoc = await Doc.createDoc({
        delta: doc.delta,
        state: doc.state,
        identifier,
        userId: doc.userId,
      })

      await this.query(trx).patch({ docId: newDoc.id }).findById(newResource.id)

      return newResource
    }

    parent.children.push(newResource.id)

    await this.query(trx)
      .patch({ children: parent.children })
      .findById(parent.id)

    return newResource
  }
}

module.exports = ResourceTree