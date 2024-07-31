import React, { useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
// import { yCursorPlugin, ySyncPlugin, yUndoPlugin } from 'y-prosemirror'
import { Wax } from 'wax-prosemirror-core'
// import { TablesService } from 'wax-table-service'
import usePrintArea from './usePrintArea'
import config from './config/config'
import layout from './layout'
import YjsContext from '../../yjsProvider'
import { Result, Spin } from '../common'
import { AiDesignerContext } from '../component-ai-assistant/hooks/AiDesignerContext'
import useDomObserver from '../component-ai-assistant/hooks/useDOMObserver'
import { snippetsToCssText } from '../component-ai-assistant/utils'
import { debounce } from 'lodash'
import AiDesigner from '../../AiDesigner/AiDesigner'
import Toolbar from '../component-ai-assistant/components/Toolbar'
import { useCurrentUser } from '@coko/client'
import useAssistant from '../component-ai-assistant/hooks/useAiDesigner'

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
    setEditorContent,
    css,
    settings,
    updatePreview,
    setDocId,
  } = useContext(AiDesignerContext)
  const { getAidMisc, aidMisc, getCssTemplate } = useAssistant()

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
      AiDesigner.addToContext({ aidctx: 'aid-ctx-main' })
      AiDesigner.select('aid-ctx-main')
    }
  }, [htmlSrc])

  const [showSpinner, setShowSpinner] = useState(false)
  const [WaxConfig, setWaxConfig] = useState(null)
  const { refElement } = usePrintArea({})

  useEffect(() => {
    const handleMessage = e => {
      const aidctx = e.data.aidctx
      AiDesigner.select(aidctx)
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])
  useEffect(() => {
    if (docIdentifier) {
      yjsProvider?.disconnect()
      setShowSpinner(true)

      debounce(() => {
        createYjsProvider(docIdentifier)
        getAidMisc({
          variables: {
            input: { docId: docIdentifier },
          },
        })
        setDocId(docIdentifier)
        setShowSpinner(false)
      }, 1000)()
    }
  }, [docIdentifier])

  useEffect(() => {
    aidMisc && console.log(aidMisc)
    aidMisc &&
      getCssTemplate({
        variables: { docId: docIdentifier},
      }).then(console.log)
  }, [aidMisc])

  useEffect(() => {
    if (yjsProvider) {
      const configObj = config(yjsProvider, ydoc, docIdentifier)
      setWaxConfig(configObj)
    }
  }, [yjsProvider?.doc?.guid])

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
          debounce(AiDesigner.updateContext, 1000)()
          updatePreview()
        }}
        // readonly={!contentEditable}
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
