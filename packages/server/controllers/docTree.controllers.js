const {
  DocTreeManager,
  BookComponent,
  Team,
  TeamMember,
} = require('@pubsweet/models')

const { uuid: uuidv4 } = require('@coko/server')

const {
  getBookComponent,
  deleteBookComponent,
} = require('./bookComponent.controller')

const BookComponentTranslation = require('../models/bookComponentTranslation/bookComponentTranslation.model')

const deleteResourceRecursively = async (id, ctx) => {
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
      /* eslint-disable-next-line no-plusplus */
      for (let i = 0; i < deleteResource.children.length; i++) {
        /* eslint-disable-next-line no-await-in-loop */
        await deleteResourceRecursively(deleteResource.children[i], ctx)
      }
    }
  } else {
    const bookComponent = await getBookComponent(deleteResource.bookComponentId)

    if (!bookComponent) {
      throw new Error(`book component with id ${id} does not exists`)
    }

    const deletedBookComponent = await deleteBookComponent(bookComponent)

    if (deletedBookComponent) {
      const team = await Team.query().findOne({
        objectId: deletedBookComponent.id,
        objectType: 'bookComponent',
        role: 'owner',
      })

      if (team) {
        await TeamMember.query().delete().where({
          teamId: team.id,
          userId: ctx.user,
        })
      }

      const teamViewer = await Team.query().findOne({
        objectId: deletedBookComponent.id,
        objectType: 'bookComponent',
        role: 'viewer',
      })

      if (teamViewer) {
        await TeamMember.query().delete().where({
          teamId: teamViewer.id,
          userId: ctx.user,
        })
      }
    }
  }
}

const DocTreeNested = async (folderId, userId) => {
  const AllFiles = (await DocTreeManager.getUserTreeResources(userId)) || []

  const getAllDocs = await BookComponent.query().whereIn(
    'id',
    AllFiles.filter(f => f.bookComponentId).map(f => f.bookComponentId),
  )

  const getChildren = async children => {
    /* eslint-disable-next-line no-plusplus */
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const childItem = AllFiles.find(f => f.id === child)

      const doc = childItem.bookComponentId
        ? /* eslint-disable-next-line no-shadow */
          getAllDocs.find(doc => doc.id === childItem.bookComponentId)
        : null

      /* eslint-disable-next-line no-param-reassign */
      children[i] = {
        id: childItem.id,
        key: childItem.id,
        title: childItem.title,
        isFolder: childItem.isFolder,
        bookComponentId: doc ? doc.id : null,
        children:
          childItem.children.length > 0
            ? /* eslint-disable-next-line no-await-in-loop */
              await getChildren(childItem.children)
            : [],
      }
    }

    return children
  }

  const rootNodes = folderId
    ? [AllFiles.find(f => f.id === folderId)]
    : AllFiles.filter(f => f.parentId === null)

  /* eslint-disable-next-line no-plusplus */
  for (let i = 0; i < rootNodes.length; i++) {
    const rootNode = rootNodes[i]

    const doc = rootNode.bookComponentid
      ? /* eslint-disable-next-line no-shadow */
        getAllDocs.find(doc => doc.id === rootNode.bookComponentid)
      : null

    rootNodes[i] = {
      id: rootNode.id,
      key: rootNode.id,
      title: rootNode.title,
      isFolder: rootNode.isFolder,
      bookComponentId: doc ? doc.id : null,
      /* eslint-disable-next-line no-await-in-loop */
      children: await getChildren(rootNode.children),
    }
  }

  return rootNodes || null
}

const getDocTree = async (_, { folderId }, ctx) => {
  return JSON.stringify(await DocTreeNested(folderId, ctx.user))
}

/* eslint-disable-next-line no-empty-pattern */
const getSharedDocTree = async (_, {}, ctx) => {
  const bookComponents = await BookComponent.getSharedBookComponents(ctx.user)
  let children = []

  if (bookComponents.length > 0) {
    children = await DocTreeManager.query().whereIn(
      'bookComponentId',
      bookComponents.map(doc => doc.id),
    )
  }

  const id = uuidv4()
  return [
    {
      id,
      key: id,
      title: 'Shared Documents',
      isRoot: true,
      children,
      isFolder: true,
      bookComponentId: null,
    },
  ]
}

const addResource = async (_, { id, bookId, divisionId, isFolder }, ctx) => {
  if (isFolder) {
    return DocTreeManager.createNewFolderResource({ id, userId: ctx.user })
  }

  return DocTreeManager.createNewDocumentResource({
    id,
    userId: ctx.user,
    bookComponent: {
      bookId,
      componentType: 'chapter',
      divisionId,
    },
  })
}

const deleteResource = async (_, { id }, ctx) => {
  const deleteResourceItem = await DocTreeManager.query().findOne({ id })

  if (deleteResourceItem.isFolder) {
    deleteResourceRecursively(id, ctx)
    return deleteResourceItem
  }

  const isUserTheOwnerOfTheDoc = await BookComponent.isMyBookComponent(
    deleteResourceItem.bookComponentId,
    ctx.user,
  )

  if (isUserTheOwnerOfTheDoc) {
    deleteResourceRecursively(id, ctx)

    if (deleteResourceItem.bookComponentId) {
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
      objectId: deleteResourceItem.bookComponentId,
      objectType: 'bookComponent',
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

  await BookComponentTranslation.query()
    .patch({ title })
    .findOne({ bookComponentId: updatedItem.bookComponentId })

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
