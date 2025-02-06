import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react'
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
  GET_USER_SNIPPETS,
  GET_USER_TEMPLATES,
  UPDATE_TEMPLATE_CSS,
} from '../../../graphql/templates.graphql'
import { getSnippetsStyleTag } from '../../component-ai-assistant/utils'
import { debounce } from 'lodash'

const useTemplates = () => {
  const [masterTemplateId, setMasterTemplateId] = useState(null)
  const [userSnippets, setUserSnippets] = useState([])

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

  const [
    getUserSnippets,
    {
      data: userSnippetsData,
      loading: userSnippetsLoading,
      error: userSnippetsError,
    },
  ] = useLazyQuery(GET_USER_SNIPPETS, {
    fetchPolicy: 'cache-and-network',
  })

  const refetchQueries = [
    { query: GET_USER_TEMPLATES, fetchPolicy: 'cache-and-network' },
    { query: GET_USER_SNIPPETS, fetchPolicy: 'cache-and-network' },
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
    getUserSnippets()
  }, [])

  useEffect(() => {
    if (userSnippetsData?.getUserSnippets) {
      setUserSnippets(userSnippetsData.getUserSnippets)
      const styleTag = getSnippetsStyleTag()
      if (styleTag) {
        styleTag.innerHTML = userSnippetsData.getUserSnippets
          .map(s => s.classBody)
          .join('\n')
      }
    }
  }, [userSnippetsData?.getUserSnippets?.length])

  return {
    systemTemplatesData,
    systemTemplatesLoading,
    systemTemplatesError,
    updateTemplateCss,
    deleteTemplate,
    createTemplate,
    fetchAndCreateTemplateFromUrl,
    fetchingTemplates,
    getUserTemplates,
    getUserSnippets,

    masterTemplateId,
    setMasterTemplateId,
    userSnippets,
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
  const [templateToEdit, setTemplateToEdit] = useState(null)

  const { setCss, updatePreview } = useAiDesignerContext()
  const { currentFolder, currentPath, docPath, ...graphQL } = useResourceTree()
  const templatesGQL = useTemplates()

  const [getDocument, { loading: docLoading }] = useLazyQuery(GET_DOC, {
    fetchPolicy: 'cache-and-network',
    onCompleted: data => {
      const doc = data.getDocument
      history.push(`/${doc.identifier}`, { replace: true })
      setCurrentDoc(doc)
      setCss(doc.template.rawCss)
      // debounce(updatePreview, 2000)(true)
    },
  })

  const getDoc = useCallback(
    params => {
      !docLoading && getDocument(params)
    },
    [docLoading, getDocument],
  )

  const {
    id: parentId,
    children: resourcesInFolder,
    extension,
  } = currentFolder || {}

  const openResource = resource => {
    if (!resource || graphQL.loadingFolder) return
    const { id, doc = {}, resourceType } = resource
    const variables = { id, resourceType }

    if (resourceType === 'doc') {
      const { identifier } = doc
      console.log({ identifier })
      getDoc({ variables: { identifier }, fetchPolicy: 'cache-first' })
      setTemplateToEdit(null)

      return
    }

    setSelectedDocs([])
    console.log('openFolder', { resource })
    graphQL.openFolder({ variables, fetchPolicy: 'cache-and-network' })
  }

  const createResource = (resourceType, additionalProperties = {}) => {
    return e => {
      if (resourceType === 'doc' && !parentId) return
      const parent =
        !['template', 'snip'].includes(extension) &&
        ['template', 'snippet'].includes(resourceType)
          ? null
          : parentId

      graphQL.addResource({
        variables: { id: parent, resourceType, ...additionalProperties },
      })
      resourceType === 'snippet' && templatesGQL.getUserSnippets()
      resourceType === 'template' && templatesGQL.getUserTemplates()
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
        templateToEdit,
        setTemplateToEdit,
        ...templatesGQL,
      }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export const useDocumentContext = () => useContext(DocumentContext)
