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
import { GET_DOC, UPDATE_DOCUMENT_TEMPLATE } from '../../../graphql'
import { useAiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
import AiDesigner from '../../../AiDesigner/AiDesigner'
import {
  CREATE_TEMPLATE,
  DELETE_TEMPLATE,
  FETCH_AND_CREATE_TEMPLATE_FROM_URL,
  GET_TEMPLATE,
  GET_USER_SNIPPETS,
  GET_USER_TEMPLATES,
  UPDATE_TEMPLATE_CSS,
} from '../../../graphql/templates.graphql'
import { createOrUpdateStyleSheet } from '../../component-ai-assistant/utils'
import { debounce } from 'lodash'

const useTemplates = currentDoc => {
  const [masterTemplateId, setMasterTemplateId] = useState(null)
  const [userSnippets, setUserSnippets] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  const [getTemplate] = useLazyQuery(GET_TEMPLATE, {
    fetchPolicy: 'no-cache',
    onCompleted: data => {
      console.log('getTemplate', data)
      setSelectedTemplate(data.getTemplate)
    },
  })

  const [
    getUserTemplates,
    {
      data: userTemplatesData,
      loading: systemTemplatesLoading,
      error: systemTemplatesError,
    },
  ] = useLazyQuery(GET_USER_TEMPLATES, {
    fetchPolicy: 'cache-and-network',
    onCompleted: data => {
      console.log('getUserTemplates', data)
      !selectedTemplate && setSelectedTemplate(data.getUserTemplates[0])
    },
  })

  const [getUserSnippets] = useLazyQuery(GET_USER_SNIPPETS, {
    fetchPolicy: 'cache-and-network',
    onCompleted: data => {
      setUserSnippets(data.getUserSnippets)
    },
  })

  const refetchQueries = [
    { query: GET_USER_TEMPLATES, fetchPolicy: 'cache-and-network' },
    { query: GET_USER_SNIPPETS, fetchPolicy: 'cache-and-network' },
  ]

  const [updateTemplateCss] = useMutation(UPDATE_TEMPLATE_CSS, {
    refetchQueries,
    onCompleted: data => {
      console.log('updateTemplateCss', data)
      const id = data.updateTemplateCss
      id === currentDoc?.templateId && getTemplate({ variables: { id } })
      getUserSnippets()
    },
  })
  const [deleteTemplate] = useMutation(DELETE_TEMPLATE, { refetchQueries })
  const [fetchAndCreateTemplateFromUrl, { loading: fetchingTemplates }] =
    useMutation(FETCH_AND_CREATE_TEMPLATE_FROM_URL, { refetchQueries })

  return {
    userTemplatesData,
    systemTemplatesLoading,
    systemTemplatesError,
    updateTemplateCss,
    deleteTemplate,
    fetchAndCreateTemplateFromUrl,
    fetchingTemplates,
    getUserTemplates,
    getUserSnippets,

    masterTemplateId,
    setMasterTemplateId,
    userSnippets,
    setUserSnippets,
    selectedTemplate,
    setSelectedTemplate,
    getTemplate: id => getTemplate({ variables: { id } }),
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
  const clipboard = useObject({ start: CLIPBOARD_ITEM, onUpdate: console.log })
  const contextualMenu = useObject()
  const [templateToEdit, setTemplateToEdit] = useState(null)

  const { setCss, updatePreview } = useAiDesignerContext()
  const { currentFolder, currentPath, ...graphQL } = useResourceTree()
  const templatesGQL = useTemplates(currentDoc)

  const [getDocument, { loading: docLoading }] = useLazyQuery(GET_DOC, {
    fetchPolicy: 'cache-and-network',
    onCompleted: data => {
      const doc = data.getDocument
      document.title = doc.title
      setCurrentDoc(doc)
      graphQL.openFolder({
        variables: { id: doc.identifier, resourceType: 'doc' },
      })
      templatesGQL.getTemplate(doc.templateId).then(({ data }) => {
        setCss(data.getTemplate.rawCss)
        debounce(updatePreview, 2000)(true, data.getTemplate.rawCss)
      })
    },
  })

  const getDoc = useCallback(
    identifier => {
      !docLoading &&
        !currentFolder?.parentId &&
        getDocument({ variables: { identifier } })
    },
    [docLoading, getDocument, currentFolder?.parentId],
  )

  const [updateDocTemplate] = useMutation(UPDATE_DOCUMENT_TEMPLATE, {
    refetchQueries: [
      { query: GET_USER_TEMPLATES, fetchPolicy: 'cache-and-network' },
    ],
  })

  const updateCurrentDocTemplate = templateId => {
    updateDocTemplate({
      variables: { id: currentDoc.id, templateId },
    })
    setCurrentDoc({ ...currentDoc, templateId })
  }

  const {
    id: parentId,
    children: resourcesInFolder,
    extension,
  } = currentFolder || {}

  const openResource = resource => {
    if (!resource || graphQL.loadingFolder) return
    const { id, resourceType } = resource
    const variables = { id, resourceType }

    if (resourceType === 'doc') {
      const { doc } = resource
      const { identifier, templateId, title } = doc
      history.push(`/${identifier}`, { replace: true })
      document.title = title

      setCurrentDoc({ ...doc })
      templatesGQL.getTemplate(templateId).then(({ data }) => {
        setCss(data.getTemplate.rawCss)
        debounce(updatePreview, 2500)(true)
      })

      templateToEdit && setTemplateToEdit(null)
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
      resourceType === 'snippet' &&
        templatesGQL.getUserSnippets({ fetchPolicy: 'network-only' })
      resourceType === 'template' &&
        templatesGQL.getUserTemplates({ fetchPolicy: 'network-only' })
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
    setResources(resourcesInFolder)
  }, [resourcesInFolder])

  const addToFavs = id => {
    graphQL.addToFavorites({
      variables: { resourceId: id },
    })
  }

  AiDesigner.on('updateCss', css => {
    templatesGQL.updateTemplateCss({
      variables: { id: currentDoc.templateId, rawCss: css },
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
        contextualMenu,
        resources,
        setResources,
        addToFavs,
        getDoc,

        // Template
        templateToEdit,
        setTemplateToEdit,
        updateCurrentDocTemplate,
        ...templatesGQL,
      }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export const useDocumentContext = () => useContext(DocumentContext)
