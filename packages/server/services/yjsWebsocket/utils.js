// const pick = require('lodash/pick')
const syncProtocol = require('y-protocols/dist/sync.cjs')
const awarenessProtocol = require('y-protocols/dist/awareness.cjs')
const encoding = require('lib0/encoding')
const decoding = require('lib0/decoding')
const map = require('lib0/map')
const Y = require('yjs')

const { db } = require('@coko/server')

const WSSharedDoc = require('./wsSharedDoc')
// const { CollaborativeDoc, Form } = require('../../models')
const BookComponentTranslation = require('../../models/bookComponentTranslation/bookComponentTranslation.model')

let persistence = null

const messageSync = 0
const messageAwareness = 1
const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1
const docs = new Map()

/**
 * @param {Uint8Array} update
 * @param {any} origin
 * @param {WSSharedDoc} doc
 */
const updateHandler = (update, origin, doc) => {
  const encoder = encoding.createEncoder()
  encoding.writeVarUint(encoder, messageSync)
  syncProtocol.writeUpdate(encoder, update)
  const message = encoding.toUint8Array(encoder)
  doc.conns.forEach((_, conn) => send(doc, conn, message))
}

/**
 * @param {WSSharedDoc} doc
 * @param {any} conn
 * @param {Uint8Array} m
 */
const send = (doc, conn, m) => {
  if (
    conn.readyState !== wsReadyStateConnecting &&
    conn.readyState !== wsReadyStateOpen
  ) {
    closeConn(doc, conn)
  }

  try {
    conn.send(
      m,
      /** @param {any} err */ err => {
        err != null && closeConn(doc, conn)
      },
    )
  } catch (e) {
    closeConn(doc, conn)
  }
}

/**
 * @param {WSSharedDoc} doc
 * @param {any} conn
 */
const closeConn = (doc, conn) => {
  if (doc.conns.has(conn)) {
    /**
     * @type {Set<number>}
     */
    // @ts-ignore
    const controlledIds = doc.conns.get(conn)
    doc.conns.delete(conn)
    awarenessProtocol.removeAwarenessStates(
      doc.awareness,
      Array.from(controlledIds),
      null,
    )

    if (doc.conns.size === 0 && persistence !== null) {
      // if persisted, we store state and destroy ydocument
      persistence.writeState(doc).then(() => {
        doc.destroy()
      })
      docs.delete(doc.name)
    }
  }

  conn.close()
}

const getYDoc = (docName, userId, extraData) =>
  map.setIfUndefined(docs, docName, () => {
    const doc = new WSSharedDoc(docName, userId, extraData)
    doc.gc = true

    if (persistence !== null) {
      persistence.bindState(docName, doc)
    }

    docs.set(docName, doc)
    return doc
  })

const messageListener = (conn, doc, message) => {
  try {
    const encoder = encoding.createEncoder()
    const decoder = decoding.createDecoder(message)
    const messageType = decoding.readVarUint(decoder)

    // eslint-disable-next-line default-case
    switch (messageType) {
      case messageSync:
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.readSyncMessage(decoder, encoder, doc, null)
        // console.log(doc)

        if (encoding.length(encoder) > 1) {
          send(doc, conn, encoding.toUint8Array(encoder))
        }

        break
      case messageAwareness:
        awarenessProtocol.applyAwarenessUpdate(
          doc.awareness,
          decoding.readVarUint8Array(decoder),
          conn,
        )
        break
    }
  } catch (error) {
    console.error(error)
    doc.emit('error', [error])
  }
}

persistence = {
  bindState: async (id, doc) => {
    const collaborativeForm = await BookComponentTranslation.query().findOne({
      bookComponentId: id,
    })

    if (collaborativeForm) {
      const { yState } = collaborativeForm

      if (yState) {
        const uint8Array = Uint8Array.from(Buffer.from(yState, 'base64'))
        Y.applyUpdate(doc, uint8Array)
      }
    }
  },
  writeState: async ydoc => {
    const objectId = ydoc.name
    const state = Y.encodeStateAsUpdate(ydoc)

    const timestamp = db.fn.now()

    // try {
    const content = ydoc.getXmlFragment('prosemirror').toString()

    const base64State = Buffer.from(state).toString('base64')

    await BookComponentTranslation.query()
      .patch({
        yState: base64State,
        updated: timestamp,
        content,
      })
      .findOne({ bookComponentId: objectId })
    // } catch (e) {
    // console.log(`Patch Query`)
    // console.log(e)
    // }
  },
}

module.exports = {
  syncProtocol,
  awarenessProtocol,
  encoding,
  persistence,
  messageSync,
  wsReadyStateConnecting,
  wsReadyStateOpen,
  docs,
  updateHandler,
  decoding,
  send,
  closeConn,
  messageAwareness,
  messageListener,
  getYDoc,
}
