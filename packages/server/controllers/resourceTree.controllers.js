const { ResourceTree } = require('@pubsweet/models')

const createIdentifier = () => {
  return Array.from(Array(20), () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join('')
}

const openFolder = async (_, { id, resourceType = 'dir' }, ctx) => {
  return ResourceTree.openFolder(id, resourceType, ctx.user)
}

const addResource = async (_, { id, resourceType }, ctx) => {
  if (resourceType === 'dir') {
    const newFolder = await ResourceTree.createNewFolderResource({
      id,
      userId: ctx.user,
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
      userId: ctx.user,
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
  const resource = await ResourceTree.getResource(id)
  const parentId = resource.parentId
  await ResourceTree.deleteFolderAndChildren(id, ctx.user)
  return { folderId: parentId }
}

const renameResource = async (_, { id, title }, ctx) => {
  const getSafeName = await ResourceTree.getSafeName({ id, title })

  const updatedItem = await ResourceTree.query()
    .patch({ title: getSafeName })
    .findOne({ id })
    .returning('*')

  return { folderId: updatedItem.parentId }
}

const moveResource = async (_, { id, newParentId }, ctx) => {
  await ResourceTree.moveResource({
    id,
    newParentId,
    userId: ctx.user,
  })
  return { folderId: id }
}

module.exports = {
  renameResource,
  deleteResource,
  addResource,
  openFolder,
  moveResource,
}
