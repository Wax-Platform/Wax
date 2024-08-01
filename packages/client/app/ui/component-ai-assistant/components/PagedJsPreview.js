import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { AiDesignerContext } from '../hooks/AiDesignerContext'
import styled from 'styled-components'
import AiDesigner from '../../../AiDesigner/AiDesigner'
import { ToolsCursor } from './ToolsCursor'
import { debounce } from 'lodash'

const StyledWindow = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100dvh - (var(--header-height) + var(--menu-height, 0px)));

  opacity: ${p => (p.$show ? '1' : '0')};

  overflow: hidden;
  position: relative;
  transition: width 0.5s linear, opacity 0.5s linear;
  width: ${p => (p.$show ? '100%' : '0')};
`
const PreviewIframe = styled.iframe`
  border: none;
  display: flex;
  height: calc(100%);
  width: 100%;
`

export const PagedJsPreview = props => {
  const { previewRef, previewSource } = useContext(AiDesignerContext)
  const [fakeSrc, setFakeSrc] = useState('')
  const [mainSrc, setMainSrc] = useState('')
  const [showMain, setShowMain] = useState(true)

  useEffect(() => {
    const handleMessage = e => {
      const aidctx = e.data.aidctx
      if (!aidctx) return
      AiDesigner.select(aidctx)
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])
  useLayoutEffect(() => {
    setFakeSrc(previewSource)
    debounce(src => {
      setShowMain(false)
      setMainSrc(src)
      debounce(() => {
        setFakeSrc('')
        setShowMain(true)
      }, 1000)()
    }, 1000)(previewSource)
  }, [previewSource])

  return (
    <StyledWindow {...props}>
      <PreviewIframe
        ref={previewRef}
        srcDoc={mainSrc}
        title="Article preview"
        style={{ opacity: showMain ? 1 : 0 }}
      />
      <PreviewIframe
        style={{
          position: 'absolute',
          opacity: !showMain ? 1 : 0,
          pointerEvents: 'none',
        }}
        srcDoc={fakeSrc}
        title="Article preview"
      />
    </StyledWindow>
  )
}
