import React, { useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { Wax } from 'wax-prosemirror-core'
import usePrintArea from './usePrintArea'
import config from './config/config'
import layout from './layout'
import YjsContext from '../../yjsProvider'
import { Result, Spin } from '../common'
import {
  AiDesignerContext,
  useAiDesignerContext,
} from '../component-ai-assistant/hooks/AiDesignerContext'
import useDomObserver from '../component-ai-assistant/hooks/useDOMObserver'
import { snippetsToCssText } from '../component-ai-assistant/utils'
import { debounce, get } from 'lodash'
import AiDesigner from '../../AiDesigner/AiDesigner'

import useAssistant from '../component-ai-assistant/hooks/useAiDesigner'
import { FlexRow, StyledWindow } from '../_styleds/common'
import { useDocumentContext } from '../dashboard/hooks/DocumentContext'
import Files from '../dashboard/MainMenu/FileBrowser'

const SpinnerWrapper = styled(FlexRow)`
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
  const { setDocId, getDoc } = useDocumentContext()
  const { getAidMisc, aidMisc, getCssTemplate } = useAssistant()

  const { setHtmlSrc, htmlSrc, setEditorContent, css, settings, designerOn } =
    useAiDesignerContext()

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
      AiDesigner.addToContext({ id: 'aid-ctx-main' })
      AiDesigner.select('aid-ctx-main')
    }
  }, [htmlSrc])

  const [showSpinner, setShowSpinner] = useState(false)
  const [WaxConfig, setWaxConfig] = useState(null)
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
      getDoc({ variables: { identifier: docIdentifier } })

      debounce(() => {
        createYjsProvider(docIdentifier)
        setShowSpinner(false)
      }, 2000)()
      getAidMisc({
        variables: {
          input: { docId: docIdentifier },
        },
      })
    }
  }, [docIdentifier])

  // useEffect(() => {
  //   aidMisc &&
  //     getCssTemplate({
  //       variables: { docId: docIdentifier },
  //     })
  // }, [aidMisc])

  useEffect(() => {
    if (yjsProvider) {
      const configObj = config(yjsProvider, ydoc, docIdentifier)
      setWaxConfig(configObj)
    }
  }, [yjsProvider?.doc?.guid])

  if (!yjsProvider || !ydoc || !WaxConfig || !docIdentifier) {
    return (
      <StyledWindow
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
          width: '100%',
          height: '100%',
          opacity: 1,
          background: 'var(--color-trois-lightest-2)',
          paddingBlock: '1rem',
        }}
      >
        <FileBrowser />
      </StyledWindow>
    )
  }
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
            designerOn && debounce(setEditorContent, 250)(value)
          }}
          // readonly={!contentEditable}
          placeholder="Type Something ..."
          ref={refElement}
          scrollThreshold={50}
          showFilemanager
        />
      </span>
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
