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
  /* pointer-events: none; */
  width: 100%;
`

export const PagedJsPreview = () => {
  const { previewRef, layout, updatePreview, previewSource } =
    useContext(AiDesignerContext)

  useEffect(() => {
    const handleMessage = e => {
      const aidctx = e.data.aidctx
      if (!aidctx) return
      document.querySelector(`[data-aidctx="${aidctx}"]`)?.click()
      previewRef?.current?.click()
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  useEffect(() => {
    previewRef?.current?.contentDocument &&
      previewRef?.current.contentDocument.addEventListener(
        'mousemove',
        console.log,
      )
  }, [previewRef?.current?.contentDocument, updatePreview])

  return (
    <StyledWindow $show={layout.preview}>
      {previewRef?.current?.contentDocument && (
        <ToolsCursor container={previewRef.current.contentDocument} />
      )}
      <PreviewIframe
        // style={{
        //   height: previewRef?.current?.contentDocument
        //     ? previewRef.current.contentDocument.scrollHeight
        //     : '15px',
        // }}
        onLoad={e =>
          setTimeout(
            console.log(
              e.target.contentDocument.querySelector('html').scrollHeight,
            ),
            2000,
          )
        }
        ref={previewRef}
        srcDoc={previewSource}
        title="Article preview"
      />
    </StyledWindow>
  )
}
