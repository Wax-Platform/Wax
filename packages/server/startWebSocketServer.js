/* eslint-disable no-param-reassign */
const { WebSocketServer } = require('ws')

const { establishYjsConnection } = require('./services/websocket.service')

let WSServerYjs

const startWSServer = async () => {
  try {
    if (!WSServerYjs) {
      WSServerYjs = new WebSocketServer({
        port: 3333,
        clientTracking: true,
      })
    }

    WSServerYjs.on('connection', async (ws, req) => {
      await establishYjsConnection(ws, req)
    })
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = { startWSServer }
