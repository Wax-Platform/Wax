const { DocTreeManager, Doc } = require('../models')
const { Team, TeamMember, logger } = require('@coko/server')
const { v4: uuidv4 } = require('uuid')
const createIdentifier = () => {
  return Array.from(Array(20), () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join('')
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
  logger.info(typeof DocTreeManager.getUserTreeResources)
  const AllFiles = (await DocTreeManager.getUserTreeResources(userId)) || []

  const getAllDocs = await Doc.query().whereIn(
    'id',
    AllFiles.filter(f => f.docId).map(f => f.docId),
  )

  const getChildren = async children => {
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const childItem = AllFiles.find(f => f.id === child)

      const doc = childItem.docId
        ? getAllDocs.find(doc => doc.id === childItem.docId)
        : null

      children[i] = {
        id: childItem.id,
        key: childItem.id,
        title: childItem.title,
        isFolder: childItem.isFolder,
        identifier: doc ? doc.identifier : null,
        children:
          childItem.children.length > 0
            ? await getChildren(childItem.children)
            : [],
      }
    }

    return children
  }

  const rootNodes = folderId
    ? [AllFiles.find(f => f.id === folderId)]
    : AllFiles.filter(f => f.parentId === null)

  for (let i = 0; i < rootNodes.length; i++) {
    const rootNode = rootNodes[i]

    const doc = rootNode.docId
      ? getAllDocs.find(doc => doc.id === rootNode.docId)
      : null

    rootNodes[i] = {
      id: rootNode.id,
      key: rootNode.id,
      title: rootNode.title,
      isFolder: rootNode.isFolder,
      identifier: doc ? doc.identifier : null,
      children: await getChildren(rootNode.children),
    }
  }

  return rootNodes ? rootNodes : null
}

const getDocTree = async (_, { folderId }, ctx) => {
  return JSON.stringify(await DocTreeNested(folderId, ctx.user))
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
    return DocTreeManager.createNewFolderResource({ id, userId: ctx.user })
  } else {
    return DocTreeManager.createNewDocumentResource({
      id,
      identifier: createIdentifier(),
      userId: ctx.user,
    })
  }
}

const deleteResource = async (_, { id }, ctx) => {
  const deleteResourceItem = await DocTreeManager.query().findOne({ id })

  const isUserTheAuthorOfTheDoc = await Doc.isMyDoc(
    deleteResourceItem.docId,
    ctx.user,
  )

  if (isUserTheAuthorOfTheDoc) {
    deleteResourceRecursively(id)

    if (deleteResourceItem.docId) {
      const teams = await Team.query()
        .delete()
        .where({ objectId: id })
        .returning('*')
      await TeamMember.query()
        .delete()
        .whereIn(
          'teamId',
          teams.map(team => team.id),
        )
    }
  } else {
    const team = await Team.query().findOne({
      objectId: deleteResourceItem.docId,
      objectType: 'doc',
      role: 'viewer',
    })

    if (team) {
      await TeamMember.query().delete().where({
        teamId: team.id,
        userId: ctx.user,
      })
    }
  }

  return deleteResourceItem
}

const renameResource = async (_, { id, title }, ctx) => {
  const updatedItem = await DocTreeManager.query()
    .patch({ title })
    .findOne({ id })
    .returning('*')

  return updatedItem
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

  await DocTreeManager.query().patch({ parentId: newParentId }).findOne({ id })

  return DocTreeManager.query()
    .patch({ children: parentNode.children })
    .findOne({ id: newParentId })
    .returning('*')
}

module.exports = {
  updateTreePosition,
  renameResource,
  deleteResource,
  addResource,
  getDocTree,
  getSharedDocTree,
}
