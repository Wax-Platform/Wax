const {
  getUserFileManagerHandler,
  uploadToFileManagerHandler,
  deleteFromFileManagerHandler,
  updateMetadataFileManagerHandler,
} = require('../../../controllers/fileManager.controller')

module.exports = {
  Query: {
    getUserFileManager: getUserFileManagerHandler,
  },
  Mutation: {
    uploadToFileManager: uploadToFileManagerHandler,
    deleteFromFileManager: deleteFromFileManagerHandler,
    updateMetadataFileManager: updateMetadataFileManagerHandler,
  },
}
