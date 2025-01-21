import React, { createContext, useState, useContext, useEffect } from 'react'
import { useResourceTree } from './useResourceTree'
import { useHistory } from 'react-router-dom'
import { useObject } from '../../../hooks/dataTypeHooks'

export const DocumentContext = createContext()

const COPY_CUT_ITEM = {
  items: [],
  parent: null,
  // new parent will be set when pasting
}

const RENAME_ITEM = {
  id: null,
  title: '',
}

const CLIPBOARD_ITEM = { cut: COPY_CUT_ITEM, copy: COPY_CUT_ITEM }

export const DocumentContextProvider = ({ children }) => {
  const history = useHistory()
  const [docId, setDocId] = useState(null)
  const [currentDoc, setCurrentDoc] = useState(null)
  const [selectedDocs, setSelectedDocs] = useState([])
  const [resources, setResources] = useState([])
  const rename = useObject({ start: RENAME_ITEM })
  const clipboard = useObject({ start: CLIPBOARD_ITEM })
  const contextualMenu = useObject()

  const { currentFolder, currentPath, docPath, ...graphQL } = useResourceTree()
  const { id: parentId, children: resourcesInFolder } = currentFolder || {}

  const openResource = resource => {
    if (!resource) return
    const { id, doc = {}, resourceType } = resource
    const variables = { id, resourceType }

    if (resourceType === 'doc') {
      const { identifier } = doc ?? {}
      history.push(`/${identifier}`, { replace: true })
      setCurrentDoc(resource)
      return
    }

    setSelectedDocs([])

    graphQL.openFolder({ variables, fetchPolicy: 'cache-and-network' })
  }

  const createResource = (resourceType, additionalProperties = {}) => {
    return e => {
      if (!parentId) return
      graphQL.addResource({
        variables: { id: parentId, resourceType, ...additionalProperties },
      })
    }
  }

  const renameResource = () => {
    graphQL.renameResource({
      variables: rename.state,
    })
    rename.reset()
  }

  useEffect(() => {
    console.log({ docId, resourcesInFolder })
    const doc = resourcesInFolder?.find(c => c.doc?.identifier === docId)
    doc && setCurrentDoc(doc)
    setResources(resourcesInFolder)
  }, [resourcesInFolder])

  return (
    <DocumentContext.Provider
      value={{
        currentDoc,
        currentPath,
        currentFolder,
        setCurrentDoc,
        openResource,
        createResource,
        graphQL,
        selectedDocs,
        setSelectedDocs,
        rename,
        resourcesInFolder,
        renameResource,
        docId,
        setDocId,
        clipboard,
        docPath,
        contextualMenu,
        resources,
        setResources,
      }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export const useDocumentContext = () => useContext(DocumentContext)
