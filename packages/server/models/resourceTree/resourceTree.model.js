const {
  modelTypes,
  BaseModel,
  logger,
  useTransaction,
} = require('@coko/server')
const { Team, TeamMember, User } = require('@pubsweet/models')
const { idNullable, stringNullable, arrayOfIds, string } = modelTypes
const config = require('config')

const AUTHOR_TEAM = config.teams.nonGlobal.author
const RESOURCE_TYPES = ['doc', 'dir', 'root', 'sys', 'template', 'snippet']
const EXTENSIONS = ['doc', 'img', 'snip', 'css', 'template', 'book']
const TEAM_OBJECT_TYPE = 'resource'
const TYPES_TO_EXCLUDE_FROM_TEAM = ['sys', 'root']
const SYSTEM_FOLDERS = [
  'Templates',
  'Images',
  'Shared',
  'Favorites',
  'Documents',
  'Books',
]

const createIdentifier = () => {
  return Array.from(Array(20), () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join('')
}

const resourceTypeRankingSQL = `
    CASE 
      WHEN resource_type = 'sys' THEN 1
      WHEN resource_type = 'dir' THEN 2
      WHEN resource_type = 'doc' THEN 3
      ELSE 4
    END
  `
const orderByIndex = childIds => `
    CASE id
    ${childIds.map((id, index) => `WHEN '${id}' THEN ${index}`).join(' ')}
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
        docId: idNullable,
        templateId: idNullable,
        resourceType: { type: string },
        extension: { type: string, enum: EXTENSIONS, nullable: true },
        title: stringNullable,
        parentId: idNullable,
        children: arrayOfIds,
      },
    }
  }

  static getSystemFoldersIds(userId, options = {}) {
    const { trx } = options
    return this.query(trx).where({ userId, resourceType: 'sys' }).select('id')
  }

  static async createResource(
    { title, resourceType, parentId, userId, extension, templateId = null },
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

      logger.info('user exist')

      const insertedResource = await ResourceTree.query(trx).insert({
        title,
        resourceType,
        parentId,
        userId,
        extension,
        templateId,
      })

      logger.info('resource created')

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
      logger.error(e)
    }
  }

  static async getResource(id, options = {}) {
    const { trx } = options
    return ResourceTree.query(trx).findById(id)
  }

  static async getParentFolderByIdentifier(identifier, options = {}) {
    const Doc = require('../doc/doc.model')

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

    if (!['dir', 'sys'].includes(destination.resourceType)) {
      logger.info('New parent is not a folder')
      return this.openFolder(source.id, 'id', userId)
    }

    source.children = source.children.filter(child => child !== id)
    destination.children.unshift(id)

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
    const siblingNodes = await this.getChildren(parent.children, { trx })
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

  static async getChildren(childIds, options = {}) {
    const { trx } = options
    if (childIds.length === 0) return []
    // TODO pass order to query
    const children = await this.query(trx)
      .whereIn('id', childIds)
      .orderByRaw(orderByIndex(childIds))
    // .orderByRaw(resourceTypeRankingSQL)
    // .orderBy('created', 'desc')

    return children
  }

  static async checkNameAvailability({ parentId, title }, options = {}) {
    const { trx } = options
    const existingResource = await ResourceTree.query(trx)
      .findOne({ parentId })
      .where({ title })
    return !existingResource
  }

  static async openFolder(id, resourceType, userId, fallbackFolderTitle = '') {
    logger.info(
      `Opening \x1b[33m${resourceType}\x1b[0m ${id} for user ${userId}`,
    )

    return useTransaction(
      async trx => {
        let rootFolder = await ResourceTree.findRootFolderOfUser(userId, {
          trx,
          forUpdate: true,
        })

        let fallbackFolder = rootFolder
        if (!rootFolder) {
          rootFolder = await ResourceTree.createUserRootFolder(userId, { trx })
          // logger.info(`Created root folder ${rootFolder.id} for user ${userId}`)

          if (fallbackFolderTitle) {
            fallbackFolder = await ResourceTree.findSystemFolder(
              fallbackFolderTitle,
              userId,
              {
                trx,
              },
            )
          }

          fallbackFolder = fallbackFolder || rootFolder

          return {
            path: [{ title: fallbackFolder.title, id: fallbackFolder.id }],
            currentFolder: { ...fallbackFolder, children: [] },
            requestAccessTo: null,
          }
        } else {
          if (fallbackFolderTitle) {
            fallbackFolder = await ResourceTree.findSystemFolder(
              fallbackFolderTitle,
              userId,
              {
                trx,
              },
            )

            fallbackFolder = fallbackFolder || rootFolder
          }
        }

        const isDoc = resourceType === 'doc'
        const method = isDoc ? 'getParentFolderByIdentifier' : 'getResource'

        let currentResource = id && (await ResourceTree[method](id, { trx }))
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
            const isMember = await TeamMember.query(trx)
              .where({ teamId: team.id, userId })
              .first()

            if (!isMember) {
              requestAccessTo = currentResource?.userId
              currentResource = null
            }
          }
        }

        // If no resource found or access denied, use the fallback folder
        if (!currentResource) {
          if (fallbackFolderTitle) {
            currentResource = await ResourceTree.findSystemFolder(
              fallbackFolderTitle,
              userId,
              { trx },
            )
          }
          if (!currentResource) {
            currentResource = fallbackFolder
          }
        }

        let folder = currentResource

        if (!['dir', 'sys'].includes(currentResource?.resourceType)) {
          folder = currentResource?.parentId
            ? await ResourceTree.query(trx).findById(currentResource?.parentId)
            : fallbackFolder
        }

        const path = await ResourceTree.buildPath(folder.id, { trx })

        return {
          path,
          currentFolder: { ...folder },
          requestAccessTo,
        }
      },
      { passedTrxOnly: true },
    )
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
    let root = rootFolder
    if (!Array.isArray(titles)) {
      throw new Error('Titles should be an array')
    }
    if (!rootFolder) {
      root = await ResourceTree.createUserRootFolder(userId, options)
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
            resourceType: 'sys',
            parentId: root.id,
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

    if (!(await User.query(trx).findById(userId))) {
      return null
    }

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

    const systemFolder = await ResourceTree.findOne(
      {
        resourceType: 'sys',
        title,
        userId,
      },
      { trx },
    )

    logger.info(JSON.stringify(systemFolder, null, 2))

    return systemFolder
  }

  /* A 'dir' may have(or not) a 'extension', used to determine what kind of resources you can create inside of it */
  static async createNewFolderResource(
    { id = null, title = 'untitled', userId, extension },
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

      return insertedResource
    }

    return null
  }

  static async getParentOrRoot(id, userId, options = {}, fallback) {
    const { trx } = options
    if (id) {
      const resource = await this.getResource(id, { trx })
      if (resource) {
        return resource
      }
    }

    let rootFolder = fallback
      ? await this.query(trx).findOne(fallback)
      : await this.findRootFolderOfUser(userId, { trx })

    if (!rootFolder) {
      rootFolder = await this.createUserRootFolder(userId, { trx })
    }

    return rootFolder
  }

  static async createNewDocumentResource(
    {
      id = null, // the parentId
      title = 'untitled',
      extension = 'doc',
      resourceType = 'doc',
      identifier,
      // delta,
      // state,
      userId,
      templateProps = '{}',
      ...rest
    },
    options = {},
  ) {
    const { trx } = options

    return useTransaction(
      async tr => {
        try {
          const isTemplate = resourceType === 'template'
          const isSnippet = resourceType === 'snippet'
          const isTemplateResource = isTemplate || isSnippet
          const fallback = isTemplateResource && {
            userId,
            resourceType: 'sys',
            title: isSnippet ? 'My Snippets' : 'My Templates',
          }

          const parent = await ResourceTree.getParentOrRoot(
            id,
            userId,
            { tr },
            fallback,
          )

          const safeTitle = await ResourceTree.getSafeName(
            {
              title,
              id,
              parentId: parent.id,
            },
            { tr },
          )

          logger.info(`extension: ${extension}`)

          const insertedResource = await ResourceTree.createResource(
            {
              title: safeTitle,
              resourceType,
              extension: extension || 'doc',
              parentId: parent.id,
              userId,
              ...rest,
            },
            { tr },
          )

          parent.children.unshift(insertedResource.id)
          await ResourceTree.query(tr)
            .patch({ children: parent.children })
            .findOne({ id: parent.id })

          if (resourceType === 'doc') {
            const Doc = require('../doc/doc.model')
            const doc = await Doc.createDoc({
              // delta,
              // state,
              identifier,
              userId,
            })

            const resourceTree = await ResourceTree.query(tr)
              .patch({ docId: doc.id })
              .findOne({ id: insertedResource.id })
              .returning('*')

            return resourceTree
          }

          if (isTemplateResource) {
            logger.info('Creating template resource')
            const Template = require('../template/template.model')
            const props = JSON.parse(templateProps)
            const meta = JSON.parse(props?.meta || '{}')

            let rawCss = props.rawCss || ''

            if (
              Object.keys(meta).includes('className') &&
              safeTitle !== title &&
              resourceType === 'snippet'
            ) {
              let newClassName = safeTitle
                .toLowerCase()
                .replace('(', '-')
                .replace(')', '')
              newClassName = newClassName.replaceAll(' ', '-')
              meta.classBody = props.rawCss.replaceAll(
                meta.className,
                newClassName,
              )
              rawCss = props.rawCss.replaceAll(meta.className, newClassName)

              meta.className = newClassName
            }

            const template = await Template.query(tr).insert({
              ...props,
              rawCss,
              meta,
              userId,
              displayName: safeTitle,
            })

            const resourceTree = await ResourceTree.query(tr)
              .patch({ templateId: template.id })
              .findOne({ id: insertedResource.id })
              .returning('*')

            return resourceTree
          }

          return insertedResource.id
        } catch (error) {
          logger.info(error)
        }
      },
      { trx },
    )
  }

  static async deleteFolderAndChildren(id, userId, options = {}) {
    const Doc = require('../doc/doc.model')
    const Template = require('../template/template.model')

    const { trx } = options
    const resource = await ResourceTree.query(trx).findById(id)
    if (!resource) {
      throw new Error('Folder not found')
    }

    const docIds = []
    const resourceTemplateIds = []

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

      if (node?.templateId) {
        resourceTemplateIds.push(node.templateId)
      }

      return [...new Set(ids)]
    }

    const ids = await collectIds(id)
    const isOwner = resource.userId === userId

    if (!isOwner) {
      throw new Error('Access denied')
    } else {
      await Team.query(trx)
        .whereIn('objectId', [...ids, ...docIds])
        .delete()

      if (resourceTemplateIds.length) {
        // Delete resources in resource_tree that reference the templates
        await ResourceTree.query(trx)
          .delete()
          .whereIn('templateId', resourceTemplateIds)
      }

      if (docIds.length) {
        await ResourceTree.query(trx).delete().whereIn('docId', docIds)
      }
      if (docIds.length) {
        await Doc.query(trx).delete().whereIn('id', docIds)
      }
      await ResourceTree.query(trx).delete().whereIn('id', ids)

      // Now delete the templates
      if (resourceTemplateIds.length) {
        await Template.query(trx).delete().whereIn('id', resourceTemplateIds)
      }
    }
  }

  static async bulkDeleteResources(ids, options = {}) {
    const { trx } = options
    return Promise.all(ids.map(id => this.deleteFolderAndChildren(id, { trx })))
  }

  static async moveResources({ ids, newParentId }, options = {}) {
    const { trx } = options
    return Promise.all(
      ids.map(async id => this.moveResource({ id, newParentId }, { trx })),
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
      const resource = await ResourceTree.query(trx).findOne({
        id: resourceId,
        userId,
      })
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

      favoritesFolder.children.unshift(resourceId)
      await ResourceTree.query(trx)
        .patch({ children: favoritesFolder.children })
        .findById(favoritesFolder.id)

      return resource
    } catch (e) {
      logger.info(e)
    }
  }

  static async pasteResources({
    ids,
    newParentId,
    action,
    userId,
    options = {},
  }) {
    const { trx } = options
    logger.info(`Pasting resources ${ids} to ${newParentId}`)
    return Promise.all(
      ids.map(async id => {
        try {
          logger.info(`Processing resource ${id}`)
          if (action === 'copy') {
            const result = await ResourceTree.copyResource(
              { id, newParentId },
              { trx },
            )
            logger.info(`Copied resource ${id}`)
            return result
          }
          const result = await ResourceTree.moveResource(
            { id, newParentId, userId },
            { trx },
          )
          logger.info(`Moved resource ${id}`)
          return result
        } catch (error) {
          logger.error(`Error processing resource ${id}: ${error.message}`)
          throw error
        }
      }),
    )
  }

  static async copyResource({ id, newParentId }, options = {}) {
    const Doc = require('../doc/doc.model')
    const { trx } = options
    const resource = await this.getResource(id, { trx })

    if (!resource) {
      throw new Error('Resource not found')
    }

    const parent = await this.getResource(newParentId, { trx })
    const newResource = await this.createResource(
      {
        title: `${resource.title} (copy)`,
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
        userId: resource.userId,
      })

      await this.query(trx).patch({ docId: newDoc.id }).findById(newResource.id)
    }

    if (
      resource.resourceType === 'template' ||
      resource.resourceType === 'snippet'
    ) {
      const Template = require('../template/template.model')
      const template = await Template.query(trx).findOne({
        id: resource.templateId,
      })
      const newTemplate = await Template.query(trx).insert({
        ...template,
        userId: resource.userId,
        displayName: `${template.displayName} (copy)`,
      })

      await this.query(trx)
        .patch({ templateId: newTemplate.id })
        .findById(newResource.id)
    }

    if (resource.resourceType === 'dir') {
      const children = await this.getChildren(resource.children, { trx })
      const childrenIds = children.map(child => child.id)

      await Promise.all(
        childrenIds.map(childId =>
          this.copyResource(
            { id: childId, newParentId: newResource.id },
            { trx },
          ),
        ),
      )
    }

    parent.children.push(newResource.id)

    await this.query(trx)
      .patch({ children: parent.children })
      .findById(parent.id)

    return newResource
  }

  static async reorderChildren(parentId, newChildrenIds, options = {}) {
    const { trx } = options

    const parentResource = await this.query(trx).findById(parentId)
    if (!parentResource) {
      throw new Error('Parent resource not found')
    }
    logger.info(`old children: ${parentResource.children}`)
    await this.query(trx).patch({ children: newChildrenIds }).findById(parentId)

    return true
  }
}

module.exports = ResourceTree
