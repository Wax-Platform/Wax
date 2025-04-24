import React, { useContext, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { CssAssistantContext } from '../hooks/CssAssistantContext'

const StyledEditor = styled.div`
  border: none;
  outline: none;
  width: 100%;
  z-index: 1;

  &:hover {
    border: none;
    outline: none;
  }
`

// eslint-disable-next-line react/prop-types
const Editor = () => {
  const { setHtmlSrc, passedContent, getValidSelectors } =
    useContext(CssAssistantContext)

  const editorRef = useRef(null)

  useEffect(() => {
    editorRef?.current && setHtmlSrc(editorRef.current)
    editorRef?.current && getValidSelectors(editorRef.current)
  }, [passedContent])

  return (
    <StyledEditor
      // contentEditable
      dangerouslySetInnerHTML={{ __html: passedContent }}
      ref={editorRef}
    />
  )
}

export default Editor
