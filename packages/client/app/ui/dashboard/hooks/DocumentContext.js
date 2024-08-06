import React, { createContext, useState } from 'react'

export const DocumentContext = createContext()

export const DocumentContextProvider = ({ children }) => {
  const [currentDoc, setCurrentDoc] = useState(null)
  const [docTree, setDocTree] = useState(null)
  return (
    <DocumentContext.Provider
      value={{ currentDoc, setCurrentDoc, docTree, setDocTree }}
    >
      {children}
    </DocumentContext.Provider>
  )
}
