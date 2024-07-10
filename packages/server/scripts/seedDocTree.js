const { logger } = require('@coko/server')
const DocTreeManager = require('../models/docTreeManager/docTreeManager.model')
const { CLIENT_SHOW_EMAIL_LOGIN_OPTION } = process.env
const seedDocTree = async () => {
    if (CLIENT_SHOW_EMAIL_LOGIN_OPTION == 'false') { 
        const rootFolder = await DocTreeManager.findRootFolderOfUser()
        if (!rootFolder) {
            logger.info('building Root Folder for Loginless mode')
            await DocTreeManager.createUserRootFolder()
        } 

    }
}


module.exports = seedDocTree


