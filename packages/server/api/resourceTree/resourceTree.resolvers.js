const { Doc } = require('@pubsweet/models')
const ResourceTree = require('../../models/resourceTree/resourceTree.model')

const {
  renameResource,
  deleteResource,
  addResource,
  openFolder,
  moveResource,
} = require('../../controllers/resourceTree.controllers')

module.exports = {
  Resource: {
    doc: async resourceTree => {
      return Doc.query().findOne({ id: resourceTree.docId })
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
    children: async parent => {
      const children = await ResourceTree.getChildren(parent.id)
      return children
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
  },
}
