const { Doc } = require('@pubsweet/models')
const ResourceTree = require('../../models/resourceTree/resourceTree.model')

const {
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
} = require('../../controllers/resourceTree.controllers')
const { logger } = require('@coko/server')

module.exports = {
  Resource: {
    doc: async ({ docId }) => {
      return Doc.query().findOne({ id: docId })
    },
    key: resourceTree => resourceTree.id,
    identifier: async resourceTree => {
      if (resourceTree.docId) {
        const { identifier } = await Doc.query().findOne({
          id: resourceTree.docId,
        })
        return identifier
      }
      return null
    },
    children: async resource => {
      if (resource.resourceType === 'doc') return []
      const { children, userId, resourceType } = resource

      if (resourceType === 'root') {
        const sysFolderIds = await ResourceTree.query()
          .where({ userId: userId, resourceType: 'sys' })
          .select('id')
        const mappedIds = sysFolderIds.map(({ id }) => id)
        return ResourceTree.getChildren([...children, ...mappedIds])
      }

      const childResources = await ResourceTree.getChildren(children)
      return childResources
    },
  },
  Query: {
    openFolder,
    getDocPath: async (_, { id }) => {
      const paths = await ResourceTree.getDocPath(id)
      return paths
    },
  },
  Mutation: {
    addResource,
    deleteResource,
    renameResource,
    moveResource,
    shareResource,
    unshareResource,
    addToFavorites,
    pasteResources,
    reorderChildren,
  },
}
