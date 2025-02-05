/* eslint-disable camelcase */
import { useApolloClient, useLazyQuery, useMutation } from '@apollo/client'
import { debounce, takeRight } from 'lodash'
import { useAiDesignerContext } from './AiDesignerContext'
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

import { useDocumentContext } from '../../dashboard/hooks/DocumentContext'

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
    htmlSrc,
    onHistory,
    history,
    setEditorContent,
    setUserPrompt,
    editorContent,
    selectedCtx,
    setFeedback,
    userPrompt,
    markedSnippet,
    userImages,
    setUserImages,
    updatePreview,
    settings,
    css,
    setCss,
    useRag,
    model,
  } = useAiDesignerContext()

  const { userSnippets, createResource, updateTemplateCss } =
    useDocumentContext()

  // #region GQL Hooks ----------------------------------------------------------------

  const client = useApolloClient()

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
      const isSingleNode = selectedCtx.id !== 'aid-ctx-main'

      if (isSingleNode || response?.css) {
        onHistory.addRegistry('undo')
        history.current.source.redo = []
      }
      const actions = {
        css: val => {
          const { toReplace = [], toAdd } = safeParse(val)
          let clonedCss = css
          toReplace.forEach(({ previous, newCss }) => {
            console.log({ matches: clonedCss.match(previous) })
            clonedCss = clonedCss.replace(previous, newCss)
          })
          toAdd && (clonedCss += `\n${toAdd}`)
          console.log('css', safeParse(val))
          setCss(clonedCss)
          debounce(() => updatePreview(true, clonedCss), 1000)()
          AiDesigner.emit('updateCss', clonedCss)
        },
        snippet: snippet => {
          if (snippet?.id) {
            const rawCss = snippet?.classBody
            const meta = JSON.stringify({
              className: snippet?.className,
              description: snippet?.description,
            })

            updateTemplateCss({
              variables: {
                id: snippet.id,
                rawCss: rawCss,
                meta,
              },
            })
          } else {
            console.log('creating snippet', snippet)
            createResource('snippet', {
              resourceType: 'snippet',
              extension: 'snip',
              title: snippet?.displayName,
              templateProps: JSON.stringify({
                displayName: snippet?.displayName,
                rawCss: snippet.classBody,
                meta: JSON.stringify({
                  className: snippet.className,
                  description: snippet.description,
                }),
                category: 'user-snippets',
                status: 'private',
              }),
            })()
          }

          debounce(() => selectedCtx.snippets.add(`${snippet.className}`), 2000)
        },
        feedback: val => {
          selectedCtx.conversation.push({ role: 'assistant', content: val })
          setFeedback(val)
        },
        content: val => {
          setEditorContent(
            parseContent(editorContent, dom => {
              const selectedElement = dom.querySelector(
                `[data-id="${selectedCtx.id}"]`,
              )

              selectedElement && (selectedElement.innerHTML = val)
            }),
          )
        },
        insertHtml: val => {
          setEditorContent(
            parseContent(editorContent, doc => {
              const node = doc.querySelector(`[data-id="${selectedCtx.id}"]`)

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
      // console.log({ response, actionsApplied })
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

  const handleSend = async e => {
    if (loading || userPrompt?.length < 2) return
    e?.preventDefault()
    setFeedback(userPrompt)
    const userSnippetsShape = userSnippets?.map(t => ({
      className: safeParse(t.meta)?.className,
      description: safeParse(t.meta)?.description,
      classBody: t?.rawCss,
      id: t?.id,
    }))

    const input = {
      text: [userPrompt],
      ...(userImages?.base64Img ? { image_url: [userImages.base64Img] } : {}),
    }

    const clampedHistory =
      takeRight(selectedCtx.conversation, settings.chat.historyMax) || []

    const ContextIsNotDocument = selectedCtx?.id !== 'aid-ctx-main'
    const systemPayload = {
      ctx: AiDesigner.selected,
      sheet: css,
      selectors: getNodes(htmlSrc, '*', 'localName'),
      providedText: ContextIsNotDocument && selectedCtx.node.innerHTML,
      markedSnippet,
      snippets: ContextIsNotDocument && userSnippetsShape,
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
  }

  return values
}

export default useAssistant
