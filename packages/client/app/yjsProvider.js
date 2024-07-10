/* eslint-disable react/prop-types */

import React, { useState } from 'react'
import { WebsocketProvider } from 'y-websocket'
import { useMutation } from '@apollo/client'
import * as Y from 'yjs'

import { useCurrentUser } from '@coko/client'

import { UPDATE_PROFILE } from './graphql'

const YjsContext = React.createContext({})

const { Provider, Consumer } = YjsContext

const { CLIENT_WEBSOCKET_URL } = process.env

const withYjs = Component => {
  const C = props => (
    <Consumer>
      {providerProps => <Component {...providerProps} {...props} />}
    </Consumer>
  )

  return C
}

const YjsProvider = ({ enableLogin, children }) => {
  const [yjsProvider, setYjsProvider] = useState(null)
  const { currentUser, setCurrentUser } = useCurrentUser()
  const [ydoc, setYDoc] = useState(null)
  const [sharedUsers, setSharedUsers] = useState([])

  const [updateProfileMutation] = useMutation(UPDATE_PROFILE, {
    onCompleted({ updateUserProfile }) {
      setCurrentUser({
        ...currentUser,
        ...updateUserProfile,
      })
    },
  })

  let localCurrentUser = null

  if (localStorage.getItem('YjsCurrentUser')) {
    localCurrentUser = JSON.parse(localStorage.getItem('YjsCurrentUser'))
  }

  const createYjsProvider = docIdentifier => {
    let identifier = docIdentifier
    let ydocInstance = null

    ydocInstance = new Y.Doc()
    setYDoc(ydocInstance)

    if (!identifier) {
      identifier = Array.from(Array(20), () =>
        Math.floor(Math.random() * 36).toString(36),
      ).join('')
      // eslint-disable-next-line no-restricted-globals
      window.history.replaceState({}, identifier, `/${identifier}`)
    }

    // eslint-disable-next-line no-restricted-globals
    const provider = new WebsocketProvider(
      CLIENT_WEBSOCKET_URL,
      identifier,
      ydocInstance,
      { params: { token: localStorage.getItem('token') || '' } },
    )

    provider.awareness.on('change', () => {
      setSharedUsers([...provider.awareness.getStates()])
    })

    if (currentUser) {
      provider.awareness.setLocalStateField('user', {
        id: currentUser.id,
        color: currentUser.color,
        displayName: currentUser.displayName || currentUser.email,
      })
    } else if (localCurrentUser) {
      provider.awareness.setLocalStateField('user', localCurrentUser)
    } else {
      const arrayColor = [
        '#D9E3F0',
        '#F47373',
        '#697689',
        '#37D67A',
        '#2CCCE4',
        '#555555',
        '#dce775',
        '#ff8a65',
        '#ba68c8',
      ]

      const color = arrayColor[Math.floor(Math.random() * arrayColor.length)]

      provider.awareness.setLocalStateField('user', {
        id: provider.awareness.clientID,
        color,
        displayName: 'Anonymous',
      })

      localStorage.setItem(
        'YjsCurrentUser',
        JSON.stringify(provider.awareness.getLocalState().user),
      )
    }

    setYjsProvider(provider)
  }

  const updateLocalUser = async user => {
    if (!currentUser) {
      localStorage.setItem(
        'YjsCurrentUser',
        JSON.stringify({ ...user, id: yjsProvider.awareness.clientID }),
      )
      yjsProvider.awareness.setLocalStateField('user', {
        ...user,
        id: yjsProvider.awareness.clientID,
      })
    } else {
      await updateProfileMutation({
        variables: {
          input: {
            email: currentUser.defaultIdentity.email,
            color: user.color,
            displayName: user.displayName,
          },
        },
      })

      yjsProvider.awareness.setLocalStateField('user', {
        ...user,
        id: currentUser.id,
      })
    }
  }

  const yjsCurrentUser = currentUser || localCurrentUser

  return (
    <Provider
      value={{
        yjsProvider,
        ydoc,
        sharedUsers,
        yjsCurrentUser,
        createYjsProvider,
        updateLocalUser,
      }}
    >
      {children}
    </Provider>
  )
}

export { Consumer as YjsConsumer, YjsProvider, withYjs }

export default YjsContext
