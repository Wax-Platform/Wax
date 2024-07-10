/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { Wax } from 'wax-prosemirror-core'
// import { debounce } from 'lodash'
import { AiDesignerContext } from '../hooks/AiDesignerContext'
import { parseContent, safeId } from '../utils'
import horizontalLogo from '../../../../static/AI Design Studio-Logo-horizontal.svg'

// import useIncrementalTarget from '../hooks/useIncrementalTarget'
import waxConfig from './waxConfig'
import WaxLayout from './WaxLayout'
import useDomObserver from '../hooks/useDOMObserver'
import addAidctxPlugin from './addAidCtxPlugin'

const WaxEditor = styled(Wax)`
  height: 100%;
  padding: 80px;
  width: 100%;
  max-width: 1000px;
  min-height: 100vh;
  min-width: 820px;

  .ProseMirror {
    border: none;
    margin-bottom: 20px;
    min-height: 100%;
    outline: none;
    position: relative;
    width: 100%;
    z-index: 1;

    &:hover {
      border: none;
      outline: none;
    }
  }
`

const testContent = /* html */ `
<img src="${horizontalLogo}" alt="default"/>
    <h1 class="aid-snip-scale">The Rise of Artificial Intelligence</h1>
    <p>By Jane Doe | January 1, 2023</p>
    <h2>Introduction</h2>
    <p>Artificial Intelligence (AI) is transforming the world as we know it. From self-driving cars to virtual assistants, AI is becoming an integral part of our daily lives.</p>
    <h2>History of AI</h2>
    <p>The concept of AI dates back to ancient history, but it wasn't until the 20th century that significant advancements were made. In 1956, the term 'Artificial Intelligence' was coined at the Dartmouth Conference.</p>
    <h2>Applications of AI</h2>
    <p>AI has a wide range of applications, including:</p>
    <ul>
      <li>Healthcare: AI is used for diagnosing diseases and personalizing treatment plans.</li>
      <li>Finance: AI helps in fraud detection and algorithmic trading.</li>
      <li>Transportation: Self-driving cars and traffic management systems.</li>
      <li>Entertainment: AI is used in video games and content recommendation systems.</li>
    </ul>
    <h2>Future of AI</h2>
    <p>The future of AI is promising, with potential advancements in areas such as quantum computing, ethical AI, and more. However, it also raises important questions about privacy, security, and the impact on jobs.</p>
    <p>For more information, visit our <a href="#">website</a>.</p>
`

const Editor = ({ stylesFromSource }) => {
  const {
    setHtmlSrc,
    htmlSrc,
    editorContent,
    setEditorContent,
    setSelectedCtx,
    addToCtx,
    newCtx,
    getCtxBy,
    css,
    setMarkedSnippet,
    setSelectedNode,
    setCss,
    settings,
    context,
    editorKey,
    addAllNodesToCtx,
    tools,
    updateTools,
  } = useContext(AiDesignerContext)

  const { contentEditable, displayStyles } = settings.editor

  const editorRef = useRef(null)
  useDomObserver({
    enabled: !editorRef?.current,
    selector: '.ProseMirror[contenteditable]',
    onMatch: editorElement => {
      if (!editorRef.current) {
        editorRef.current = editorElement
        setHtmlSrc(editorElement)
      }
    },
  })

  useEffect(() => {
    setCss(stylesFromSource)

    if (htmlSrc) {
      addToCtx(newCtx(htmlSrc))
      setSelectedCtx(getCtxBy('node', htmlSrc))
      setSelectedNode(htmlSrc)
    }
  }, [htmlSrc])

  useEffect(() => {
    // console.log(tools)
  }, [tools])

  useEffect(() => {
    !editorContent &&
      setEditorContent(parseContent(testContent, addAllNodesToCtx))
  }, [])

  const config = useMemo(
    () => ({
      ...waxConfig,
      PmPlugins: [
        addAidctxPlugin(
          safeId(
            'aid-ctx',
            context.current.map(ctx => ctx.dataRef),
          ),
          addToCtxWax(
            getCtxBy,
            addToCtx,
            newCtx,
            setSelectedCtx,
            setSelectedNode,
            setMarkedSnippet,
            tools,
            updateTools,
          ),
          tools,
        ),
      ],
      onViewCreated: view => {
        editorRef.current = view
      },
    }),
    [context?.current, tools],
  )

  return (
    <>
      {displayStyles && <style id="aid-css-template">{css}</style>}

      <WaxEditor
        config={config}
        // customValues={designerTools}
        key={editorKey}
        layout={WaxLayout}
        onChange={value => {
          setEditorContent(parseContent(value))
        }}
        readonly={!contentEditable}
        value={editorContent}
      />
    </>
  )
}

export default Editor

const addToCtxWax =
  (
    getCtxBy,
    addToCtx,
    newCtx,
    setSelectedCtx,
    setSelectedNode,
    setMarkedSnippet,
    tools,
    updateTools,
  ) =>
  aidCtx => {
    const target = document.querySelector(`[data-aidctx="${aidCtx}"]`)
    if (target) {
      !getCtxBy('node', target) &&
        getCtxBy('dataRef', target.dataset.aidctx) &&
        // eslint-disable-next-line no-param-reassign
        (getCtxBy('dataRef', target.dataset.aidctx).node = target)

      const ctx =
        getCtxBy('node', target) ||
        getCtxBy('dataRef', target.dataset.aidctx) ||
        addToCtx(newCtx(target, null, {}, false))

      tools.dropper.active && updateTools('dropper', { data: target.className })

      setSelectedNode(target)
      setSelectedCtx(ctx)
      setMarkedSnippet('')
    } else console.warn('Element is not selectable!')
  }
