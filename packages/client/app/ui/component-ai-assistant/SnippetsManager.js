/* stylelint-disable string-quotes */
/* stylelint-disable no-descending-specificity */
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import {
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
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
import { createOrUpdateStyleSheet, getSnippetsStyleTag } from './utils'

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

  > button[data-action='toggle'],
  > button[data-pin] {
    color: var(--color-states);

    svg {
      fill: var(--color-states-dark);
    }
  }

  > button[data-pin] {
    svg {
      transform: scale(0.8);
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
  overflow: hidden;
  padding: 8px 5px;

  p {
    margin: 0;
    padding: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    label: '',
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

export const useCreateSnippet = () => {
  const { createResource, userSnippets } = useDocumentContext()
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

    const templateProps = JSON.stringify({
      ...payload,
      category: 'user-snippets',
      status: 'private',
    })

    createResource('snippet', {
      title: displayName,
      resourceType: 'snippet',
      extension: 'snip',
      templateProps,
    })()

    return true
  }

  const handleCreateSnippet = () => {
    modalState.update({
      show: true,
      title: 'New snippet',
      onSubmit,
      items: CREATE_TEMPLATE_MODAL_ITEMS,
    })
  }

  return handleCreateSnippet
}

export const SnippetManagerHeader = () => {
  const goToTop = () => {
    document
      .querySelector('#user-menu-scroller')
      .scrollTo({ top: 0, behavior: 'smooth' })
  }
  return (
    <FlexRow>
      <CleanButton onClick={goToTop} title="Go to top">
        <ArrowUpOutlined />
      </CleanButton>
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

  const { userSnippets, updateTemplateCss, deleteTemplate, getUserSnippets } =
    useDocumentContext()

  const [pinnedSnippets, setPinnedSnippets] = useState([])
  const [snippets, setSnippets] = useState([])

  useEffect(() => {
    getUserSnippets()
  }, [])

  useEffect(() => {
    userSnippets && createOrUpdateStyleSheet(userSnippets)
    setSnippets(userSnippets.filter(snip => !pinnedSnippets.includes(snip)))
  }, [JSON.stringify(userSnippets)])

  useEffect(() => {
    selectedCtx?.node &&
      setSnippets(
        [
          ...userSnippets.filter(snip =>
            getCtxNode()?.classList?.contains(snip.className),
          ),
          ...userSnippets.filter(
            snip => !getCtxNode()?.classList?.contains(snip.className),
          ),
        ].filter(snip => !pinnedSnippets.find(s => s.id === snip.id)),
      )
  }, [selectedCtx?.node, JSON.stringify(userSnippets), pinnedSnippets])

  const snippetRender = snip => {
    const { className, description, classBody, displayName, id } = snip
    const isAdded = getCtxNode()?.classList?.contains(`${className}`)
    const isMarked = id === markedSnippet?.id

    const handleSave = e => {
      e.preventDefault()
      e.stopPropagation()
      const newCss = getSnippetEditorValue(id)
      const styleTag = getSnippetsStyleTag()

      setMarkedSnippet({ ...markedSnippet, classBody: newCss })

      if (styleTag && newCss) {
        styleTag.innerHTML = styleTag.innerHTML.replace(classBody, newCss)
        updateTemplateCss({
          variables: { id, rawCss: newCss, displayName },
        })
      }
    }

    const handleActions = e => {
      e.preventDefault()
      e.stopPropagation()
      const action = e.target.getAttribute('data-action') ?? 'toggle'
      const { tagName } = selectedCtx
      createOrUpdateStyleSheet(userSnippets)

      if (action === 'delete') {
        AiDesigner.filterBy({ tagName }, c => c.snippets.remove(`${className}`))
        deleteTemplate({ variables: { id } })
        isMarked && setMarkedSnippet({})
      } else {
        userInteractions.ctrl
          ? AiDesigner.updateContext().filterBy({ tagName }, c =>
              c.snippets[action](`${className}`),
            )
          : selectedCtx.snippets[action](`${className}`)
      }

      getUserSnippets()
    }

    const isPinned = pinnedSnippets.find(s => s.id === snip.id)

    const pinSnippet = unpin => {
      !unpin
        ? setPinnedSnippets([...pinnedSnippets, snip])
        : setPinnedSnippets(pinnedSnippets.filter(s => s.id !== snip.id))
    }

    return (
      <SnippetWrapper>
        <Snippet $active={!isMarked && isAdded} $marked={isMarked}>
          <SnippetsName>
            <p>{displayName}</p>
          </SnippetsName>
          <SnippetActions $disabled={!selectedCtx?.node}>
            <CleanButton
              onClick={() => pinSnippet(isPinned)}
              title={`Send to the ${isPinned ? 'bottom' : 'top'} of the list`}
              data-pin
            >
              <ArrowUpOutlined
                style={{
                  pointerEvents: 'none',
                  transform: `scale(0.8) rotate(${isPinned ? '180' : '0'}deg)`,
                }}
              />
            </CleanButton>

            <CleanButton
              data-action="toggle"
              onClick={handleActions}
              title={description}
            >
              <PoweroffOutlined style={{ pointerEvents: 'none' }} />
            </CleanButton>
            <CleanButton
              onClick={e => {
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
              onClick={handleActions}
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

  if (!settings.editor.enableSelection) return null
  return (
    <Root $active>
      <Each of={pinnedSnippets} as={snippetRender} if={pinnedSnippets.length} />
      <Each of={snippets} as={snippetRender} if={snippets.length} />
    </Root>
  )
}

export const useCreateDoc = () => {
  const { createResource } = useDocumentContext()
  const { modalState } = useModalContext()

  const onSubmit = fields => {
    const displayName = document.querySelector('[data-field-id="title"]').value

    if (!displayName) {
      document.querySelector('[data-field-id="title"]').style.border =
        '1px solid red'
      return false
    }

    createResource('doc', { title: displayName, extension: 'doc' })()
    return true
  }

  const handleCreateDoc = () => {
    modalState.update({
      show: true,
      title: 'New document',
      onSubmit,
      items: [
        {
          label: 'Name',
          component: (
            <input
              type="text"
              placeholder="...Choose a name for your document"
              data-field-id="title"
            />
          ),
        },
      ],
    })
  }

  return handleCreateDoc
}

export const useCreateFolder = () => {
  const { createResource, currentFolder } = useDocumentContext()
  const { extension } = currentFolder
  const { modalState } = useModalContext()

  const onSubmit = fields => {
    const displayName = document.querySelector('[data-field-id="title"]').value

    if (!displayName) {
      document.querySelector('[data-field-id="title"]').style.border =
        '1px solid red'
      return false
    }

    createResource('dir', {
      title: displayName,
      extension: extension || 'doc',
    })()
    return true
  }

  const handleCreateFolder = () => {
    modalState.update({
      show: true,
      title: 'New folder',
      onSubmit,
      items: [
        {
          label: 'Name',
          component: (
            <input
              type="text"
              placeholder="...Choose a name for your folder"
              data-field-id="title"
            />
          ),
        },
      ],
    })
  }

  return handleCreateFolder
}
