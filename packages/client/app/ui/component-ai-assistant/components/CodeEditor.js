/* stylelint-disable declaration-no-important */
import React, { useContext } from 'react'
import ReactCodeMirror from '@uiw/react-codemirror'
import { css as cssLang } from '@codemirror/lang-css'
import { AiDesignerContext } from '../hooks/AiDesignerContext'
import styled from 'styled-components'

const CssEditor = styled(ReactCodeMirror)`
  * {
    outline: none !important;
  }

  .cm-content {
    border: none;
    font-size: 14px;
  }

  .cm-activeLineGutter,
  .cm-activeLine {
    background: var(--color-trois-lightest-3);
  }

  .cm-gutters {
    background: #fff0;
    font-size: 12px;
  }

  > :first-child {
    background: #fff0;
    margin-top: 5px;
    max-height: 300px;
    min-height: 200px;
  }

  > :last-child span {
    border-left: none;
    display: inline-block;
    padding: 0;
    white-space: unset;
  }
`
const TemplateEditor = styled(CssEditor)`
  > :first-child {
    height: 100%;
    max-height: unset;
  }
`

export const TemplateManager = () => {
  const { css, setCss, updatePreview, markedSnippet, setMarkedSnippet } =
    useContext(AiDesignerContext)
  return (
    <TemplateEditor
      extensions={[cssLang()]}
      onChange={content => {
        markedSnippet
          ? setMarkedSnippet(prev => ({ ...prev, classBody: content }))
          : setCss(content)
        updatePreview(true)
      }}
      value={markedSnippet?.classBody || css}
    />
  )
}
