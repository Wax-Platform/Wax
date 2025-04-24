const archiver = require('archiver')
const fs = require('fs-extra')
const path = require('path')
const crypto = require('crypto')
const { dirContents } = require('../../utilities/filesystem')

const PagedJSArchiver = async (
  pagedJStempFolderAssetsPath,
  zippedTempFolderFilePath,
) => {
  try {
    await fs.ensureDir(zippedTempFolderFilePath)
    const bookFiles = await dirContents(pagedJStempFolderAssetsPath)
    return new Promise((resolve, reject) => {
      const tempFilename = `${crypto.randomBytes(32).toString('hex')}.zip`

      const destination = path.join(zippedTempFolderFilePath, tempFilename)

      const output = fs.createWriteStream(destination)
      const archive = archiver('zip')
      // pipe archive data to the file
      archive.pipe(output)

      bookFiles.forEach(item => {
        const absoluteFilePath = path.join(pagedJStempFolderAssetsPath, item)
        archive.append(fs.createReadStream(absoluteFilePath), { name: item })
      })
      archive.finalize()

      output.on('close', () => {
        resolve(tempFilename)
      })
      archive.on('error', async err => {
        await fs.remove(pagedJStempFolderAssetsPath)
        await fs.remove(zippedTempFolderFilePath)
        reject(err)
      })
    })
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = PagedJSArchiver
