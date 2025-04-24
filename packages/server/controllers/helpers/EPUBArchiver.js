const archiver = require('archiver')
const path = require('path')
const fs = require('fs-extra')
const map = require('lodash/map')
const crypto = require('crypto')
const { dirContents } = require('../../utilities/filesystem')

const EPUBArchiver = async (
  EPUBtempFolderAssetsPath,
  EPUBtempFolderFilePath,
) => {
  try {
    await fs.ensureDir(EPUBtempFolderFilePath)
    const epubFiles = await dirContents(EPUBtempFolderAssetsPath, ['mimetype'])
    return new Promise((resolve, reject) => {
      const tempFilename = `${crypto.randomBytes(32).toString('hex')}.epub`

      const destination = path.join(EPUBtempFolderFilePath, tempFilename)

      const output = fs.createWriteStream(destination)
      const archive = archiver('zip')

      // listen for all archive data to be written
      // 'close' event is fired only when a file descriptor is involved
      output.on('close', () => {
        resolve(tempFilename)
      })

      // good practice to catch warnings (ie stat failures and other non-blocking errors)
      archive.on('warning', err => {
        if (err.code === 'ENOENT') {
          // log warning
        } else {
          // throw error
          throw err
        }
      })

      // good practice to catch this error explicitly
      archive.on('error', async err => {
        await fs.remove(EPUBtempFolderAssetsPath)
        await fs.remove(EPUBtempFolderFilePath)
        throw err
      })

      // pipe archive data to the file
      archive.pipe(output)
      archive.append('application/epub+zip', { name: 'mimetype', store: true })

      const appendFile = item => {
        const absoluteFilePath = path.join(EPUBtempFolderAssetsPath, item)
        const stream = fs.createReadStream(absoluteFilePath)

        return archive.append(stream, {
          name: item,
        })
      }

      map(epubFiles, file => appendFile(file))
      archive.finalize()
    })
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = EPUBArchiver
