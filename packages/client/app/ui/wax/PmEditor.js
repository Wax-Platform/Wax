import React, { useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { yCursorPlugin, ySyncPlugin, yUndoPlugin } from 'y-prosemirror'
import { Wax } from 'wax-prosemirror-core'
import { TablesService } from 'wax-table-service'
import usePrintArea from './usePrintArea'
import config from './config/config'
import layout from './layout'
import YjsContext from '../../yjsProvider'
import { Result, Spin } from '../common'
import { AiDesignerContext } from '../component-ai-assistant/hooks/AiDesignerContext'
import useDomObserver from '../component-ai-assistant/hooks/useDOMObserver'
import waxSelectionHandler from '../component-ai-assistant/components/waxSelectionHandler'
import {
  parseContent,
  safeId,
  snippetsToCssText,
} from '../component-ai-assistant/utils'

const SpinnerWrapper = styled.div`
  display: ${props => (props.showSpinner ? 'block' : 'none')};
  left: ${props => (props.showFilemanager ? '59%' : '50%')};
  margin-left: -400px;
  margin-top: -25px;
  position: absolute;
  top: 50%;
  z-index: 999;
`

const renderImage = file => {
  const reader = new FileReader()

  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    // Some extra delay to make the asynchronicity visible
    setTimeout(() => reader.readAsDataURL(file), 150)
  })
}

const PmEditor = ({
  docIdentifier,
  showFilemanager,
  deleteResource,
  renameResource,
  addResource,
  reorderResource,
  getDocTreeData,
}) => {
  const { createYjsProvider, yjsProvider, ydoc } = useContext(YjsContext)

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
    settings,
    selectedCtx,
    tools,
    updateTools,
    context,
  } = useContext(AiDesignerContext)

  const { displayStyles } = settings.editor
  const { snippets } = settings.snippetsManager

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
    if (htmlSrc) {
      addToCtx(newCtx(htmlSrc))
      setSelectedCtx(getCtxBy('node', htmlSrc))
      setSelectedNode(htmlSrc)
    }
  }, [htmlSrc])

  const [showSpinner, setShowSpinner] = useState(false)
  const [WaxConfig, setWaxConfig] = useState(null)
  const { refElement } = usePrintArea({})

  useEffect(() => {
    if (docIdentifier) {
      yjsProvider?.disconnect()
      setShowSpinner(true)

      setTimeout(() => {
        createYjsProvider(docIdentifier)
        setShowSpinner(false)
      }, 1000)
    }
  }, [docIdentifier])

  useEffect(() => {
    if (yjsProvider) {
      const safeAidCtx = safeId(
        'aid-ctx',
        context.current.map(ctx => ctx.dataRef),
      )
      const selectionHandler = waxSelectionHandler(
        getCtxBy,
        addToCtx,
        newCtx,
        setSelectedCtx,
        setSelectedNode,
        setMarkedSnippet,
        tools,
        updateTools,
      )

      const configObj = config(
        yjsProvider,
        ydoc,
        docIdentifier,
        selectionHandler,
        safeAidCtx,
        tools,
      )
      setWaxConfig(configObj)
    }
  }, [yjsProvider?.doc?.guid, selectedCtx.dataRef])

  let identifier = docIdentifier

  if (!docIdentifier) {
    identifier = Array.from(Array(20), () =>
      Math.floor(Math.random() * 36).toString(36),
    ).join('')

    history.push(`/${identifier}`, { replace: true })
    return true
  }

  if (!yjsProvider || !ydoc || !WaxConfig) return null

  return (
    <>
      {displayStyles && <style id="aid-css-template">{css}</style>}
      {snippets && displayStyles && (
        <style id="aid-snippets">
          {snippetsToCssText(
            snippets,
            '.ProseMirror[contenteditable] .aid-snip-',
          )}
        </style>
      )}
      <Wax
        config={WaxConfig}
        fileUpload={file => renderImage(file)}
        layout={layout}
        onChange={value => {
          setEditorContent(value)
        }}
        // readonly={!contentEditable}
        value={editorContent}
        placeholder="Type Something ..."
        ref={refElement}
        scrollThreshold={50}
        deleteResource={deleteResource}
        renameResource={renameResource}
        addResource={addResource}
        reorderResource={reorderResource}
        getDocTreeData={getDocTreeData}
        showFilemanager
      />
      <SpinnerWrapper
        showSpinner={showSpinner}
        showFilemanager={showFilemanager}
      >
        <Result
          icon={<Spin size={18} spinning />}
          title="Loading your document"
        />
      </SpinnerWrapper>
    </>
  )
}

PmEditor.propTypes = {
  docIdentifier: PropTypes.string,
}

PmEditor.defaultProps = {
  docIdentifier: null,
}

export default PmEditor