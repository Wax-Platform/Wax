const { Doc } = require('@pubsweet/models')
const DocTreeManager = require('../../models/docTreeManager/docTreeManager.model')

const {
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
    children: async parent => {
      const children = await DocTreeManager.getChildren(parent.id)
      return children
    },
  },
  Query: {
    getDocTree,
    getSharedDocTree,
    openFolder,
    openRootFolder: async (_, __, ctx) => {
      return openFolder(null, 'root', ctx)
    },
    getParentFolderByIdentifier,
    getResource,
  },
  Mutation: {
    addResource,
    deleteResource,
    renameResource,
    updateTreePosition,
    moveResource,
  },
}
