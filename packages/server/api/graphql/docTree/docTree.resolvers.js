const BookComponent = require('../../../models/bookComponent/bookComponent.model')

const {
  updateTreePosition,
  renameResource,
  deleteResource,
  addResource,
  getDocTree,
  getSharedDocTree,
} = require('../../../controllers/docTree.controllers')

// const { getObjectTeam } = require('../../../controllers/team.controller')

module.exports = {
  DocTree: {
    bookComponent: async docTree => {
      if (!docTree.bookComponentId) {
        return null
      }

      return BookComponent.query().findOne({ id: docTree.bookComponentId })
    },
    key: docTree => docTree.id,
    /* eslint-disable-next-line consistent-return */
    bookComponentId: async docTree => {
      if (docTree.bookComponentId) {
        const { id } = await BookComponent.query().findOne({
          id: docTree.bookComponentId,
        })

        return id
      }
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
