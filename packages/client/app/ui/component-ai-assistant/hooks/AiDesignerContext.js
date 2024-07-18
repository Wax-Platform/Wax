/* eslint-disable react/jsx-no-constructed-context-values */
import React, { createContext, useMemo, useRef, useState } from 'react'
import { entries, isString, merge, takeRight } from 'lodash'
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
  initialPagedJSCSS,
} from '../utils'
import AiDesigner from '../../../AiDesigner/AiDesigner'

const defaultSettings = {
  gui: {
    showChatBubble: false,
    advancedTools: true,
  },
  editor: {
    contentEditable: true,
    enablePaste: true,
    displayStyles: true,
    enableSelection: false,
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
    snippets: [
      {
        className: 'red-color',
        elementType: 'p',
        description: 'red color',
        classBody: 'color: red;',
      },
      {
        className: 'img-default',
        elementType: 'img',
        description: 'Default styles for images',
        classBody: 'width: 100%; height: auto; object-fit: contain;',
      },
      {
        className: 'excel-table',
        elementType: 'table',
        description:
          'Styles the table to resemble an Excel spreadsheet with professional styling.',
        classBody:
          "border-collapse: collapse; width: 100%;\n  th, td {\n    border: 1px solid #dddddd;\n    text-align: left;\n    padding: 8px;\n  }\n  th {\n    background-color: #f2f2f2;\n    color: #333;\n  }\n  tr:nth-child(even) {\n    background-color: #f9f9f9;\n  }\n  tr:hover {\n    background-color: #f1f1f1;\n  }\n  td {\n    font-family: Arial, sans-serif;\n  }\n  th {\n    font-family: 'Calibri', sans-serif;\n    font-weight: bold;\n  }\n",
      },
      {
        className: 'text-flow-around-image',
        elementType: 'any',
        description: 'Makes the text flow around the images',
        classBody: `img, figure, picture, svg {\n\tfloat: left;\n\tmargin-right: 2ch;\n}\np {\n\ttext-align: justify;\n}`,
      },
      {
        className: 'scale',
        elementType: 'any',
        description: 'scales the element',
        classBody: 'transform: scale(1.1);',
      },
      {
        className: 'grayscale',
        elementType: 'any',
        description: 'grayscale the element',
        classBody: 'filter: grayscale(100%);',
      },
      // {
      //   className: 'tibetan-to-phonetics',
      //   description:
      //     'this is the snippet applied to all tibetan to phonetics translations',
      //   classBody: 'color: red;\nfont-style: italic;',
      //   elementType: 'any',
      // },
    ],
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
  const previewScrollTopRef = useRef(0)
  const promptRef = useRef(null)
  const editorContainerRef = useRef(null)
  const previewRef = useRef(null)

  const [selectedCtx, setSelectedCtx] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)

  const [htmlSrc, setHtmlSrc] = useState(null)
  const [css, setCss] = useState(initialPagedJSCSS)
  const [previewSource, setPreviewSource] = useState('<h1>Nothing</h1>')
  const [editorContent, setEditorContent] = useState('')
  const [markedSnippet, setMarkedSnippet] = useState('')

  const [feedback, setFeedback] = useState('')

  const [settings, setSettings] = useState(defaultSettings)
  const [useRag, setUseRag] = useState(false)
  const [model, setModel] = useState(['openAi', 'gpt-4o', 'GPT-4o'])
  const [userImages, setUserImages] = useState('')
  const [showSnippets, setShowSnippets] = useState(true)
  const [userPrompt, setUserPrompt] = useState('')
  // const [waxContext, setWaxContext] = useState({})

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
  })

  const [tools, setTools] = useState({
    dropper: { active: false, data: '' },
    brush: { active: false, data: '', properties: {} },
    paintBucket: { active: false, data: '', properties: {} },
  })

  const updateLayout = updateObjectState(setLayout)

  const mutateSettings = updateObjectStateFromKey(setSettings)

  const updateTools = updateObjectStateFromKey(setTools)

  const getCtxNode = (dom = document) =>
    dom.querySelector(`[data-aidctx="${selectedCtx.aidctx}"]`)

  const onSelect = ctx => {
    const node = ctx.node
    setSelectedNode(node)
    setSelectedCtx(ctx)
    setMarkedSnippet('')

    tools.dropper.active && updateTools('brush', { data: node.className })
    tools.brush.active &&
      tools.brush.data &&
      AiDesigner.snippets.toggle(tools.brush.data)
  }

  AiDesigner.on('select', onSelect)
  AiDesigner.on('addtocontext', console.log)
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
    if (selectedNode === htmlSrc) selectionBoxRef.current.style.opacity = 0
    else {
      const { top, left, height, width } =
        selectedNode?.getBoundingClientRect() ?? {}

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
    previewDoc &&
      previewDoc.scrollTop > 0 &&
      (previewScrollTopRef.current = previewDoc.scrollTop)

    css &&
      htmlSrc?.outerHTML &&
      (settings.preview.livePreview || manualUpdate) &&
      setPreviewSource(
        srcdoc(
          editorContent,
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
          previewScrollTopRef.current,
        ),
      )
    // updateCtxNodes()
  }

  // #endregion HELPERS -----------------------------------------------------------------

  // #region SNIPPETS -------------------------------------------------------------------
  const addSnippet = (node, snippet) => {
    const { snippets, createNewSnippetVersions, markNewSnippet } =
      settings.snippetsManager
    const snippetToAdd = !createNewSnippetVersions
      ? snippet
      : newSnippet(
          snippet,
          snippets.map(s => s.className),
        )

    node && node.classList.toggle(`aid-snip-${snippetToAdd.className}`)

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

    markNewSnippet && !markedSnippet && setMarkedSnippet(snippetToAdd.className)
  }

  const removeSnippet = (snippetName, node) => {
    if (!node) {
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
      document.querySelectorAll(`aid-snip-${snippetName}`).forEach(n => {
        n.classList.remove(`aid-snip-${snippetName}`)
      })
    } else {
      getCtxNode().classList.remove(`aid-snip-${snippetName}`)
    }
  }

  const updateSnippetDescription = (snippetName, description) => {
    const { snippets } = settings.snippetsManager
    snippets[snippetName].description = description
    setSettings(prev => {
      return merge({}, { ...prev }, { snippetsManager: { snippets } })
    })
  }

  const updateSnippetBody = (snippetName, body) => {
    const { snippets } = settings.snippetsManager
    const index = snippets.findIndex(s => s.className === snippetName)
    snippets[index].classBody = body
    setSettings(prev => {
      return merge({}, { ...prev }, { snippetsManager: { snippets } })
    })
  }

  const updateSnippetName = (snippetName, name) => {
    const { snippets } = settings.snippetsManager

    const foundSnippet =
      snippets[snippets.findIndex(s => s.className === snippetName)]

    snippets[snippets.findIndex(s => s.className === snippetName)].className =
      name
    setSettings(prev => {
      return merge({}, { ...prev }, { snippetsManager: { snippets } })
    })
    document
      .querySelectorAll(`.aid-snip-${foundSnippet.className}`)
      .forEach(el => {
        el.classList.replace(
          `aid-snip-${foundSnippet.className}`,
          `aid-snip-${name}`,
        )
      })
  }

  // #endregion SNIPPETS -------------------------------------------------------------------

  const ctx = useMemo(() => {
    return {
      history,
      selectedNode,
      selectedCtx,
      setSelectedCtx,
      setSelectedNode,
    }
  }, [history, selectedCtx, selectedNode])

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
        updateSnippetDescription,
        updateSnippetBody,
        updateSnippetName,
        saveSession,

        // waxContext,
        // setWaxContext,
        editorContainerRef,

        previewScrollTopRef,
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
