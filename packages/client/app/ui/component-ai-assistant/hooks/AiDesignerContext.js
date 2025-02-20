/* eslint-disable react/jsx-no-constructed-context-values */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { isString, takeRight } from 'lodash'
import {
  SendIcon,
  SettingsIcon,
  DeleteIcon,
  UndoIcon,
  RedoIcon,
  RefreshIcon,
  onEntries,
  srcdoc,
  parseContent,
} from '../utils'
import AiDesigner from '../../../AiDesigner/AiDesigner'
import { snippets } from '../utils/snippets'
import { useLayout } from '../../../hooks/LayoutContext'

export const IMG_GEN_PARAMS = {
  type: [
    '3D',
    '2D',
    'Sketch',
    'Illustration',
    'Cartoon',
    'Realistic',
    'Abstract',
  ],
  style: [
    'Realism',
    'Impressionism',
    'Surrealism',
    'Abstract',
    'Pop Art',
    'Photorealism',
    'Black and White Photography',
    'Sepia Photography',
    'Street Photography',
    'Portrait Photography',
    'Landscape Photography',
    'Macro Photography',
    'Fashion Photography',
    'Documentary Photography',
    'Fine Art Photography',
  ],
  colors: [
    'Sepia',
    'Black and White',
    'Vibrant',
    'Muted',
    'Pastel',
    'Monochrome',
    'Warm',
    'Cool',
  ],
  media: [
    'DSLR Camera, 24MP',
    'Mirrorless Camera, 20MP',
    'Point and Shoot Camera, 16MP',
    'Medium Format Camera, 50MP',
    'Large Format Camera, 100MP',
    'Film Camera, 35mm',
    'Polaroid Camera, Instant Film',
    'Smartphone Camera, 12MP',
    'Oil Painting',
    'Watercolor',
    'Acrylic Painting',
    'Charcoal Drawing',
    'Pencil Sketch',
    'Digital Art',
    '3D Render',
  ],
}

const DEFAULT_IMG_GEN_PARAMS = {
  type: '2D',
  style: 'Realism',
  colors: 'Vibrant',
  media: 'DSLR Camera, 24MP',
}

const generateAppCss = userMenu => /* css */ `      

body, html {
    width: 100%;
    margin: 0;
    box-sizing: border-box;
}

body {
  display: flex;
  align-items: center;
  justify-content: center;

    transform: scale(${userMenu ? 0.8 : 1});
    transform-origin: top left;
    transition: transform 0.3s;
    width: 100%;
}

.pagedjs_page {
    background: #fff;
    box-shadow: 0 0 8px #0004;

    * {
      transition: all 0.8s;
      outline: 2px dashed #0000;
      outline-offset: 12px;
    }
}

.pagedjs_pages {
  padding: 0;
}

.pagedjs_area {
  padding-right: 0;
  padding-left: 0;
}
      
.selected-id {
    outline: 1px dashed #a34ba1;
    outline-offset: 8px;
}

::-webkit-scrollbar {
    height: 5px;
    width: 5px;
}

::-webkit-scrollbar-thumb {
    background: #a34ba11d;
    border-radius: 5px;
    width: 5px;
}

::-webkit-scrollbar-track {
    background: #fff0;
    padding: 5px;
}
`

const defaultSettings = {
  gui: {
    showChatBubble: false,
    advancedTools: true,
  },
  editor: {
    contentEditable: true,
    enablePaste: true,
    displayStyles: false,
    enableSelection: true,
    selectionColor: {
      bg: 'var(--color-blue-alpha-2)',
      border: 'var(--color-blue-alpha-1)',
    },
  },
  snippetsManager: {
    enableSnippets: true,
    showCssByDefault: true,
    createNewSnippetVersions: false,
    markNewSnippet: true,
    snippets,
  },
  Icons: {
    SendIcon,
    SettingsIcon,
    DeleteIcon,
    UndoIcon,
    RedoIcon,
    RefreshIcon,
  },
  chat: {
    historyMax: 6,
  },
  preview: {
    livePreview: true,
  },
}

export const AiDesignerContext = createContext()

// eslint-disable-next-line react/prop-types
export const AiDesignerProvider = ({ children }) => {
  // #region HOOKS ----------------------------------------------------------------
  const { userMenuOpen } = useLayout()

  const history = useRef({
    prompts: { active: true, index: 0 },
    source: { redo: [], undo: [], limit: { undo: 20, redo: 20 } },
  })

  const selectionBoxRef = useRef(null)
  const promptRef = useRef(null)
  const editorContainerRef = useRef(null)
  const previewRef = useRef(null)

  const [selectedCtx, setSelectedCtx] = useState([])

  const [htmlSrc, setHtmlSrc] = useState(null)
  const [css, setCss] = useState('')
  const [previewSource, setPreviewSource] = useState('')
  const [editorContent, setEditorContent] = useState('')
  const [markedSnippet, setMarkedSnippet] = useState({})

  const [feedback, setFeedback] = useState('')

  const [settings, setSettings] = useState(defaultSettings)
  const [useRag, setUseRag] = useState(false)
  const [model, setModel] = useState(['openAi', 'gpt-4o', 'GPT-4o'])
  const [userImages, setUserImages] = useState('')
  const [showSnippets, setShowSnippets] = useState(false)
  const [userPrompt, setUserPrompt] = useState('')
  const [designerOn, setDesignerOn] = useState(false)
  const [imgGenParams, setImgGenParams] = useState(DEFAULT_IMG_GEN_PARAMS)

  // const [userInput, setUserInput] = useState({
  //   text: [''],
  //   image_url: [{ base64Img: '', src: '' }],
  //   useRag: false,
  //   model: ['openAi', 'gpt-4o', 'GPT-4o'],
  // })

  const [tools, setTools] = useState({
    dropper: { active: false, data: '' },
    brush: { active: false, data: '', properties: {} },
    paintBucket: { active: false, data: '', properties: {} },
  })

  const [userInteractions, setUserInteractions] = useState({
    mousedown: false,
    mousemove: false,
    shift: false,
    ctrl: false,
    alt: false,
  })

  const mutateSettings = updateObjectStateFromKey(setSettings)
  const updateTools = updateObjectStateFromKey(setTools)

  const getCtxNode = (dom = document) =>
    dom.querySelector(`[data-id="${selectedCtx.id}"]`)

  const onSelect = ctx => {
    ctx.id && setSelectedCtx(ctx)

    markedSnippet && setMarkedSnippet({})
    showSnippets && setShowSnippets(false)
    if (ctx.id === 'aid-ctx-main') return
  }

  AiDesigner.on('select', onSelect)
  // AiDesigner.on('addtocontext', console.log)
  AiDesigner.on('snippets', ev => {
    const { classes, selected, method } = ev
    const body = previewRef?.current?.contentDocument?.body
    const elements = body.querySelectorAll(`[data-id="${selected}"]`)
    elements.forEach(element => element.classList[method](...classes))
  })
  // #endregion HOOKS ----------------------------------------------------------------

  // #region CONTEXT ----------------------------------------------------------------

  const clearHistory = () => {
    selectedCtx.conversation = []
    setSelectedCtx({ ...selectedCtx })
  }

  const deleteLastMessage = () => {
    const newHistory = [...selectedCtx.conversation]
    newHistory.pop()
    selectedCtx.conversation = newHistory
    setSelectedCtx({ ...selectedCtx })
  }

  // #endregion CONTEXT -------------------------------------------------------------

  // #region HELPERS -----------------------------------------------------------------

  const onHistory = {
    addRegistry: (
      regKey,
      registry = {
        css,
        content: editorContent,
      },
    ) => {
      if (!registry.content || !css) return
      const { source } = history.current

      const newRegistry = {
        undo: takeRight(source.undo.concat(registry), source.limit.undo),
        redo: takeRight(source.redo.concat(registry), source.limit.redo),
      }

      history.current.source[regKey] = newRegistry[regKey]
    },
    apply: regKey => {
      const { source } = history.current

      if (source[regKey].length < 1) return
      const lastRegistry = source[regKey].pop()

      onHistory.addRegistry(regKey === 'undo' ? 'redo' : 'undo', {
        css,
        content: editorContent,
      })

      setCss(lastRegistry.css)
      // updatePreview(true, lastRegistry.css)
    },
  }

  const updatePreview = (manualUpdate, providedCss = css) => {
    const previewDoc = previewRef?.current?.contentDocument?.documentElement
    const canUpdate =
      providedCss &&
      htmlSrc?.outerHTML &&
      (settings.preview.livePreview || manualUpdate)

    if (canUpdate) {
      console.log('updatePreview')

      const content = parseContent(
        editorContainerRef?.current?.querySelector(
          '.ProseMirror[contenteditable]',
        ).innerHTML,
        doc => {
          !!selectedCtx?.node &&
            doc
              .querySelector(`[data-id="${selectedCtx.id}"]`)
              ?.classList?.add('selected-id')
          doc.querySelectorAll('.ProseMirror-widget').forEach(el => {
            el.remove()
          })
        },
      )
      const cssTemplate =
        providedCss.replaceAll(
          '.ProseMirror[contenteditable]',
          '.pagedjs_page_content',
        ) + generateAppCss(userMenuOpen)

      const scrollPos = previewDoc?.scrollTop ?? 0

      setPreviewSource(srcdoc(content, cssTemplate, '', scrollPos))
    }

    // updateCtxNodes()
  }
  const callUpdatePreview = useCallback(updatePreview, [css, editorContent])

  // #endregion HELPERS -----------------------------------------------------------------

  // #region SNIPPETS -------------------------------------------------------------------

  const removeSnippet = snippetName => {
    const updatedSnippets = settings.snippetsManager.snippets

    const removeSnip = name => {
      const index = updatedSnippets.findIndex(s => s.className === name)
      updatedSnippets.splice(index, 1)
    }

    isString(snippetName)
      ? removeSnip(snippetName)
      : Array.isArray(snippetName) && snippetName.forEach(removeSnip)
  }

  // #endregion SNIPPETS -------------------------------------------------------------------

  const ctx = useMemo(() => {
    return {
      history,
      selectedCtx,
      setSelectedCtx,
    }
  }, [history, selectedCtx])

  const chatGpt = useMemo(() => {
    return {
      css,
      htmlSrc,
      feedback,
      userPrompt,
      userImages,
      setCss,
      setHtmlSrc,
      setFeedback,
      setUserImages,
      setUserPrompt,
    }
  }, [css, htmlSrc, feedback, userPrompt, userImages])

  return (
    <AiDesignerContext.Provider
      value={{
        ...ctx,
        ...chatGpt,
        promptRef,
        clearHistory,
        editorContent,
        selectionBoxRef,
        setEditorContent,
        deleteLastMessage,
        onHistory,
        settings,
        setSettings,
        // TODO: memoize in a new object
        removeSnippet,
        markedSnippet,
        setMarkedSnippet,
        editorContainerRef,

        previewRef,
        previewSource,
        setPreviewSource,
        updatePreview: callUpdatePreview,
        mutateSettings,
        getCtxNode,
        updateTools,
        showSnippets,
        setShowSnippets,
        tools,
        useRag,
        setUseRag,
        model,
        setModel,
        designerOn,
        setDesignerOn,
        userInteractions,
        setUserInteractions,
        imgGenParams,
        setImgGenParams,
      }}
    >
      {children}
    </AiDesignerContext.Provider>
  )
}

function updateObjectStateFromKey(stateDispatcher) {
  return (setting, value, cancel) => {
    stateDispatcher(prev => {
      const temp = { ...prev }
      temp[setting] = { ...(temp[setting] || {}), ...value }
      cancel?.length > 0 &&
        cancel.forEach(
          tool => tool !== setting && temp[tool] && (temp[tool].active = false),
        )
      return temp
    })
  }
}

function updateObjectState(stateDispatcher) {
  return options => {
    stateDispatcher(prev => {
      const temp = { ...prev }
      onEntries(options, (k, v) => {
        temp[k] = v
      })
      return temp
    })
  }
}

export const useAiDesignerContext = () => useContext(AiDesignerContext)
