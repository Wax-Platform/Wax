/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useRef } from 'react'
import styled from 'styled-components'
import horizontalLogo from '../../../../static/AI Design Studio-Logo-horizontal.svg'
import { AiDesignerContext } from '../hooks/AiDesignerContext'
import { handleImgElementSelection, parseContent } from '../utils'
import useIncrementalTarget from '../hooks/useIncrementalTarget'

const EditorWrapper = styled.div`
  background: var(--color-background);
  box-shadow: 0 0 5px #0002;
  height: fit-content;
  min-height: 100%;
  padding: 80px;
  width: 100%;
  max-width: 800px;
`

const StyledEditor = styled.div`
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
`

const Editor = ({ stylesFromSource, updatePreview, getImageUrl }) => {
  const {
    setHtmlSrc,
    htmlSrc,
    editorContent,
    setEditorContent,
    setSelectedCtx,
    addToCtx,
    newCtx,
    styleSheetRef,
    getCtxBy,
    setMarkedSnippet,
    setSelectedNode,
    setCss,
    promptRef,
    createStyleSheet,
    onHistory,
    settings,
    setUserImages,
  } = useContext(AiDesignerContext)

  const { contentEditable, enablePaste } = settings.editor

  const selectionHandler = useIncrementalTarget(500)
  const editorRef = useRef(null)

  const handlePaste = async e => {
    e.preventDefault()

    const clipboardData = e.clipboardData || window.clipboardData
    const dataToPaste = clipboardData.getData('text/html')
    if (!dataToPaste) return
    onHistory.addRegistry('undo')
    setEditorContent(`<section>${parseContent(dataToPaste)}</section>`)
  }

  useEffect(() => {
    if (htmlSrc) {
      const allChilds = [...htmlSrc.children]

      styleSheetRef.current = createStyleSheet(styleTag =>
        htmlSrc.parentNode.insertBefore(styleTag, htmlSrc),
      )
      stylesFromSource && (styleSheetRef.current.textContent = stylesFromSource)

      addToCtx(newCtx(htmlSrc))
      setSelectedCtx(getCtxBy('node', htmlSrc))
      setSelectedNode(htmlSrc)
      setCss(styleSheetRef.current.textContent)
      allChilds.forEach(child => {
        child.removeAttribute('style')
        child.addEventListener('click', handleSelection)
      })

      htmlSrc.parentNode.parentNode.addEventListener('click', handleSelection)
    }

    return () => {
      if (htmlSrc) {
        ;[...htmlSrc.children].forEach(child => {
          child.removeEventListener('click', handleSelection)
        })
        htmlSrc.parentNode.parentNode.removeEventListener(
          'click',
          handleSelection,
        )
      }
    }
  }, [htmlSrc])

  // useEffect(() => {}, [])

  useEffect(() => {
    !editorContent &&
      setEditorContent(
        parseContent(/* html */ `<section><img
        alt="AI Design Studio"
        class="aid-snip-img-default"
        src=${horizontalLogo}
      /><p>You can paste the content here</p></section>`),
      )
  }, [])

  useEffect(() => {
    editorRef?.current && setHtmlSrc(editorRef.current)
    htmlSrc && htmlSrc.click()
  }, [editorContent])

  const handleSelection = async e => {
    if (e.target.dataset.element === 'element-options') return
    e.preventDefault()
    e.stopPropagation()
    selectionHandler(e, target => {
      if (htmlSrc.contains(target)) {
        // update the node in ctx if it was recreated on undo/redo/load
        !getCtxBy('node', target) &&
          getCtxBy('dataRef', target.dataset.aidctx) &&
          (getCtxBy('dataRef', target.dataset.aidctx).node = target)

        const ctx =
          getCtxBy('node', target) ||
          getCtxBy('dataRef', target.dataset.aidctx) ||
          addToCtx(newCtx(target, null, {}, false))

        setSelectedCtx(ctx)
        setSelectedNode(target)
      } else {
        setSelectedCtx(getCtxBy('node', htmlSrc))
        setSelectedNode(htmlSrc)
      }

      setMarkedSnippet('')
    })
    if (e.target.localName !== 'img') return
    await handleImgElementSelection({
      target: e.target,
      setUserImages,
      getImageUrl,
    })
  }

  return (
    <EditorWrapper>
      <StyledEditor
        contentEditable={contentEditable}
        dangerouslySetInnerHTML={{ __html: editorContent }}
        id="assistant-ctx"
        onFocus={() => !contentEditable && promptRef.current.focus()}
        onInput={updatePreview}
        onPaste={enablePaste ? handlePaste : () => {}}
        ref={editorRef}
        tabIndex={0}
      />
    </EditorWrapper>
  )
}

export default Editor
