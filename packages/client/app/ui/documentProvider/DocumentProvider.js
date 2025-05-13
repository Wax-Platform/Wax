/* eslint-disable react/prop-types */

import React, { useState } from 'react'

const DocumentContext = React.createContext({
  title: null,
  setTitle: () => {},
})

const { Provider, Consumer } = DocumentContext

const DocumentProvider = ({ children }) => {
  const [title, setTitle] = useState(null)

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
