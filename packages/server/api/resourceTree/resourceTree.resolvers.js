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

module.exports = {
  Resource: {
    doc: async ({ docId }) => {
      const Doc = require('../../models/doc/doc.model')
      return Doc.query().findOne({ id: docId })
    },
    key: resourceTree => resourceTree.id,
    identifier: async resourceTree => {
      const Doc = require('../../models/doc/doc.model')
      if (resourceTree.docId) {
        const { identifier } = await Doc.query().findOne({
          id: resourceTree.docId,
        })
        return identifier
      }
      return null
    },
    children: async resource => {
      const ResourceTree = require('../../models/resourceTree/resourceTree.model')
      if (resource.resourceType === 'doc') return []
      const { children, userId, resourceType } = resource

      // hacky solution, fix later
      if (resourceType === 'root' && !children.length) {
        const sysFolderIds = await ResourceTree.query().where({
          userId: userId,
          resourceType: 'sys',
        })
        const mappedIds = sysFolderIds
          .map(
            ({ id, title }) =>
              ![
                'My Templates',
                'My Snippets',
                'Document Templates',
                'Books',
              ].includes(title) && id,
          )
          .filter(Boolean)
        return ResourceTree.getChildren([...children, ...mappedIds])
      }

      const childResources = await ResourceTree.getChildren(children)
      return childResources
    },
  },
  Query: {
    openFolder,
    getDocPath: async (_, { id }) => {
      const ResourceTree = require('../../models/resourceTree/resourceTree.model')
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
