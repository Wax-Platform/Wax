/* eslint-disable camelcase */
import { useContext } from 'react'
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
  getScrollPercent,
  parseContent,
  safeParse,
  setScrollFromPercent,
} from '../utils'
import {
  CREATE_DOCUMENT,
  DELETE_DOCUMENT,
  GET_DOCUMENTS,
  GET_FILES_FROM_DOCUMENT,
} from '../queries/documentAndSections'

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
    getCtxNode,
    htmlSrc,
    onHistory,
    history,
    setEditorContent,
    setUserPrompt,
    addSnippet,
    addAllNodesToCtx,
    waxRefresh,
    editorContent,
    selectedCtx,
    setFeedback,
    userPrompt,
    markedSnippet,
    userImages,
    setUserImages,
    updatePreview,
    previewRef,
    getCtxBy,
    settings,
    css,
    useRag,
    model,
  } = useContext(AiDesignerContext)

  // #region GQL Hooks ----------------------------------------------------------------

  const client = useApolloClient()

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
      const isSingleNode = getCtxNode() !== htmlSrc

      if (isSingleNode || response?.css) {
        onHistory.addRegistry('undo')
        history.current.source.redo = []
      }

      const actions = {
        css: val => {
          setCss(val)
        },
        snippet: val => {
          setEditorContent(
            parseContent(editorContent, doc => {
              addSnippet(
                doc.querySelector(`[data-aidctx="${selectedCtx.dataRef}"]`),
                val,
              )
              addAllNodesToCtx(doc)
            }),
          )
          waxRefresh()
          // addSnippet(getCtxNode(), val)
        },
        feedback: val => {
          setFeedback(val)
          selectedCtx.history.push({ role: 'assistant', content: val })
        },
        content: val => {
          setEditorContent(
            parseContent(editorContent, dom => {
              const selectedElement = dom.querySelector(
                `[data-aidctx="${selectedCtx.dataRef}"]`,
              )

              selectedElement && (selectedElement.innerHTML = val)
              addAllNodesToCtx(dom)
            }),
          )
          waxRefresh()
        },
        insertHtml: val => {
          setEditorContent(
            parseContent(editorContent, doc => {
              const node = doc.querySelector(
                `[data-aidctx="${selectedCtx.dataRef}"]`,
              )

              addElement(node, {
                ...val,
                position:
                  !voidElements.includes(node.localName) && val.position,
              })
              addAllNodesToCtx(doc)
            }),
          )
          waxRefresh()
        },
        callDallE: async val => {
          await generateImages({
            variables: { input: val },
          }).then(({ data: { generateImages: aiImages } }) => {
            isSingleNode &&
              setEditorContent(
                parseContent(editorContent, doc => {
                  const node = doc.querySelector(
                    `[data-aidctx="${selectedCtx.dataRef}"]`,
                  )

                  addElement(node, {
                    html: `<img class="aid-snip-img-default" src="${aiImages.s3url}" data-imgkey="${aiImages.imageKey}" />`,
                  })
                  addAllNodesToCtx(doc)
                }),
              )
            waxRefresh()
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
          selectedCtx.history.push({
            role: 'assistant',
            content: feedback,
          })
        },
      }

      const actionsToApply = filterKeys(response, k => k)
      const actionsApplied = []

      actionsToApply?.forEach(action => {
        callOn(action, actions, [response[action]])
        actionsApplied.push(action)
      })

      updatePreview(true)
      setUserPrompt('')
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

  // #endregion GQL Hooks ----------------------------------------------------------------
  const handleScroll = e => {
    const iframeElement = previewRef?.current?.contentDocument?.documentElement
    if (!iframeElement) return
    const percentage = Math.round(getScrollPercent(e.target))
    iframeElement.scrollTo(0, setScrollFromPercent(iframeElement, percentage))
  }

  const handleSend = async e => {
    if (loading || userPrompt?.length < 2 || !selectedCtx?.node) return
    e?.preventDefault()

    const input = {
      text: [userPrompt],
      ...(userImages?.base64Img ? { image_url: [userImages.base64Img] } : {}),
    }

    const clampedHistory =
      takeRight(selectedCtx.history, settings.chat.historyMax) || []

    const systemPayload = {
      ctx: selectedCtx ?? getCtxBy('node', htmlSrc),
      sheet: css,
      selectors: getNodes(htmlSrc, '*', 'localName'),
      providedText: selectedCtx?.node !== htmlSrc && getCtxNode().innerHTML,
      markedSnippet,
      snippets: settings.snippetsManager.snippets,
      waxClass: '.ProseMirror[contenteditable]',
    }

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

    selectedCtx.history.push({ role: 'user', content: userPrompt })
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
    handleScroll,
    handleSend,
    updateImageUrl,
    handleImageUpload,
  }

  return values
}

export default useAssistant
