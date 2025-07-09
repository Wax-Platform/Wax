const {
  getUserFileManagerHandler,
  uploadToFileManagerHandler,
  deleteFromFileManagerHandler,
  updateMetadataFileManagerHandler,
  updateComponentIdInFileManagerHandler,
} = require('../../../controllers/fileManager.controller')

module.exports = {
  Query: {
    getUserFileManager: getUserFileManagerHandler,
  },
  Mutation: {
    uploadToFileManager: uploadToFileManagerHandler,
    deleteFromFileManager: deleteFromFileManagerHandler,
    updateMetadataFileManager: updateMetadataFileManagerHandler,
    updateComponentIdInFileManager: updateComponentIdInFileManagerHandler,
  },
}
