import React, { useContext, useEffect, useState } from 'react'
import { AiDesignerContext } from '../hooks/AiDesignerContext'
import styled from 'styled-components'
import AiDesigner from '../../../AiDesigner/AiDesigner'
import { ToolsCursor } from './ToolsCursor'

const StyledWindow = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  transition: width 0.5s ease;
  width: ${p => (p.$show ? '100%' : '0')};
`
const PreviewIframe = styled.iframe`
  border: none;
  display: flex;
  height: calc(100%);
  width: 100%;
`

export const PagedJsPreview = () => {
  const { previewRef, layout, previewSource } = useContext(AiDesignerContext)

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

  return (
    <StyledWindow $show={layout.preview}>
      <PreviewIframe
        ref={previewRef}
        srcDoc={previewSource}
        title="Article preview"
      />
    </StyledWindow>
  )
}
