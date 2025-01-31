import React, { createContext, useState, useContext, useEffect } from 'react'
import { useResourceTree } from './useResourceTree'
import { useHistory } from 'react-router-dom'
import { useObject } from '../../../hooks/dataTypeHooks'
import { useLazyQuery, useMutation } from '@apollo/client'
import { GET_DOC } from '../../../graphql'
import { useAiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
import AiDesigner from '../../../AiDesigner/AiDesigner'
import {
  CREATE_TEMPLATE,
  DELETE_TEMPLATE,
  FETCH_AND_CREATE_TEMPLATE_FROM_URL,
  GET_USER_TEMPLATES,
  UPDATE_TEMPLATE_CSS,
} from '../../../graphql/templates.graphql'

const useTemplates = () => {
  const [masterTemplateId, setMasterTemplateId] = useState(null)

  const [
    getUserTemplates,
    {
      data: systemTemplatesData,
      loading: systemTemplatesLoading,
      error: systemTemplatesError,
    },
  ] = useLazyQuery(GET_USER_TEMPLATES, {
    fetchPolicy: 'cache-and-network',
  })

  const refetchQueries = [
    { query: GET_USER_TEMPLATES, fetchPolicy: 'cache-and-network' },
  ]

  const [updateTemplateCss] = useMutation(UPDATE_TEMPLATE_CSS, {
    refetchQueries,
  })
  const [deleteTemplate] = useMutation(DELETE_TEMPLATE, { refetchQueries })
  const [createTemplate] = useMutation(CREATE_TEMPLATE, { refetchQueries })
  const [fetchAndCreateTemplateFromUrl, { loading: fetchingTemplates }] =
    useMutation(FETCH_AND_CREATE_TEMPLATE_FROM_URL, { refetchQueries })

  useEffect(() => {
    getUserTemplates()
  }, [])

  return {
    systemTemplatesData,
    systemTemplatesLoading,
    systemTemplatesError,
    updateTemplateCss,
    deleteTemplate,
    createTemplate,
    fetchAndCreateTemplateFromUrl,
    fetchingTemplates,

    masterTemplateId,
    setMasterTemplateId,
  }
}

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

  const { setCss, updatePreview } = useAiDesignerContext()

  const [getDoc] = useLazyQuery(GET_DOC, {
    fetchPolicy: 'cache-and-network',
    onCompleted: data => {
      const doc = data.getDocument
      history.push(`/${doc.identifier}`, { replace: true })
      setCurrentDoc(doc)
      setCss(doc.template.rawCss)
    },
  })

  const { currentFolder, currentPath, docPath, ...graphQL } = useResourceTree()
  const templatesGQL = useTemplates()
  const { id: parentId, children: resourcesInFolder } = currentFolder || {}

  const openResource = resource => {
    if (!resource || graphQL.loadingFolder) return
    const { id, doc = {}, resourceType } = resource
    const variables = { id, resourceType }

    if (resourceType === 'doc') {
      console.log('isDoc')
      const { identifier } = doc
      console.log({ identifier })
      getDoc({ variables: { identifier } })
      return
    }

    setSelectedDocs([])
    console.log('openFolder', { resource })
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
    console.log({ rename, currentDoc })
    rename.state.id === currentDoc?.resourceId &&
      setCurrentDoc({ ...currentDoc, title: rename.state.title })
    rename.reset()
  }

  useEffect(() => {
    console.log({ docId, resourcesInFolder })

    setResources(resourcesInFolder)
  }, [resourcesInFolder])

  const addToFavs = id => {
    graphQL.addToFavorites({
      variables: { resourceId: id },
    })
  }

  AiDesigner.on('updateCss', css => {
    console.log('Triggered updateSnippets')
    templatesGQL.updateTemplateCss({
      variables: { id: currentDoc.template.id, rawCss: css },
    })
    setCss(css)
    updatePreview(true, css)
  })

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
        addToFavs,
        getDoc,

        // Template
        ...templatesGQL,
      }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export const useDocumentContext = () => useContext(DocumentContext)
