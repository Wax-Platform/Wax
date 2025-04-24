/* eslint-disable no-param-reassign */
const { WebSocketServer } = require('ws')
const { logger } = require('@coko/server')
const config = require('config')
// const utils = require('./services/yjsWebsocket/utils')

const {
  establishConnection,
  establishYjsConnection,
  heartbeat,
  initializeHeartbeat,
  initializeFailSafeUnlocking,
} = require('./services/websocket.service')

const { unlockBookComponent } = require('./services/bookComponentLock.service')
const { updateLastActiveAt } = require('./controllers/lock.controller')

let WSServer
let WSServerYjs

const startWSServer = async server => {
  // let HEARTBEAT_INTERVAL_REFERENCE
  // let FAILSAFE_UNLOCK_REFERENCE

  try {
    if (!WSServerYjs) {
      WSServerYjs = new WebSocketServer({
        port: 3333,
        clientTracking: true,
      })
    }

    // if (!WSServer) {
    //   if (!config.has('pubsweet-server.WSServerPort')) {
    //     logger.warn(
    //       'You should declare a port for your websocket server. Now the default value of 3333 is in use',
    //     )
    //   }

    //   const WSServerURL = config.has('WSServerURL')
    //     ? config.get('WSServerURL')
    //     : undefined

    //   if (!WSServerURL)
    //     throw new Error('WSServerURL variable should not be undefined')

    //   const wsPort = config['pubsweet-server'].WSServerPort || 3333

    //   WSServer = new WebSocketServer({
    //     port: wsPort,
    //     clientTracking: true,
    //   })

    //   logger.info(`WS server started on port ${wsPort}`)
    //   logger.info(`Websocket server public URL is ${WSServerURL}`)

    //   // server.on('upgrade', (request, socket, head) => {
    //   //   const { url } = request

    //   //   console.log(url, 'urlsssssssssssssssssssssssssss')

    //   //   if (url === '/locks') {
    //   //     WSServer.handleUpgrade(request, socket, head, ws => {
    //   //       WSServer.emit('connection', ws, request)
    //   //     })
    //   //   } else if (url === '/yjs') {
    //   //     console.log(
    //   //       '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
    //   //     )
    //   //     WSServerYjs.handleUpgrade(request, socket, head, ws => {
    //   //       WSServerYjs.emit('connection', ws, request)
    //   //     })
    //   //   } else {
    //   //     console.log(`Allowing WebSocket connection on: ${url}`)
    //   //     // Upgrade the connection without assigning it to wss1 or wss2
    //   //   }
    //   // })
    // }

    WSServerYjs.on('connection', async (ws, req) => {
      const { doc, pingInterval } = await establishYjsConnection(ws, req)
    })

    // // WS_SERVER EVENT LISTENERS SECTION
    // WSServer.on('connection', async (ws, req) => {
    //   // INITIALIZATION SECTION
    //   await establishConnection(ws, req)

    //   ws.isAlive = true
    //   // INITIALIZATION SECTION END

    //   // WS EVENT LISTENERS SECTION
    //   ws.on('pong', async () => {
    //     heartbeat(ws)

    //     const { bookComponentId, userId, tabId } = ws

    //     if (bookComponentId && userId && tabId) {
    //       await updateLastActiveAt(bookComponentId, tabId, userId)
    //       return true
    //     }

    //     return false
    //   })
    //   logger.info(`############ WEBSOCKET SERVER INFO ############`)
    //   logger.info(
    //     `current connected clients via WS are ${WSServer.clients.size}`,
    //   )
    //   logger.info(`##################### END #####################`)
    //   ws.on('open', () => {
    //     logger.info(
    //       `WS open event for book component with id ${ws.bookComponentId}, tabId ${ws.tabId} and userId ${ws.userId}`,
    //     )
    //   })

    //   ws.on('close', async () => {
    //     logger.info(
    //       `WS close event for book component with id ${ws.bookComponentId}, tabId ${ws.tabId} and userId ${ws.userId}`,
    //     )

    //     if (ws.bookComponentId && ws.userId && ws.tabId) {
    //       logger.info(`############ WEBSOCKET SERVER INFO ############`)
    //       logger.info(
    //         `current connected clients via WS are ${WSServer.clients.size}`,
    //       )
    //       logger.info(`##################### END #####################`)
    //       return unlockBookComponent(ws.bookComponentId, ws.userId, ws.tabId)
    //     }

    //     return false
    //   })
    //   // WS EVENT LISTENERS SECTION END
    // })
    // logger.info(`############ INIT WS YJS INTERVAL ############`)

    // logger.info(`############ INIT WS HEARTBEAT ############`)
    // HEARTBEAT_INTERVAL_REFERENCE = initializeHeartbeat(WSServer)
    // logger.info(`################## DONE ###################`)
    // logger.info(`########### INIT LOCK FAIL-SAFE ###########`)
    // FAILSAFE_UNLOCK_REFERENCE = initializeFailSafeUnlocking(WSServer)
    // logger.info(`################## DONE ###################`)
    // WSServer.on('close', async () => {
    //   clearInterval(HEARTBEAT_INTERVAL_REFERENCE)
    //   clearInterval(FAILSAFE_UNLOCK_REFERENCE)

    //   logger.info('###### WS SERVER IS CLOSING ######')
    //   WSServer.clients.forEach(ws => {
    //     ws.terminate()
    //   })
    // })
    // WS_SERVER EVENT LISTENERS SECTION END
  } catch (e) {
    // if (HEARTBEAT_INTERVAL_REFERENCE) {
    //   clearInterval(HEARTBEAT_INTERVAL_REFERENCE)
    // }

    // if (FAILSAFE_UNLOCK_REFERENCE) {
    //   clearInterval(FAILSAFE_UNLOCK_REFERENCE)
    // }

    throw new Error(e)
  }
}

module.exports = { startWSServer }
