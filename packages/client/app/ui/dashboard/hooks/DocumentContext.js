import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react'
import { useDocTree } from './useDocTree'
import { useHistory, useParams } from 'react-router-dom'

export const DocumentContext = createContext()

export const DocumentContextProvider = ({ children }) => {
  const history = useHistory()
  const [currentDoc, setCurrentDoc] = useState(null)
  const [currentDocId, setCurrentDocId] = useState(null)
  const [docTree, setDocTree] = useState([])
  const [sharedDocTree, setSharedDocTree] = useState([])
  const [currentPath, setCurrentPath] = useState('')
  const [currentFolder, setCurrentFolder] = useState({})
  const [selectedDocs, setSelectedDocs] = useState([])
  const [rename, setRename] = useState({ id: null, title: '' })

  const graphQL = useDocTree({
    currentDoc,
    setRename,
    setCurrentPath,
    setCurrentFolder,
    setCurrentDoc,
  })

  const { id: parentId, children: resourcesInFolder } = currentFolder || {}

  const handleResourceClick = resource => {
    if (!resource) return
    console.log({ resource })

    const { id, doc = {}, isFolder } = resource
    const { identifier } = doc ?? {}
    const variables = { id, idType: 'id' }

    if (!isFolder) {
      history.push(`/${identifier}`, { replace: true })
      setCurrentDoc(resource)
      variables.id = identifier
      variables.idType = 'identifier'
    }

    graphQL.openFolder({ variables })
  }

  const createResource =
    (isFolder = false) =>
    e => {
      if (!parentId) return
      graphQL.addResource({
        variables: { id: parentId, isFolder },
      })
    }

  useEffect(() => {
    console.log('CURRENT FOLDER', { resourcesInFolder })
    if (!resourcesInFolder?.length || !currentDocId) return
    currentDoc?.doc?.identifier !== currentDocId &&
      setCurrentDoc(
        resourcesInFolder?.find(({ doc }) => doc?.identifier === currentDocId),
      )
  }, [resourcesInFolder, currentDocId])

  return (
    <DocumentContext.Provider
      value={{
        currentDoc,
        setCurrentDoc,
        docTree,
        setDocTree,
        sharedDocTree,
        setSharedDocTree,
        currentPath,
        setCurrentPath,
        currentFolder,
        setCurrentFolder,
        handleResourceClick,
        createResource,
        graphQL,
        selectedDocs,
        setSelectedDocs,
        rename,
        setRename,
        currentDocId,
        setCurrentDocId,
      }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export const useDocumentContext = () => useContext(DocumentContext)
