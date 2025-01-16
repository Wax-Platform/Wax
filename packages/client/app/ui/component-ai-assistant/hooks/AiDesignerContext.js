/* eslint-disable react/jsx-no-constructed-context-values */
import React, { createContext, useMemo, useRef, useState } from 'react'
import { isString, merge, takeRight } from 'lodash'
import {
  setInlineStyle,
  SendIcon,
  SettingsIcon,
  DeleteIcon,
  UndoIcon,
  RedoIcon,
  RefreshIcon,
  newSnippet,
  saveToLs,
  onEntries,
  cssTemplate1,
  snippetsToCssText,
  srcdoc,
  parseContent,
} from '../utils'
import AiDesigner from '../../../AiDesigner/AiDesigner'
import { snippets } from '../utils/snippets'
import { UPDATE_SNIPPETS } from '../../../graphql/aiDesignerMisc'
import { useMutation } from '@apollo/client'

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
  const [markedSnippet, setMarkedSnippet] = useState('')

  const [feedback, setFeedback] = useState('')

  const [settings, setSettings] = useState(defaultSettings)
  const [useRag, setUseRag] = useState(false)
  const [model, setModel] = useState(['openAi', 'gpt-4o', 'GPT-4o'])
  const [userImages, setUserImages] = useState('')
  const [showSnippets, setShowSnippets] = useState(false)
  const [userPrompt, setUserPrompt] = useState('')
  const [designerOn, setDesignerOn] = useState(false)
  const [docId, setDocId] = useState('')

  // const [userInput, setUserInput] = useState({
  //   text: [''],
  //   image_url: [{ base64Img: '', src: '' }],
  //   useRag: false,
  //   model: ['openAi', 'gpt-4o', 'GPT-4o'],
  // })

  const [layout, setLayout] = useState({
    preview: false,
    editor: true,
    chat: false,
    input: true,
    settings: false,
    files: true,
    teams: false,
    userMenu: true,
    templateManager: false,
  })

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

  const updateLayout = updateObjectState(setLayout)
  const mutateSettings = updateObjectStateFromKey(setSettings)
  const updateTools = updateObjectStateFromKey(setTools)

  const getCtxNode = (dom = document) =>
    dom.querySelector(`[data-id="${selectedCtx.id}"]`)

  const onSelect = ctx => {
    ctx.id && setSelectedCtx(ctx)

    markedSnippet && setMarkedSnippet('')
    showSnippets && setShowSnippets(false)
    if (ctx.id === 'aid-ctx-main') return

    // TODO: this should be moved to a separate function
    // const node = ctx.node
    // tools.dropper.active && updateTools('brush', { data: node.className })
    // tools.brush.active &&
    //   tools.brush.data &&
    //   AiDesigner.snippets.toggle(tools.brush.data)
  }
  const [updateSnippets] = useMutation(UPDATE_SNIPPETS)

  AiDesigner.on('select', onSelect)
  AiDesigner.on('addtocontext', console.log)
  AiDesigner.on('snippets', updatePreview)
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

  const updateSelectionBoxPosition = (yOffset = 10, xOffset = 10) => {
    if (!settings.editor.enableSelection && !selectionBoxRef?.current) return
    if (selectedCtx.id === 'aid-ctx-main' || !designerOn) {
      selectionBoxRef.current.style.opacity = 0
      return
    }
    const { top, left, height, width } =
      selectedCtx.node?.getBoundingClientRect() ?? {}

    if (!left && !top) return

    const parent = selectionBoxRef?.current?.parentNode
    const { left: pLeft, top: pTop } = parent.getBoundingClientRect()

    setInlineStyle(selectionBoxRef.current, {
      opacity: 1,
      left: `${Math.floor(parent.scrollLeft + left - pLeft - xOffset)}px`,
      top: `${Math.floor(parent.scrollTop + top - pTop - yOffset)}px`,
      width: `${width + xOffset * 2}px`,
      height: `${height + yOffset * 2}px`,
      zIndex: '9',
    })
  }

  const saveSession = () => {
    saveToLs(
      {
        settings,
        css,
        content: htmlSrc.innerHtml,
      },
      'storedsession',
    )
  }

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

      setEditorContent(lastRegistry.content)
      setCss(lastRegistry.css)
    },
  }

  const updatePreview = manualUpdate => {
    const previewDoc = previewRef?.current?.contentDocument?.documentElement
    css &&
      htmlSrc?.outerHTML &&
      (settings.preview.livePreview || manualUpdate) &&
      setPreviewSource(
        srcdoc(
          parseContent(
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
          ),
          css.replaceAll(
            '.ProseMirror[contenteditable]',
            '.pagedjs_page_content',
          ),
          cssTemplate1.replaceAll(
            '.ProseMirror[contenteditable]',
            '.pagedjs_page_content',
          ) +
            snippetsToCssText(
              settings.snippetsManager.snippets,
              '.pagedjs_page_content .aid-snip-',
            ),
          previewDoc?.scrollTop ?? 0,
        ),
      )

    // updateCtxNodes()
  }

  // #endregion HELPERS -----------------------------------------------------------------

  // #region SNIPPETS -------------------------------------------------------------------
  const addSnippet = (add, snippet) => {
    const { snippets, createNewSnippetVersions, markNewSnippet } =
      settings.snippetsManager
    const snippetToAdd = !createNewSnippetVersions
      ? snippet
      : newSnippet(
          snippet,
          snippets.map(s => s.className),
        )

    const foundIndex = snippets.findIndex(
      s => s.className === snippetToAdd.className,
    )

    let finalOutput = [...snippets]
    foundIndex >= 0
      ? (finalOutput[foundIndex] = snippetToAdd)
      : (finalOutput = [...finalOutput, snippetToAdd])

    setSettings(prev => {
      const temp = prev
      temp.snippetsManager.snippets = finalOutput
      return temp
    })
    updateSnippets({ variables: { snippets: finalOutput } })

    add && selectedCtx.snippets.add(`aid-snip-${snippetToAdd.className}`)
    markNewSnippet && !markedSnippet && setMarkedSnippet(snippetToAdd.className)
  }

  const removeSnippet = snippetName => {
    const updatedSnippets = settings.snippetsManager.snippets

    const removeSnip = name => {
      const index = updatedSnippets.findIndex(s => s.className === name)
      updatedSnippets.splice(index, 1)
    }

    isString(snippetName)
      ? removeSnip(snippetName)
      : Array.isArray(snippetName) && snippetName.forEach(removeSnip)

    setSettings(prev => {
      return merge(
        {},
        { ...prev },
        { snippetsManager: { snippets: updatedSnippets } },
      )
    })
    updateSnippets({ variables: { snippets: updatedSnippets } })
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
        layout,
        updateLayout,
        clearHistory,
        editorContent,
        selectionBoxRef,
        setEditorContent,
        updateSelectionBoxPosition,
        deleteLastMessage,
        onHistory,
        settings,
        setSettings,
        // TODO: memoize in a new object
        addSnippet,
        removeSnippet,
        markedSnippet,
        setMarkedSnippet,
        saveSession,
        editorContainerRef,

        previewRef,
        previewSource,
        setPreviewSource,
        updatePreview,
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
        docId,
        setDocId,
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
