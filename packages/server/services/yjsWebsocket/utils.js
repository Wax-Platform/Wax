// const pick = require('lodash/pick')
const { fileStorage } = require('@coko/server')
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

const Files = require('../../models/file/file.model')

let persistence = null

// const LAST_WRITE = new Map();

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
    
    persistence.writeState(doc).catch((err) => {
      console.error('Failed to write document state on user disconnect:', err);
    });

    if (doc.conns.size === 0) {
      doc.destroy();
      docs.delete(doc.name);
    }
  }

  conn.close()
}

// const shouldWrite = (docName) => {
//   const now = Date.now();
//   const last = LAST_WRITE.get(docName) || 0;
//   const WRITE_INTERVAL = 10000; // 10 seconds
//   if (now - last > WRITE_INTERVAL) {
//     LAST_WRITE.set(docName, now);
//     return true;
//   }
//   return false;
// }

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

const replaceImgSrc = async (doc, objectId) => {

  const files = await Files.query().where({ objectId })
  const xmlFragment1 = doc.getXmlFragment('prosemirror')

// Recursive function to walk the Y.XmlElement tree
  const updateImageSrcs = async (node) => {
    if (node instanceof Y.XmlElement) {
    
      if (node.nodeName === 'image') {
        const fileId =node.getAttribute('fileid')
        if (fileId) {
          const file = files.find(f => f.id === fileId)
          if (file) {
            const { key } =  file.storedObjects.find(obj => obj.type === 'original')

            const newSrc = await fileStorage.getURL(key)
            node.setAttribute('src', newSrc)
          }
        }
      }

    // Recurse into children
      for (const child of node.toArray()) {
        await updateImageSrcs(child)
      }
    }
  }

  // Start traversal from the root fragment
  for (const node of xmlFragment1.toArray()) {
    await updateImageSrcs(node)
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
        doc.transact(async () => {
          const uint8Array = Uint8Array.from(Buffer.from(yState, 'base64'))
          Y.applyUpdate(doc, uint8Array)
          // const fragment = doc.getXmlFragment('prosemirror');
          await replaceImgSrc(doc, id)
        });
      }
    }
  },
  writeState: async ydoc => {
    const objectId = ydoc.name
    const state = Y.encodeStateAsUpdate(ydoc)

    const timestamp = db.fn.now()
    const content = ydoc.getText('html').toString()

    const base64State = Buffer.from(state).toString('base64')

    await BookComponentTranslation.query()
      .patch({
        yState: base64State,
        updated: timestamp,
        content,
      })
      .findOne({ bookComponentId: objectId })
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
