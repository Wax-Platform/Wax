import React from 'react'
import styled from 'styled-components'
import {
  DeleteOutlined,
  EditOutlined,
  PoweroffOutlined,
} from '@ant-design/icons'
import { capitalize } from 'lodash'
import { useAiDesignerContext } from './hooks/AiDesignerContext'
import AiDesigner from '../../AiDesigner/AiDesigner'
import { css as cssLang } from '@codemirror/lang-css'
import { CleanButton, FlexCol, FlexRow } from '../_styleds/common'
import Each from './utils/Each'
import { TemplateEditor } from './components/CodeEditor'
import { EditorView } from '@uiw/react-codemirror'

const SnippetEditor = styled(TemplateEditor)`
  background-color: var(--color-trois-lightest-2);
  border-radius: 8px;
  width: 100%;
`

const Root = styled.div`
  background: #0000;
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: 100%;
  opacity: 1;
  padding: 12px 12px 24px;
  width: 100%;
`

const SnippetActions = styled(FlexRow)`
  align-items: center;
  border-radius: 12px;
  gap: 8px;
  opacity: ${p => (p.$disabled ? '0.5' : '1')};
  padding: 2px 8px;

  > button {
    color: var(--color-trois-opaque-2);
    cursor: ${p => (p.$disabled ? 'not-allowed' : 'pointer')};
    display: flex;
    padding: 0;
    pointer-events: ${p => (p.$disabled ? 'none' : 'all')};

    svg {
      font-size: 16px;
      transform-origin: center;
      transition: transform 0.3s;
    }

    &:hover {
      svg {
        transform: scale(1.2);
      }
    }
  }
`

const SnippetWrapper = styled(FlexCol)`
  background-color: var(--color-trois-lightest);
  border-radius: 12px;
  gap: 3px;
  padding: 3px;
`

const Snippet = styled.span`
  --color-states: ${p =>
    p.$active
      ? 'var(--color-primary)'
      : p.$marked
      ? 'var(--color-yellow)'
      : '#ddd'};
  --color-states-dark: ${p =>
    p.$active
      ? 'var(--color-primary-dark)'
      : p.$marked
      ? 'var(--color-yellow-dark)'
      : 'var(--color-trois-opaque)'};
  --font-weight: ${p => (p.$active || p.$marked ? '700' : '200')};

  background: var(--color-trois-lightest-2);
  border: none;
  border-left: 4px solid var(--color-states);
  border-radius: 8px;
  color: #555;
  display: flex;
  gap: 4px;
  justify-content: space-between;
  outline: none;
  padding: 8px 10px;
  pointer-events: all;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: var(--color-trois-lightest);
  }
`

const SnippetsName = styled.span`
  border: none;
  color: var(--color-states-dark);
  display: flex;
  gap: 4px;
  justify-content: space-between;
  padding: 8px 5px;
  white-space: nowrap;
`

export const SnippetsManager = () => {
  const {
    settings,
    onHistory,
    selectedCtx,
    setMarkedSnippet,
    markedSnippet,
    getCtxNode,
    userInteractions,
    removeSnippet,
  } = useAiDesignerContext()

  if (!settings.editor.enableSelection) return null

  const { snippets } = settings.snippetsManager

  const snippetRender = snip => {
    const { className, description, classBody } = snip
    const isAdded = getCtxNode()?.classList?.contains(`aid-snip-${className}`)
    const isMarked = className === markedSnippet

    const handleSnippets = e => {
      e.preventDefault()
      e.stopPropagation()
      const action = e.target.getAttribute('data-action') ?? 'toggle'
      const { tagName } = selectedCtx
      onHistory.addRegistry('undo')

      if (action === 'delete') {
        removeSnippet
        AiDesigner.filterBy({ tagName }, c =>
          c.snippets.remove(`aid-snip-${className}`),
        )
      } else {
        userInteractions.ctrl
          ? AiDesigner.updateContext().filterBy({ tagName }, c =>
              c.snippets[action](`aid-snip-${className}`),
            )
          : selectedCtx.snippets[action](`aid-snip-${className}`)
      }

      isMarked && setMarkedSnippet('')
    }

    const displayName = capitalize(className?.replaceAll('-', ' '))
    return (
      <SnippetWrapper>
        <Snippet $active={!isMarked && isAdded} $marked={isMarked}>
          <SnippetsName>{displayName}</SnippetsName>
          <SnippetActions $disabled={!selectedCtx?.node}>
            <CleanButton
              data-action="toggle"
              onClick={handleSnippets}
              title={description}
            >
              <PoweroffOutlined style={{ pointerEvents: 'none' }} />
            </CleanButton>
            <CleanButton
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                setMarkedSnippet(isMarked ? '' : className)
              }}
              title={`Edit snippet via prompt: \nYou can change the styles, description\n name of the snippet and/or create a copy.\n Only one snippet can be edited at a time.\n`}
              type="button"
            >
              <EditOutlined style={{ pointerEvents: 'none' }} />
            </CleanButton>
            <CleanButton
              data-action="delete"
              onClick={handleSnippets}
              title={`Delete snipet (not undoable)`}
              type="button"
            >
              <DeleteOutlined style={{ pointerEvents: 'none' }} />
            </CleanButton>
          </SnippetActions>
        </Snippet>
        {isMarked && (
          <SnippetEditor
            extensions={[cssLang(), EditorView.lineWrapping]}
            onChange={content => {
              updateSnippetBody(className, content)
            }}
            value={classBody}
          />
        )}
      </SnippetWrapper>
    )
  }
  return (
    <Root $active>
      <Each of={snippets} as={snippetRender} if={snippets.length} />
    </Root>
  )
}
