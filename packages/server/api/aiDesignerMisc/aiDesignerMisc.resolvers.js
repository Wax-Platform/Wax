const {
  getOrCreateAidMiscResolver,
  getAidMiscById,
  getCssTemplate,
  updateSnippetsResolver,
} = require('../../controllers/aiDesignerMisc.controller')

module.exports = {
  Query: { getAidMiscById, getCssTemplate },
  Mutation: {
    getOrCreateAidMisc: getOrCreateAidMiscResolver,
    updateSnippets: updateSnippetsResolver,
  },
}
