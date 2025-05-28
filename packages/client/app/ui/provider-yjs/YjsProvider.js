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
  '#FFD700', // gold
  '#FFB6C1', // light pink
  '#90EE90', // light green
  '#87CEFA', // light sky blue
  '#FF7F50', // coral
  '#FFFF66', // light yellow
  '#FFA07A', // light salmon
  '#40E0D0', // turquoise
  '#E0FFFF', // light cyan
  '#D8BFD8', // thistle
  '#FF69B4', // hot pink
  '#B0E0E6', // powder blue
  '#98FB98', // pale green
  '#E6E6FA', // lavender
  '#F5DEB3', // wheat
  '#FFE4B5', // moccasin
  '#F0E68C', // khaki
  '#FFDAB9', // peach puff
]

// Επιλέγει διαθέσιμο και ευανάγνωστο χρώμαconst 
const getAvailableColor = (usedColors) => {
  const availableColors = arrayColor.filter(c => !usedColors.includes(c))
  if (availableColors.length === 0) return '#cccccc' // fallback
  return availableColors[Math.floor(Math.random() * availableColors.length)]
}

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


    const currentAwarenessStates = Array.from(provider.awareness.getStates().values())
    const usedColors = currentAwarenessStates.map(state => state.user?.color).filter(Boolean)
    const color = getAvailableColor(usedColors)

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
