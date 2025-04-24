/* eslint-disable react/prop-types */

import React, { useState } from 'react'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

import { uuid } from '@coko/client'

const DocumentContext = React.createContext({
  title: null,
  updateTitle: () => {},
})

const { Provider, Consumer } = DocumentContext


const DocumentProvider = ({ children }) => {
  const [title, setTitle] = useState(null)

  console.log(title,"title")
  return (
    <Provider
      value={{
        title,
        setTitle,
      }}
    >
      {children}
    </Provider>
  )
}

export { Consumer as DocumentConsumer, DocumentProvider }

export default DocumentContext
