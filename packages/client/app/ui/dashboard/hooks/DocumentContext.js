import React, { createContext, useState, useContext, useEffect } from 'react'
import { useResourceTree } from './useResourceTree'
import { useHistory } from 'react-router-dom'
import { useObject } from '../../../hooks/dataTypeHooks'

export const DocumentContext = createContext()

const COPY_CUT_ITEM = {
  items: [],
  parent: null,
  newParent: null,
}

const RENAME_ITEM = {
  id: null,
  title: '',
}

export const DocumentContextProvider = ({ children }) => {
  const history = useHistory()
  const [docId, setDocId] = useState(null)
  const [currentDoc, setCurrentDoc] = useState(null)
  const [selectedDocs, setSelectedDocs] = useState([])
  const rename = useObject({ start: RENAME_ITEM })
  const toCopy = useObject({ start: COPY_CUT_ITEM })
  const toCut = useObject({ start: COPY_CUT_ITEM })
  const contextualMenu = useObject()

  const {
    currentFolder,
    currentPath,
    docPath,
    loadingResource,
    setLoadingResource,
    ...graphQL
  } = useResourceTree()

  const { id: parentId, children: resourcesInFolder } = currentFolder || {}

  const openResource = resource => {
    if (!resource) return
    setLoadingResource(true)
    const { id, doc = {}, resourceType } = resource
    const variables = { id, resourceType }

    if (resourceType === 'doc') {
      const { identifier } = doc ?? {}
      history.push(`/${identifier}`, { replace: true })
      setCurrentDoc(resource)
      variables.id = identifier
      graphQL.getCurrentDocPath({ variables })
      return
    }

    setSelectedDocs([])

    graphQL.openFolder({ variables, fetchPolicy: 'cache-and-network' })
  }

  const createResource = resourceType => {
    return e => {
      if (!parentId) return
      graphQL.addResource({
        variables: { id: parentId, resourceType },
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
    const doc = resourcesInFolder?.find(c => c.doc?.identifier === docId)
    doc && setCurrentDoc(doc)
  }, [resourcesInFolder])

  useEffect(() => {
    currentDoc?.doc?.identifier &&
      graphQL.getCurrentDocPath({
        variables: { id: currentDoc.doc.id },
      })
  }, [docId])

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
        toCopy,
        toCut,
        docPath,
        contextualMenu,
      }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export const useDocumentContext = () => useContext(DocumentContext)
