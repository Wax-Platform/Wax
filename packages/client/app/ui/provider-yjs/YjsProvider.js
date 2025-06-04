import React, { useState, useEffect } from 'react'
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
  '#FFCDD2', // light red
  '#F8BBD0', // light pink
  '#E1BEE7', // light purple
  '#D1C4E9', // lavender
  '#C5CAE9', // light indigo
  '#BBDEFB', // light blue
  '#B3E5FC', // light sky blue
  '#B2EBF2', // light cyan
  '#B2DFDB', // light teal
  '#C8E6C9', // light green
  '#DCEDC8', // light lime
  '#F0F4C3', // light yellow
  '#FFF9C4', // pale yellow
  '#FFECB3', // light amber
  '#FFE0B2', // light orange
  '#FFCCBC', // light coral
  '#D7CCC8', // warm gray
  '#F5F5F5', // light gray
  '#CFD8DC', // bluish gray
  '#E6EE9C', // light lime yellow
  '#FFAB91', // peach
  '#CE93D8', // lilac
  '#A5D6A7', // mint
  '#81D4FA', // baby blue
  '#80CBC4', // aqua green
  '#FFCDD2', // pink red
  '#E0F2F1', // mint gray
  '#D1F2EB', // pastel teal
  '#FFE082', // butter yellow
  '#F8EFD4', // ivory
]

// ✅ Hash function to map UUIDs to a color index consistently
const getColorForUserId = userId => {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % arrayColor.length
  return arrayColor[index]
}

// Επιλέγει διαθέσιμο και ευανάγνωστο χρώμαconst
// const getAvailableColor = (usedColors) => {
//   const availableColors = arrayColor.filter(c => !usedColors.includes(c))
//   if (availableColors.length === 0) return '#cccccc' // fallback
//   return availableColors[Math.floor(Math.random() * availableColors.length)]
// }

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
      const uniqueUsers = uniqBy(
        Array.from(provider.awareness.getStates().values()),
        'user.id',
      )
      setSharedUsers(uniqueUsers)
    })

    // const currentAwarenessStates = Array.from(provider.awareness.getStates().values())
    // const usedColors = currentAwarenessStates.map(state => state.user?.color).filter(Boolean)
    // const color = getAvailableColor(usedColors)

    if (currentUser) {
      const userId = currentUser?.id || uuid()
      const color = getColorForUserId(userId)

      provider.awareness.setLocalStateField('user', {
        id: userId,
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
