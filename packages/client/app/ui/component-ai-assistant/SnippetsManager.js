/* stylelint-disable string-quotes */
/* stylelint-disable no-descending-specificity */
import React from 'react'
import styled from 'styled-components'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  PoweroffOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { useAiDesignerContext } from './hooks/AiDesignerContext'
import AiDesigner from '../../AiDesigner/AiDesigner'
import { css as cssLang } from '@codemirror/lang-css'
import { CleanButton, FlexCol, FlexRow } from '../_styleds/common'
import Each from './utils/Each'
import { TemplateEditor } from './components/CodeEditor'
import { EditorView } from '@uiw/react-codemirror'
import { useDocumentContext } from '../dashboard/hooks/DocumentContext'
import { useModalContext } from '../../hooks/modalContext'
import { Actions } from '../dashboard/MainMenu/PathRender'
import { getSnippetsStyleTag } from './utils'

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

  > button[data-action='toggle'] {
    color: var(--color-states);

    svg {
      fill: var(--color-states-dark);
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

const StyledActions = styled(Actions)`
  button {
    color: var(--color-trois-opaque-2);

    &:hover {
      background-color: #0001;
    }

    svg {
      fill: var(--color-trois-opaque);
    }
  }
`

const CREATE_TEMPLATE_MODAL_ITEMS = [
  {
    label: 'Name',
    component: (
      <input
        type="text"
        placeholder="...Choose a name for your template"
        data-field-id="displayName"
      />
    ),
  },
  {
    label: 'Description',
    component: (
      <input
        type="text"
        placeholder="...Add a description"
        data-field-id="description"
      />
    ),
  },
  {
    label: 'Class',
    component: (
      <input
        type="text"
        placeholder="...Add a class name"
        data-field-id="className"
      />
    ),
  },
  {
    label: 'Css',
    component: (
      <TemplateEditor
        style={{ width: '100%' }}
        data-field-id="rawCss"
        extensions={[cssLang(), EditorView.lineWrapping]}
        onChange={content => {
          document.querySelector('[data-field-id="rawCss"]').value = content
        }}
      />
    ),
  },
]

export const SnippetManagerHeader = () => {
  const { createTemplate, userSnippets } = useDocumentContext()
  const { modalState } = useModalContext()

  const onSubmit = fields => {
    const { displayName, rawCss = '', className, description } = fields

    const validations = {
      displayName,
      rawCss: (rawCss.length && rawCss.includes('[class]')) || !rawCss.length,
      className: !userSnippets.find(snip => snip.className === className),
    }

    if (Object.values(validations).some(v => !v)) {
      const failedValidationFieldNames = Object.keys(validations).filter(
        key => !validations[key],
      )

      const passedValidationFieldNames = Object.keys(validations).filter(
        key => !!validations[key],
      )

      passedValidationFieldNames.forEach(
        name =>
          (document.querySelector(`[data-field-id="${name}"]`).style.border =
            '1px solid #0000'),
      )

      failedValidationFieldNames.forEach(
        name =>
          (document.querySelector(`[data-field-id="${name}"]`).style.border =
            '1px solid red'),
      )

      return false
    }

    const meta = { className, description }
    const css = rawCss.replaceAll('[class]', `.${className}`)

    const payload = {
      displayName,
      rawCss: css,
      meta: JSON.stringify(meta),
    }

    createTemplate({
      variables: {
        input: { ...payload, category: 'user-snippets', status: 'private' },
      },
    })

    return true
  }

  return (
    <FlexRow
      style={{
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <p>Snippets</p>
      <StyledActions>
        <CleanButton
          onClick={() =>
            modalState.update({
              show: true,
              title: 'Create a new snippet',
              onSubmit,
              items: CREATE_TEMPLATE_MODAL_ITEMS,
            })
          }
        >
          <PlusOutlined />
        </CleanButton>
      </StyledActions>
    </FlexRow>
  )
}

const Description = styled.span`
  background-color: var(--color-trois-lightest-2);
  border-radius: 8px;
  color: var(--color-trois-opaque);
  font-size: 12px;
  padding: 8px;
  width: 100%;
`

const getSnippetEditorValue = id =>
  document.querySelector(`#snippet-${id}`)?.value

export const SnippetsManager = () => {
  const {
    settings,
    selectedCtx,
    setMarkedSnippet,
    markedSnippet,
    getCtxNode,
    userInteractions,
  } = useAiDesignerContext()

  const { userSnippets, updateTemplateCss, deleteTemplate } =
    useDocumentContext()

  if (!settings.editor.enableSelection) return null

  const snippets = [...userSnippets].sort((a, b) => {
    const isAddedA = getCtxNode()?.classList?.contains(`${a.className}`)
    const isAddedB = getCtxNode()?.classList?.contains(`${b.className}`)
    return isAddedB - isAddedA
  })

  const snippetRender = snip => {
    const { className, description, classBody, displayName, id } = snip
    const isAdded = getCtxNode()?.classList?.contains(`${className}`)
    const isMarked = className === markedSnippet?.className

    const handleSave = e => {
      e.preventDefault()
      e.stopPropagation()
      const newCss = getSnippetEditorValue(id)
      const styleTag = getSnippetsStyleTag()

      if (styleTag && newCss) {
        styleTag.innerHTML = styleTag.innerHTML.replace(classBody, newCss)
        updateTemplateCss({
          variables: { id, rawCss: newCss, displayName },
        })
      }
    }

    const handleSnippets = e => {
      e.preventDefault()
      e.stopPropagation()
      const action = e.target.getAttribute('data-action') ?? 'toggle'
      const { tagName } = selectedCtx

      if (action === 'delete') {
        AiDesigner.filterBy({ tagName }, c => c.snippets.remove(`${className}`))
        deleteTemplate({ variables: { id } })
      } else {
        userInteractions.ctrl
          ? AiDesigner.updateContext().filterBy({ tagName }, c =>
              c.snippets[action](`${className}`),
            )
          : selectedCtx.snippets[action](`${className}`)
      }

      isMarked && setMarkedSnippet({})
    }

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
                setMarkedSnippet(isMarked ? {} : snip)
              }}
              title={`Edit snippet via prompt: \nYou can change the styles, description\n name of the snippet and/or create a copy.\n Only one snippet can be edited at a time.\n`}
              type="button"
            >
              <EditOutlined style={{ pointerEvents: 'none' }} />
            </CleanButton>
            {isMarked && (
              <CleanButton
                $disabled={!getSnippetEditorValue(id)}
                onClick={handleSave}
                title={'Save'}
              >
                <SaveOutlined style={{ pointerEvents: 'none' }} />
              </CleanButton>
            )}
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
          <>
            {description && (
              <Description>Description: {description}</Description>
            )}
            <SnippetEditor
              id={`snippet-${id}`}
              extensions={[cssLang(), EditorView.lineWrapping]}
              onChange={content => {
                document.querySelector(`#snippet-${id}`).value = content
              }}
              value={classBody}
            />
          </>
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
