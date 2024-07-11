/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable no-param-reassign */
import React, { createContext, useMemo, useRef, useState } from 'react'
import { debounce, isString, merge, takeRight, uniqueId } from 'lodash'
import { uuid } from '@coko/client'
import {
  callOn,
  safeCall,
  safeId,
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

const defaultSettings = {
  gui: {
    showChatBubble: false,
    advancedTools: true,
  },
  editor: {
    contentEditable: true,
    enablePaste: true,
    displayStyles: true,
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
  const context = useRef([])
  const styleSheetRef = useRef(null)

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
  const [userPrompt, setUserPrompt] = useState('')
  const [waxContext, setWaxContext] = useState({})
  const [editorKey, setEditorKey] = useState(uniqueId('key'))

  // const [userInput, setUserInput] = useState({
  //   text: [''],
  //   image_url: [{ base64Img: '', src: '' }],
  //   useRag: false,
  //   model: ['openAi', 'gpt-4o', 'GPT-4o'],
  // })

  const [layout, setLayout] = useState({
    preview: true,
    editor: true,
    chat: false,
    input: true,
    settings: false,
  })

  const [tools, setTools] = useState({
    dropper: { active: false, data: 'aid-snip-scale' },
    brush: { active: true, data: {} },
  })

  const updateLayout = updateObjectState(setLayout)

  const mutateSettings = updateObjectStateFromKey(setSettings)

  const updateTools = updateObjectStateFromKey(setTools)

  const getCtxNode = (dom = document) =>
    dom.querySelector(`[data-aidctx="${selectedCtx.dataRef}"]`)

  // #endregion HOOKS ----------------------------------------------------------------

  // #region CONTEXT ----------------------------------------------------------------
  const makeSelector = (node, parent) => {
    const tagName = node.localName || node.tagName?.toLowerCase()

    const parentSelector = parent || ''

    const classNames =
      [...node.classList].length > 0 ? `.${[...node.classList].join('.')}` : ''

    const selector = `${
      parentSelector
        ? `${parentSelector} > ${tagName}`
        : `${tagName}${node.id ? `#${node.id}` : ''}`
    }`.trim()

    return { selector, tagName, classNames }
  }

  const newCtx = (node, parent) => {
    const { tagName } = makeSelector(node, parent)

    const dataRef = safeId(
      'aid-ctx',
      context.current.map(ctx => ctx.dataRef),
    )

    node.setAttribute('data-aidctx', dataRef)
    return {
      node,
      dataRef,
      tagName,
      history: [],
    }
  }

  const addToCtx = ctx => {
    context.current = [...context.current, ctx]
    return ctx
  }

  const getCtxBy = (by, prop, all) => {
    const method = all ? 'filter' : 'find'

    const ctxProps = {
      node: node => context.current[method](ctx => ctx.node === node),
      tagName: tag => context.current[method](ctx => ctx.tagName === tag),
      dataRef: data => context.current[method](ctx => ctx.dataRef === data),
      default: () => context.current[method](ctx => ctx),
    }

    return callOn(by, ctxProps, [prop])
  }

  const addAllNodesToCtx = dom => {
    const ctxsInDom = []

    const traverseNode = node => {
      const ctx = node.dataset.aidctx || ''

      if (!ctx) {
        const newAdded = addToCtx(newCtx(node))
        ctxsInDom.push(newAdded.dataRef)
      } else if (!ctxsInDom.includes(ctx)) {
        ctxsInDom.push(node.dataset.aidctx)
      } else {
        const newAdded = addToCtx(newCtx(node))
        ctxsInDom.push(newAdded.dataRef)
      }

      const childs = [...node.children]
      childs && childs.forEach(child => traverseNode(child))
    }

    traverseNode(dom.body)
  }

  const waxRefresh = () => {
    const editorContainer = editorContainerRef?.current
    if (!editorContainer) return
    const scrollPos = editorContainer.scrollTop
    setEditorKey(uuid())
    debounce(() => {
      setSelectedNode(getCtxNode())
      updateSelectionBoxPosition()
      editorContainer.scrollTo({ top: scrollPos, behavior: 'instant' })
    }, 100)()
  }

  const updateCtxNodes = () => {
    htmlSrc &&
      context.current.forEach(ctx => {
        if (ctx.node !== htmlSrc && !ctx.node) {
          const node = getCtxNode(htmlSrc)
          ctx.node = node
          ctx.tagName = node.localName || node.tagName?.toLowerCase()
        }
      })
  }

  const clearHistory = () => {
    selectedCtx.history = []
    setSelectedCtx({ ...selectedCtx })
  }

  const deleteLastMessage = () => {
    const newHistory = [...selectedCtx.history]
    newHistory.pop()
    selectedCtx.history = newHistory
    setSelectedCtx({ ...selectedCtx })
  }

  // #endregion CONTEXT -------------------------------------------------------------

  // #region HELPERS -----------------------------------------------------------------
  const createStyleSheet = onCreate => {
    if (!document.getElementById('css-assistant-scoped-styles')) {
      const styleTag = document.createElement('style')
      styleTag.id = 'css-assistant-scoped-styles'
      safeCall(onCreate)(styleTag)
      return styleTag
    }

    return document.getElementById('css-assistant-scoped-styles')
  }

  const updateSelectionBoxPosition = (yOffset = 10, xOffset = 10) => {
    const node = selectedNode

    if (selectedCtx.node !== htmlSrc && settings.editor.enableSelection) {
      const { top, left, height, width } = node?.getBoundingClientRect() ?? {}

      if (!left && !top) return

      if (node && selectionBoxRef?.current) {
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
    } else {
      selectionBoxRef?.current &&
        selectedCtx.node === htmlSrc &&
        (selectionBoxRef.current.style.opacity = 0)
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

  // TODO: add snippets to history registry
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

      styleSheetRef?.current &&
        (styleSheetRef.current.textContent = lastRegistry.css)
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
    updateCtxNodes()
  }

  // #endregion HELPERS -----------------------------------------------------------------

  // #region SNIPPETS -------------------------------------------------------------------
  const addSnippet = (node, snippet) => {
    const snippetToAdd = !settings.snippetsManager.createNewSnippetVersions
      ? snippet
      : newSnippet(
          snippet,
          settings.snippetsManager.snippets.map(s => s.className),
        )

    node && node.classList.toggle(`aid-snip-${snippetToAdd.className}`)

    const foundIndex = settings.snippetsManager.snippets.findIndex(
      s => s.className === snippetToAdd.className,
    )

    let snippets = [...settings.snippetsManager.snippets]
    foundIndex >= 0
      ? (snippets[foundIndex] = snippetToAdd)
      : (snippets = [...snippets, snippetToAdd])

    setSettings(prev => {
      const temp = prev
      temp.snippetsManager.snippets = snippets
      return temp
    })

    settings.snippetsManager.markNewSnippet &&
      !markedSnippet &&
      setMarkedSnippet(snippetToAdd.className)
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

  const dom = useMemo(() => {
    return {
      promptRef,
      styleSheetRef,
      createStyleSheet,
    }
  }, [styleSheetRef, promptRef])

  const ctx = useMemo(() => {
    return {
      context,
      history,
      selectedNode,
      selectedCtx,
      setSelectedCtx,
      setSelectedNode,
    }
  }, [context, history, selectedCtx, selectedNode])

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
        ...dom,
        ...ctx,
        ...chatGpt,
        layout,
        updateLayout,
        addToCtx,
        getCtxBy,
        newCtx,
        clearHistory,
        updateCtxNodes,
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
        // getMarkedSnippetName,
        markedSnippet,
        setMarkedSnippet,
        updateSnippetDescription,
        updateSnippetBody,
        updateSnippetName,
        saveSession,

        addAllNodesToCtx,

        waxContext,
        setWaxContext,
        setEditorKey,
        editorKey,
        editorContainerRef,

        previewScrollTopRef,
        previewRef,
        previewSource,
        setPreviewSource,
        waxRefresh,
        updatePreview,
        mutateSettings,
        getCtxNode,
        updateTools,
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
