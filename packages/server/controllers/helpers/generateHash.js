const isString = require('lodash/isString')
const EventEmitter = require('events')
const { createHash } = require('crypto')

const isReadableStream = input =>
  input instanceof EventEmitter && typeof input.read === 'function'

const generateHash = async input => {
  if (Buffer.isBuffer(input) || isString(input)) {
    return createHash('md5').update(input).digest('hex')
  }

  if (isReadableStream(input)) {
    return new Promise((resolve, reject) => {
      const hash = createHash('md5')
      input.on('error', error => reject(error))
      input.on('readable', () => {
        const data = input.read()

        if (data) {
          hash.update(data)
        } else {
          resolve(hash.digest('hex'))
        }
      })
    })
  }

  throw new Error(
    'unsupported input, only strings, streams or buffers are supported',
  )
}

module.exports = generateHash
