/* eslint-disable global-require, no-param-reassign */
const { logger } = require('@coko/server')
const jwt = require('jsonwebtoken')
const config = require('config')
const { omit } = require('lodash')
const map = require('lib0/map')
const WSSharedDoc = require('./yjsWebsocket/wsSharedDoc')
const utils = require('./yjsWebsocket/utils')
const { cleanUpLocks } = require('./bookComponentLock.service')

const userExists = async userId => {
  try {
    const { User } = require('@coko/server')
    logger.info('executing userExists')

    if (!userId) {
      return false
    }

    const foundUser = await User.findById(userId)

    return foundUser || false
  } catch (e) {
    throw new Error(e)
  }
}

const isAuthenticatedUser = async token => {
  try {
    logger.info('executing isAuthenticatedUser')

    const decoded = jwt.verify(token, config.get('secret'))

    return userExists(decoded.id)
  } catch (e) {
    throw new Error(e)
  }
}

const establishConnection = async (ws, req) => {
  try {
    const WSServerURL = config.has('WSServerURL')
      ? config.get('WSServerURL')
      : undefined

    if (!WSServerURL)
      throw new Error('WSServerURL variable should not be undefined')

    const url = new URL(req.url, WSServerURL)

    const token = url.searchParams.get('token')
    const bookComponentId = url.searchParams.get('bookComponentId')
    const tabId = url.searchParams.get('tabId')
    const user = await isAuthenticatedUser(token)

    if (!user) {
      ws.close()
    }

    ws.userId = user.id
    ws.bookComponentId = bookComponentId
    ws.tabId = tabId
  } catch (e) {
    ws.close()
  }
}

const getYDoc = (docName, userId, extraData) =>
  map.setIfUndefined(utils.docs, docName, () => {
    const doc = new WSSharedDoc(docName, userId, extraData)
    doc.gc = true

    if (utils.persistence !== null) {
      utils.persistence.bindState(docName, doc)
    }

    utils.docs.set(docName, doc)
    return doc
  })

const establishYjsConnection = async (injectedWS, request) => {
  injectedWS.binaryType = 'arraybuffer'
  const parts = request.url.split('/')
  const lastPart = parts.pop()

  const [, params] = lastPart.split('?')
  const variables = {}
  params.split('&').forEach(pair => {
    const [key, value] = pair.split('=')
    variables[key] = value || ''
  })

  const user = await isAuthenticatedUser(variables.token)

  const { userId } = user

  const extraData = {
    objectId: variables.bookComponentId,
    ...omit(variables, ['token']),
  }

  const doc = getYDoc(variables.bookComponentId, userId, extraData)

  doc.conns.set(injectedWS, new Set())

  injectedWS.on('message', message =>
    utils.messageListener(injectedWS, doc, new Uint8Array(message)),
  )

  const pingInterval = initializeYjs(injectedWS, doc)

  injectedWS.on('close', async () => {
    utils.closeConn(doc, injectedWS)
    clearInterval(pingInterval)

    return false
  })

  {
    const encoder = utils.encoding.createEncoder()
    utils.encoding.writeVarUint(encoder, utils.messageSync)
    utils.syncProtocol.writeSyncStep1(encoder, doc)
    utils.send(doc, injectedWS, utils.encoding.toUint8Array(encoder))
    const awarenessStates = doc.awareness.getStates()

    if (awarenessStates.size > 0) {
      const encoder1 = utils.encoding.createEncoder()
      utils.encoding.writeVarUint(encoder1, utils.messageAwareness)
      utils.encoding.writeVarUint8Array(
        encoder1,
        utils.awarenessProtocol.encodeAwarenessUpdate(
          doc.awareness,
          Array.from(awarenessStates.keys()),
        ),
      )
      utils.send(doc, injectedWS, utils.encoding.toUint8Array(encoder1))
    }
  }

  return { doc, pingInterval }
}


const initializeYjs = (injectedWS, doc) => {
  const pingTimeout = 3000
  let pingReceived = true

  const pingInterval = setInterval(() => {
    if (!pingReceived) {
      if (doc.conns.has(injectedWS)) {
        utils.closeConn(doc, injectedWS)
      }

      clearInterval(pingInterval)
    } else if (doc.conns.has(injectedWS)) {
      pingReceived = false

      try {
        injectedWS.ping()
      } catch (error) {
        utils.closeConn(doc, injectedWS)
        clearInterval(pingInterval)
      }
    }
  }, pingTimeout)

  injectedWS.on('pong', () => {
    pingReceived = true
  })

  return pingInterval
}

const initializeFailSafeUnlocking = async () => {
  try {
    return setInterval(
      async () => cleanUpLocks(),
      config.failSafeUnlockingInterval || 7000,
    )
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  establishConnection,
  establishYjsConnection,
  initializeFailSafeUnlocking,
  isAuthenticatedUser,
}
