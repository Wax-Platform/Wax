const {
  getUserFileManagerHandler,
  uploadToFileManagerHandler,
  deleteFromFileManagerHandler,
  updateFileInFileManagerHandler,
} = require('../../../controllers/file.controller')

module.exports = {
  Query: {
    getUserFileManager: getUserFileManagerHandler,
  },
  Mutation: {
    uploadToFileManager: uploadToFileManagerHandler,
    deleteFromFileManager: deleteFromFileManagerHandler,
    updateFileInFileManager: updateFileInFileManagerHandler,
  },
}
