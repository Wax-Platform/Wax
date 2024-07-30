const {
  getAidMiscByUserIdResolver,
} = require('../../controllers/aiDesignerMisc.controller')

module.exports = {
  Mutation: {
    getAidMiscByUserId: getAidMiscByUserIdResolver,
  },
}
