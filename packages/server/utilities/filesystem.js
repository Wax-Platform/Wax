const fs = require('fs-extra')
const list = require('list-contents')
const { exec } = require('child_process')
const archiver = require('archiver')
const path = require('path')
const crypto = require('crypto')

const writeFile = (location, content) =>
  new Promise((resolve, reject) => {
    fs.writeFile(location, content, 'utf8', err => {
      if (err) return reject(err)
      return resolve()
    })
  })

const readFile = (location, encoding = 'utf8') =>
  new Promise((resolve, reject) => {
    fs.readFile(location, encoding, (err, data) => {
      if (err) return reject(err)
      return resolve(data)
    })
  })

const dirContents = async (dir, exclude = []) => {
  if (exclude.length > 0) {
    return new Promise((resolve, reject) => {
      list(dir, { exclude }, o => {
        if (o.error) reject(o.error)
        resolve(o.files)
      })
    })
  }

  return new Promise((resolve, reject) => {
    list(dir, o => {
      if (o.error) reject(o.error)
      resolve(o.files)
    })
  })
}

const execCommand = cmd =>
  new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(error)
      }

      return resolve(stdout || stderr)
    })
  })

const zipper = async dirPath => {
  try {
    const tempPath = path.join(
      `${process.cwd()}`,
      'tmp',
      `${crypto.randomBytes(32).toString('hex')}`,
    )

    await fs.ensureDir(tempPath)
    const contents = await dirContents(dirPath)
    return new Promise((resolve, reject) => {
      const destination = path.join(
        tempPath,
        `${crypto.randomBytes(32).toString('hex')}.zip`,
      )

      const output = fs.createWriteStream(destination)
      const archive = archiver('zip')
      // pipe archive data to the file
      archive.pipe(output)

      contents.forEach(item => {
        const absoluteFilePath = path.join(dirPath, item)
        archive.append(fs.createReadStream(absoluteFilePath), { name: item })
      })
      archive.finalize()

      output.on('close', () => {
        resolve(destination)
      })
      archive.on('error', err => reject(err))
    })
  } catch (e) {
    throw new Error(e)
  }
}

const saveDataLocally = async (pathArg, filename, data, encoding) => {
  try {
    const pathExists = await fs.pathExists(pathArg)

    if (!pathExists) throw new Error(`path ${pathArg} does not exists`)

    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(`${pathArg}/${filename}`, {
        encoding,
      })

      // write some data with a base64 encoding
      writeStream.write(data)

      // the finish event is emitted when all data has been flushed from the stream
      writeStream.on('finish', () => {
        resolve()
      })

      // close the stream
      writeStream.end()
    })
  } catch (e) {
    throw new Error(e)
  }
}

const writeLocallyFromReadStream = async (
  pathArg,
  filename,
  readerStream,
  encoding,
) => {
  try {
    const pathExists = await fs.pathExists(pathArg)

    if (!pathExists) throw new Error(`path ${pathArg} does not exists`)

    return new Promise((resolve, reject) => {
      const writerStream = fs.createWriteStream(
        `${pathArg}/${filename}`,
        encoding,
      )

      writerStream.on('close', () => {
        resolve()
      })
      writerStream.on('error', err => {
        reject(err)
      })
      readerStream.pipe(writerStream)
    })
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  writeFile,
  readFile,
  dirContents,
  execCommand,
  zipper,
  saveDataLocally,
  writeLocallyFromReadStream,
}
