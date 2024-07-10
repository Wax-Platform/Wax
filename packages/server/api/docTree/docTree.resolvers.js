const { Doc } = require('@pubsweet/models')

const {
  updateTreePosition,
  renameResource,
  deleteResource,
  addResource,
  getDocTree,
  getSharedDocTree,
} = require('../../controllers/docTree.controllers')

module.exports = {
  DocTree: {
    doc: async docTree => {
      return Doc.query().findOne({ id: docTree.docId })
    },
    key: docTree => docTree.id,
    identifier: async docTree => {
      if (docTree.docId) {
        const { identifier } = await Doc.query().findOne({ id: docTree.docId })
        return identifier
      }
      return null
    },
  },
  Query: {
    getDocTree,
    getSharedDocTree,
  },
  Mutation: {
    addResource,
    deleteResource,
    renameResource,
    updateTreePosition,
  },
}
