/* stylelint-disable string-quotes */
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { AiDesignerContext } from '../hooks/AiDesignerContext'
import styled from 'styled-components'
import AiDesigner from '../../../AiDesigner/AiDesigner'
import { ToolsCursor } from './ToolsCursor'
import { debounce } from 'lodash'
import { Result, Spin } from 'antd'
import useAssistant from '../hooks/useAiDesigner'

const SpinnerWrapper = styled.div`
  align-items: center;
  backdrop-filter: blur(5px);
  background: #fff0;
  display: flex;
  height: 100%;
  justify-content: center;
  opacity: ${p => (p.showSpinner ? '1' : '0')};
  pointer-events: ${p => (p.showSpinner ? 'all' : 'none')};
  position: absolute;
  transition: opacity 0.5s;
  width: 100%;
  z-index: 999;
`
const StyledWindow = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100dvh - (var(--header-height) + var(--menu-height, 0px)));

  opacity: ${p => (p.$show ? '1' : '0')};

  overflow: hidden;
  position: relative;
  transition: all 0.3s linear;
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
  const { loading } = useAssistant()
  const [fakeSrc, setFakeSrc] = useState(null)
  const [mainSrc, setMainSrc] = useState(null)
  const [showMain, setShowMain] = useState(true)

  useEffect(() => {
    const handleMessage = e => {
      const id = e.data.id
      if (!id) return
      AiDesigner.select(id)
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  useLayoutEffect(() => {
    setFakeSrc(previewSource)
    debounce(src => {
      setMainSrc(src)
      setShowMain(false)
      debounce(() => {
        setShowMain(true)
        setFakeSrc('')
      }, 1200)()
    }, 1200)(previewSource)
  }, [previewSource])

  return (
    <StyledWindow {...props}>
      <PreviewIframe
        ref={previewRef}
        srcDoc={mainSrc}
        title="Article preview"
        style={{ opacity: showMain ? 1 : 0, zIndex: 10 }}
      />
      <PreviewIframe
        style={{
          position: 'absolute',
          opacity: !showMain ? 1 : 0,
          pointerEvents: 'none',
          zIndex: 99,
        }}
        srcDoc={fakeSrc}
        title="Article preview"
      />
      <SpinnerWrapper showSpinner={!!showMain === !!fakeSrc || !!loading}>
        <Result
          icon={<Spin size={18} spinning />}
          title="Applying changes..."
        />
      </SpinnerWrapper>
    </StyledWindow>
  )
}
