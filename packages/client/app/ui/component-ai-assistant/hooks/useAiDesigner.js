/* eslint-disable camelcase */
import { useContext, useEffect } from 'react'
import { useApolloClient, useLazyQuery, useMutation } from '@apollo/client'
import { takeRight } from 'lodash'
import { AiDesignerContext } from './AiDesignerContext'
import { GET_SETTINGS, UPDATE_SETTINGS } from '../queries/settings'
import {
  CALL_AI_SERVICE,
  GENERATE_IMAGES,
  GET_IMAGES_URL,
  GET_IMAGE_URL,
  RAG_SEARCH_QUERY,
} from '../queries/aiService'
import {
  AiDesignerSystem,
  addElement,
  callOn,
  filterKeys,
  finishReasons,
  getNodes,
  parseContent,
  safeParse,
} from '../utils'
import {
  CREATE_DOCUMENT,
  DELETE_DOCUMENT,
  GET_DOCUMENTS,
  GET_FILES_FROM_DOCUMENT,
} from '../queries/documentAndSections'
import AiDesigner from '../../../AiDesigner/AiDesigner'
import {
  GET_AID_MISC,
  GET_AID_MISC_BY_ID,
  GET_CSS,
} from '../../../graphql/aiDesignerMisc'

const voidElements = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]

const useAssistant = () => {
  const {
    setCss,
    htmlSrc,
    onHistory,
    history,
    setEditorContent,
    setUserPrompt,
    addSnippet,
    editorContent,
    selectedCtx,
    setFeedback,
    userPrompt,
    markedSnippet,
    userImages,
    setUserImages,
    updatePreview,
    settings,
    setSettings,
    css,
    useRag,
    model,
    docId,
  } = useContext(AiDesignerContext)

  // #region GQL Hooks ----------------------------------------------------------------

  const client = useApolloClient()
  useEffect(() => {
    console.log('selected:', selectedCtx)
  }, [selectedCtx])
  // const currentUser = useCurrentUser()

  const [getSettings] = useLazyQuery(GET_SETTINGS)

  const [updateSettings] = useMutation(UPDATE_SETTINGS)

  const [getGeneratedImages, { data: imageUrls }] = useLazyQuery(
    GET_IMAGES_URL,
    {
      variables: { size: 'medium' },
    },
  )

  const [generateImages, { loading: dalleLoading }] =
    useLazyQuery(GENERATE_IMAGES)

  const [callAiService, { loading, error }] = useLazyQuery(CALL_AI_SERVICE, {
    onCompleted: async ({ aiService }) => {
      // eslint-disable-next-line camelcase
      const { message, finish_reason } = JSON.parse(aiService)
      const response = safeParse(message.content, 'default')
      const isSingleNode = selectedCtx.aidctx !== 'aid-ctx-main'

      if (isSingleNode || response?.css) {
        onHistory.addRegistry('undo')
        history.current.source.redo = []
      }

      const actions = {
        css: async val => {
          getCssTemplate({ variables: { docId, css: val } })
        },
        snippet: val => {
          addSnippet(null, val)
          selectedCtx.snippets.add(`aid-snip-${val.className}`)
        },
        feedback: val => {
          selectedCtx.conversation.push({ role: 'assistant', content: val })
          setFeedback(val)
        },
        content: val => {
          setEditorContent(
            parseContent(editorContent, dom => {
              const selectedElement = dom.querySelector(
                `[data-aidctx="${selectedCtx.aidctx}"]`,
              )

              selectedElement && (selectedElement.innerHTML = val)
            }),
          )
        },
        insertHtml: val => {
          setEditorContent(
            parseContent(editorContent, doc => {
              const node = doc.querySelector(
                `[data-aidctx="${selectedCtx.aidctx}"]`,
              )

              addElement(node, {
                ...val,
                position:
                  !voidElements.includes(node.localName) && val.position,
              })
            }),
          )
        },
        callDallE: async val => {
          await generateImages({
            variables: { input: val },
          }).then(({ data: { generateImages: aiImages } }) => {
            isSingleNode &&
              AiDesigner.insertImage({
                src: aiImages.s3url,
                'data-imagekey': aiImages.imageKey,
              })
            client.refetchQueries({
              include: [GET_IMAGES_URL],
            })
          })
        },
        default: () => {
          const feedback =
            finishReasons[finish_reason] ??
            'The requested AI service is currently unavaiable\n Please, try again in a few seconds'

          setFeedback(feedback)
          selectedCtx.conversation.push({
            role: 'assistant',
            content: feedback,
          })
        },
      }

      const actionsToApply = filterKeys(response, Boolean)
      const actionsApplied = []

      actionsToApply?.forEach(action => {
        callOn(action, actions, [response[action]])
        actionsApplied?.push(action)
      })

      debounce(() => updatePreview(true), 500)()
    },
  })

  const [getImageUrl] = useLazyQuery(GET_IMAGE_URL)

  const [getDocuments, { data: documents }] = useLazyQuery(GET_DOCUMENTS)

  const [createDocument] = useMutation(CREATE_DOCUMENT, {
    refetchQueries: [GET_DOCUMENTS],
  })

  const [deleteDocument] = useMutation(DELETE_DOCUMENT, {
    refetchQueries: [GET_DOCUMENTS],
  })

  const [getSlicedChunksFromDocument, { loading: slicedChunksLoading }] =
    useLazyQuery(GET_FILES_FROM_DOCUMENT)

  const [ragSearchQuery, { loading: ragSearchLoading }] =
    useLazyQuery(RAG_SEARCH_QUERY)

  const [getAidMisc, { data: aidMisc }] = useMutation(GET_AID_MISC, {
    onCompleted: ({ getOrCreateAidMisc: { snippets } }) => {
      setSettings(prev => {
        const temp = prev
        temp.snippetsManager.snippets = snippets
        return temp
      })
    },
  })
  const [getAidMiscById] = useLazyQuery(GET_AID_MISC_BY_ID)
  const [getCssTemplate] = useLazyQuery(GET_CSS, {
    onCompleted: async ({ getCssTemplate: { css } }) => {
      setCss(css)
    },
  })

  // #endregion GQL Hooks ----------------------------------------------------------------

  const handleSend = async e => {
    if (loading || userPrompt?.length < 2) return
    e?.preventDefault()
    setFeedback(userPrompt)

    const input = {
      text: [userPrompt],
      ...(userImages?.base64Img ? { image_url: [userImages.base64Img] } : {}),
    }

    const clampedHistory =
      takeRight(selectedCtx.conversation, settings.chat.historyMax) || []

    const systemPayload = {
      ctx: AiDesigner.selected,
      sheet: css,
      selectors: getNodes(htmlSrc, '*', 'localName'),
      providedText:
        selectedCtx?.aidctx !== 'aid-ctx-main' && selectedCtx.node.innerHTML,
      markedSnippet,
      snippets:
        selectedCtx?.aidctx !== 'aid-ctx-main' &&
        settings.snippetsManager.snippets,
      waxClass: '.ProseMirror[contenteditable]',
    }

    selectedCtx.conversation.push({ role: 'user', content: userPrompt })
    const system = AiDesignerSystem(systemPayload)

    if (useRag) {
      const {
        data: { ragSearch },
      } = await ragSearchQuery({
        variables: {
          input,
          embeddingOptions: { threshold: 0.9, limit: 20 },
          resultsOnly: true,
        },
      })

      const embeddingsContent = JSON.parse(ragSearch).join('\n')

      system.task += `\n\t- 'user' may provide some document fragments to contextualize its queries, you will see that on the context block`
      system.context += `\n\t- This is the content retrieved from the documents: \nBLOCK DOCUMENTS:\n${embeddingsContent}\nEND BLOCK DOCUMENTS`
    }

    callAiService({
      variables: {
        input,
        system,
        history: clampedHistory,
        model,
      },
    })
    setUserPrompt('')
  }

  const updateImageUrl = async (imagekey, cb) =>
    getImageUrl({ variables: { imagekey } }).then(cb)

  const handleImageUpload = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()

    reader.onload = ({ target: { result: base64Img } }) => {
      setUserImages({ base64Img, src: '' })
    }

    reader.readAsDataURL(file)
    e.target.value = null
  }

  const values = {
    getSettings,
    updateSettings,
    getGeneratedImages,
    imageUrls,
    dalleLoading,
    callAiService,
    loading,
    error,
    getImageUrl,
    getDocuments,
    documents,
    createDocument,
    deleteDocument,
    getSlicedChunksFromDocument,
    slicedChunksLoading,
    ragSearchQuery,
    ragSearchLoading,
    // handleScroll,
    handleSend,
    updateImageUrl,
    handleImageUpload,
    getAidMisc,
    getAidMiscById,
    aidMisc,
    getCssTemplate,
  }

  return values
}

export default useAssistant
