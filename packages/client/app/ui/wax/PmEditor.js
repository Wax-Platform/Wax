import React, { useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { Wax } from 'wax-prosemirror-core'
import usePrintArea from './usePrintArea'
import config from './config/config'
import layout from './layout'
import YjsContext from '../../yjsProvider'
import { Result, Spin } from '../common'
import { useAiDesignerContext } from '../component-ai-assistant/hooks/AiDesignerContext'
import useDomObserver from '../component-ai-assistant/hooks/useDOMObserver'
import { debounce } from 'lodash'
import AiDesigner from '../../AiDesigner/AiDesigner'

import { FlexRow, StyledWindow } from '../_styleds/common'
import { useDocumentContext } from '../dashboard/hooks/DocumentContext'
import Files from '../dashboard/MainMenu/FileBrowser'

export const SpinnerWrapper = styled(FlexRow)`
  backdrop-filter: blur(3px);
  background: #fff9;
  height: 100%;
  left: 0;
  opacity: ${p => (p.showSpinner ? '1' : '0')};
  pointer-events: ${p => (p.showSpinner ? 'all' : 'none')};
  position: absolute;
  top: 0;
  transition: all 0.5s;
  width: 100%;
  z-index: 99999;

  > * {
    width: 100%;
  }
`

const FileBrowser = styled(Files)`
  --container-size: 30dvw;
  max-width: 100%;
  width: 80%;
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

const PmEditor = ({ docIdentifier, showFilemanager }) => {
  const { createYjsProvider, yjsProvider, ydoc } = useContext(YjsContext)
  const { setDocId, getDoc, fetchingTemplates, userSnippets } =
    useDocumentContext()

  const { setHtmlSrc, htmlSrc, setEditorContent, css, settings } =
    useAiDesignerContext()

  const { displayStyles } = settings.editor

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
      AiDesigner.addToContext({ id: 'aid-ctx-main' })
      AiDesigner.select('aid-ctx-main')
    }
  }, [htmlSrc])

  const [showSpinner, setShowSpinner] = useState(false)
  const [WaxConfig, setWaxConfig] = useState(config())
  const { refElement } = usePrintArea({})

  useEffect(() => {
    const handleMessage = e => {
      const id = e.data.id
      AiDesigner.select(id)
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  useEffect(() => {
    if (docIdentifier) {
      setDocId(docIdentifier)
      yjsProvider?.disconnect()
      setShowSpinner(true)
      getDoc(docIdentifier)

      debounce(() => {
        createYjsProvider(docIdentifier)
        setShowSpinner(false)
      }, 2000)()
    }
  }, [docIdentifier])

  useEffect(() => {
    if (yjsProvider && ydoc && docIdentifier) {
      const configObj = config(yjsProvider, ydoc, docIdentifier)
      setWaxConfig(configObj)
    }
  }, [yjsProvider?.doc?.guid])

  return (
    <>
      {displayStyles && <style id="aid-css-template">{css}</style>}
      {userSnippets && displayStyles && (
        <style id="aid-snippets">
          {userSnippets.map(s => s.classBody.join('\n'))}
        </style>
      )}
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          opacity: showSpinner ? 0.4 : 1,
          transition: 'all 0.5s',
        }}
      >
        <Wax
          config={WaxConfig}
          fileUpload={file => renderImage(file)}
          layout={layout}
          onChange={value => {
            setEditorContent(value)
          }}
          // readonly={!contentEditable}
          placeholder="Type Something ..."
          ref={refElement}
          scrollThreshold={50}
          docIdentifier={docIdentifier}
        />
      </span>
      <SpinnerWrapper
        showSpinner={showSpinner || fetchingTemplates}
        showFilemanager={showFilemanager}
      >
        <Result
          icon={<Spin size={18} spinning />}
          title={
            fetchingTemplates ? 'Fetching templates' : 'Loading your document'
          }
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
