import React, { useState } from 'react'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'
import { uniqBy } from 'lodash'

import { uuid, webSocketServerUrl } from '@coko/client'

const YjsContext = React.createContext({
  wsProvider: null,
  ydoc: null,
  createYjsProvider: () => {},
})

const { Provider, Consumer } = YjsContext

const arrayColor = [
  '#4363d8',
  '#ffe119',
  '#800000',
  '#dcbeff',
  '#000075',
  '#f58231',
  '#469990',
  '#f032e6',
  '#9a6324',
  '#42d4f4',
  '#e6194b',
  '#fabed4',
  '#3cb44b',
  '#911eb4',
  '#bfef45',
  '#808000',
  '#ffd8b1',
  '#aaffc3',
]

const YjsProvider = ({ children }) => {
  const [wsProvider, setWsProvider] = useState(null)
  const [ydoc, setYDoc] = useState(null)
  const [sharedUsers, setSharedUsers] = useState([])

  const createYjsProvider = ({ currentUser, object, identifier }) => {
    if (!object) {
      throw new Error('You need to specify a collaborativeObject')
    }

    if (!identifier) {
      throw new Error('You need to specify a Identifier')
    }

    let ydocInstance = null
    ydocInstance = new Y.Doc()
    setYDoc(ydocInstance)

    let provider = null

    if (!identifier) {
      // eslint-disable-next-line no-param-reassign
      identifier = uuid()
    }

    // eslint-disable-next-line no-restricted-globals
    provider = new WebsocketProvider(
      webSocketServerUrl,
      identifier,
      ydocInstance,
      {
        params: {
          token: localStorage.getItem('token') || '',
          ...object,
        },
      },
    )

    provider.awareness.on('change', () => {
      const uniqueUsers = uniqBy(Array.from(provider.awareness.getStates().values()), 'user.id')
      setSharedUsers(uniqueUsers)
    })

    const color = arrayColor[Math.floor(Math.random() * arrayColor.length)]

    if (currentUser) {
      provider.awareness.setLocalStateField('user', {
        id: currentUser.id || uuid(),
        color,
        displayName: currentUser.displayName || 'Anonymous',
      })
    }

    setWsProvider(provider)
  }

  return (
    <Provider
      value={{
        sharedUsers,
        wsProvider,
        ydoc,
        createYjsProvider,
      }}
    >
      {children}
    </Provider>
  )
}

export { Consumer as YjsConsumer, YjsProvider }

export default YjsContext
