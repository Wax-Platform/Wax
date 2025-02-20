const { logger, useTransaction } = require('@coko/server')

const createIdentifier = () => {
  return Array.from(Array(20), () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join('')
}

const openFolder = async (_, { id, resourceType = 'dir' }, ctx) => {
  const ResourceTree = require('../models/resourceTree/resourceTree.model')
  return ResourceTree.openFolder(id, resourceType, ctx.user)
}

const addResource = async (
  _,
  { id, resourceType, extension, templateProps, title, base64 },
  ctx,
) => {
  const ResourceTree = require('../models/resourceTree/resourceTree.model')
  logger.info(`creating`, { id, resourceType, extension })
  if (resourceType === 'dir') {
    const newFolder = await ResourceTree.createNewFolderResource({
      title,
      id,
      userId: ctx.user,
      extension,
    })

    return {
      id: newFolder.id,
      title: newFolder.title,
      parentId: newFolder.parentId,
    }
  } else {
    const identifier = createIdentifier()
    const newResource = await ResourceTree.createNewDocumentResource({
      id,
      identifier,
      templateProps,
      resourceType,
      extension,
      title,
      userId: ctx.user,
      base64,
    })

    return {
      id: newResource.id,
      identifier,
      title: newResource.title,
      parentId: newResource.parentId,
    }
  }
}

const deleteResource = async (_, { id }, ctx) => {
  const ResourceTree = require('../models/resourceTree/resourceTree.model')
  const resource = await ResourceTree.getResource(id)
  const parentId = resource.parentId
  await ResourceTree.deleteFolderAndChildren(id, ctx.user)
  return { folderId: parentId }
}

const renameResource = async (_, { id, title }, ctx) => {
  const ResourceTree = require('../models/resourceTree/resourceTree.model')
  const getSafeName = await ResourceTree.getSafeName({ id, title })

  const updatedItem = await ResourceTree.query()
    .patch({ title: getSafeName })
    .findOne({ id })
    .returning('*')

  return { folderId: updatedItem.parentId }
}

const moveResource = async (_, { id, newParentId }, ctx) => {
  const ResourceTree = require('../models/resourceTree/resourceTree.model')
  await ResourceTree.moveResource({
    id,
    newParentId,
    userId: ctx.user,
  })
  return { folderId: id }
}

const shareResource = async (_, { resourceId, userId }, ctx) => {
  const ResourceTree = require('../models/resourceTree/resourceTree.model')
  const resource = await ResourceTree.shareResource(
    resourceId,
    userId,
    ctx.user,
  )
  return resource
}

const unshareResource = async (_, { resourceId, userId }, ctx) => {
  const ResourceTree = require('../models/resourceTree/resourceTree.model')
  const resource = await ResourceTree.unshareResource(
    resourceId,
    userId,
    ctx.user,
  )
  return resource
}

const addToFavorites = async (_, { resourceId }, ctx) => {
  const ResourceTree = require('../models/resourceTree/resourceTree.model')
  const resource = await ResourceTree.addToFavorites(resourceId, ctx.user)
  return resource
}

const pasteResources = async (_, { parentId, resourceIds, action }, ctx) => {
  const ResourceTree = require('../models/resourceTree/resourceTree.model')
  return useTransaction(async trx => {
    try {
      await ResourceTree.pasteResources({
        newParentId: parentId,
        ids: resourceIds,
        action,
        userId: ctx.user,
        options: { trx },
      })
      return true
    } catch (error) {
      logger.error('Error in pasteResources', error)
      return false
    }
  })
}

const reorderChildren = async (_, { parentId, newChildrenIds }, ctx) => {
  const ResourceTree = require('../models/resourceTree/resourceTree.model')
  await ResourceTree.reorderChildren(parentId, newChildrenIds)
  return true
}

module.exports = {
  renameResource,
  deleteResource,
  addResource,
  openFolder,
  moveResource,
  shareResource,
  unshareResource,
  addToFavorites,
  pasteResources,
  reorderChildren,
}
