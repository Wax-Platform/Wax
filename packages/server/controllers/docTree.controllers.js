const { logger } = require('@coko/server')
const { DocTreeManager, Doc, Team, TeamMember } = require('@pubsweet/models')
const { v4: uuidv4 } = require('uuid')
const createIdentifier = () => {
  return Array.from(Array(20), () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join('')
}
const getResource = async (_, { id }) => {
  return await DocTreeManager.getResource(id)
}
const getParentFolderByIdentifier = async (_, { identifier }) => {
  return await DocTreeManager.getParentFolderByIdentifier(identifier)
}
const openFolder = async (_, { id, idType = 'id' }, ctx) => {
  return await DocTreeManager.openFolder(id, idType, ctx.user)
}
const deleteResourceRecursively = async id => {
  const deleteResource = await DocTreeManager.query()
    .delete()
    .findOne({ id })
    .returning('*')

  const parent = await DocTreeManager.query().findOne({
    id: deleteResource.parentId,
  })

  const updatedChildren = (parent?.children || []).filter(child => child !== id)

  await DocTreeManager.query()
    .patch({ children: updatedChildren })
    .findOne({ id: deleteResource.parentId })

  if (deleteResource.isFolder) {
    if (deleteResource.children.length > 0) {
      for (let i = 0; i < deleteResource.children.length; i++) {
        await deleteResourceRecursively(deleteResource.children[i])
      }
    }
  } else {
    await Doc.query().findOne({ id: deleteResource.docId }).delete()
  }
}

const DocTreeNested = async (folderId, userId) => {
  try {
    let allFiles = (await DocTreeManager.getUserTreeResources(userId)) || []
    if (allFiles.length === 0) {
      await DocTreeManager.createUserRootFolder(userId)
      allFiles = await DocTreeManager.getUserTreeResources(userId)
    }

    const getAllDocs = await Doc.query().whereIn(
      'id',
      allFiles
        .filter(f => !!f?.docId)
        .map(f => f?.docId)
        .filter(Boolean),
    )
    logger.info('getAllDocs', allFiles)

    const getChildren = children => {
      return children
        .map(childId => {
          const childItem = allFiles.find(f => f.id === childId)
          if (!childItem) return null

          const doc = childItem?.docId
            ? getAllDocs.find(doc => doc.id === childItem?.docId)
            : null

          return {
            id: childItem.id,
            key: childItem.id,
            title: childItem.title,
            isFolder: childItem.isFolder,
            identifier: doc ? doc.identifier : null,
            children:
              childItem.children.length > 0
                ? getChildren(childItem.children)
                : [],
          }
        })
        .filter(child => child !== null)
    }

    const rootFolder = allFiles.find(
      f => f.id === folderId || f.title === 'Root' || !f.parentId,
    )
    logger.info(
      JSON.stringify(
        allFiles.map(f => ({ parentId: f.parentId, name: f.title })),
        null,
        2,
      ),
    )
    if (!rootFolder) {
      throw new Error('Root folder not found')
    }

    return {
      id: rootFolder.id,
      key: rootFolder.id,
      title: rootFolder.title,
      isFolder: rootFolder.isFolder,
      identifier: null,
      children: getChildren(rootFolder.children),
    }
  } catch (error) {
    logger.error('Error in DocTreeNested:', error)
    throw new Error('Failed to retrieve document tree')
  }
}

const getDocTree = async (_, { folderId }, ctx) => {
  try {
    return JSON.stringify(await DocTreeNested(folderId, ctx.user))
  } catch (error) {
    logger.error(error)
  }
}

const getSharedDocTree = async (_, {}, ctx) => {
  const docs = await Doc.getSharedDocs(ctx.user)

  const children = await DocTreeManager.query().whereIn(
    'docId',
    docs.map(doc => doc.id),
  )

  const id = uuidv4()
  return [
    {
      id,
      key: id,
      title: 'Shared Documents',
      isRoot: true,
      children,
      isFolder: true,
      docId: null,
    },
  ]
}

const addResource = async (_, { id, isFolder }, ctx) => {
  if (isFolder) {
    const newFolder = await DocTreeManager.createNewFolderResource({
      id,
      userId: ctx.user,
    })
    const folderAndPath = await openFolder(
      null,
      { id: newFolder.parentId },
      ctx,
    )
    return {
      ...folderAndPath,
      newResource: { id: newFolder?.id },
    }
  } else {
    const identifier = createIdentifier()
    const newResource = await DocTreeManager.createNewDocumentResource({
      id,
      identifier,
      userId: ctx.user,
    })
    const folderAndPath = await openFolder(
      null,
      { id: newResource.parentId },
      ctx,
    )
    return {
      ...folderAndPath,
      newResource: { identifier, id: newResource?.id },
    }
  }
}

const deleteResource = async (_, { id }, ctx) => {
  const resource = await DocTreeManager.getResource(id)
  const parentId = resource.parentId
  await DocTreeManager.deleteFolderAndChildren(id)
  return openFolder(null, { id: parentId, idType: 'id' }, ctx)
}

const renameResource = async (_, { id, title }, ctx) => {
  const getSafeName = await DocTreeManager.getSafeName({ id, title })

  const updatedItem = await DocTreeManager.query()
    .patch({ title: getSafeName })
    .findOne({ id })
    .returning('*')

  const folderAndPath = await openFolder(
    null,
    { id: updatedItem.parentId },
    ctx,
  )

  return {
    ...folderAndPath,
    newResource: { title, id },
  }
}

const moveResource = async (_, { id, newParentId }, ctx) => {
  return DocTreeManager.moveResource({
    id,
    newParentId,
    userId: ctx.user,
  })
}

const updateTreePosition = async (_, { id, newParentId, newPosition }, ctx) => {
  const allNodes = await DocTreeManager.query()

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < allNodes.length; i++) {
    if (allNodes[i].children.includes(id)) {
      const { id: nodeId, children } = allNodes[i]
      const updatedChildren = children.filter(child => child !== id)

      // eslint-disable-next-line no-await-in-loop
      await DocTreeManager.query()
        .patch({ children: updatedChildren })
        .findOne({ id: nodeId })
    }
  }

  const parentNode = await DocTreeManager.query().findOne({ id: newParentId })

  parentNode.children.splice(newPosition, 0, id)

  const target = await DocTreeManager.query()
    .patch({ parentId: newParentId })
    .findOne({ id })

  await DocTreeManager.query()
    .patch({ children: parentNode.children })
    .findOne({ id: newParentId })
    .returning('*')
  return openFolder(null, { id: target.parentId, idType: 'id' }, ctx)
}

module.exports = {
  updateTreePosition,
  renameResource,
  deleteResource,
  addResource,
  getDocTree,
  getSharedDocTree,
  openFolder,
  getParentFolderByIdentifier,
  getResource,
  moveResource,
}
