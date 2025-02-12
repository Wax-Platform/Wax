/* stylelint-disable declaration-no-important */
import React, { useEffect } from 'react'
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror'
import { css as cssLang } from '@codemirror/lang-css'
import { useAiDesignerContext } from '../hooks/AiDesignerContext'
import styled from 'styled-components'
import { useDocumentContext } from '../../dashboard/hooks/DocumentContext'
import Each from '../utils/Each'
import {
  CodeOutlined,
  DeleteOutlined,
  EyeOutlined,
  ForkOutlined,
  GitlabOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons'
import { CleanButton } from '../../_styleds/common'
import { labelRender } from '../../dashboard/MainMenu/utils/resourcesUtils'
import { switchOn } from '../../../shared/generalUtils'
import { useModalContext } from '../../../hooks/modalContext'
import { capitalize, debounce } from 'lodash'
import {
  FileIcon,
  GridContainer,
  IconTitleContainer,
  ListContainer,
  TitleLabel,
} from '../../dashboard/MainMenu/Resource'
import AiDesigner from '../../../AiDesigner/AiDesigner'

const CssEditor = styled(ReactCodeMirror)`
  * {
    outline: none !important;
  }

  .cm-content {
    border: none;
    font-size: 14px;
    width: 100%;
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
export const TemplateEditor = styled(CssEditor)`
  > :first-child {
    height: 100%;
    max-height: unset;
    width: 100%;
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

const FETCH_TEMPLATE_MODAL_ITEMS = [
  {
    label: 'Url',
    component: (
      <input
        type="text"
        placeholder="...Write the url to fetch the template"
        data-field-id="url"
      />
    ),
  },
]

export const useCreateTemplate = () => {
  const {
    createResource,
    fetchAndCreateTemplateFromUrl,
    graphQL,
    currentFolder,
  } = useDocumentContext()
  const { modalState } = useModalContext()

  const onSubmit = fields => {
    console.log({ fields })
    const templateProps = JSON.stringify({
      ...fields,
      category: 'user',
      status: 'private',
    })
    createResource('template', { title: fields.displayName, templateProps })()
  }

  const onSubmitFetch = fields => {
    fetchAndCreateTemplateFromUrl({
      variables: { ...fields },
    })
    graphQL.openFolder({
      variables: { id: currentFolder.id },
      fetchPolicy: 'no-cache',
    })
  }

  const handleCreateTemplate = () => {
    modalState.update({
      show: true,
      title: 'New template',
      onSubmit,
      items: CREATE_TEMPLATE_MODAL_ITEMS,
    })
  }

  const handleFetchTemplate = () => {
    modalState.update({
      show: true,
      title: 'Fetch template',
      onSubmit: onSubmitFetch,
      items: FETCH_TEMPLATE_MODAL_ITEMS,
    })
  }

  return { handleCreateTemplate, handleFetchTemplate }
}

export const TemplateManagerHeader = () => {
  const {
    createResource,
    currentFolder,
    fetchAndCreateTemplateFromUrl,
    graphQL,
  } = useDocumentContext()
  const { modalState } = useModalContext()

  const onSubmit = fields => {
    console.log({ fields })
    const templateProps = JSON.stringify({
      ...fields,
      category: 'user',
      status: 'private',
    })
    createResource('template', { title: fields.displayName, templateProps })()
  }

  const onSubmitFetch = fields => {
    fetchAndCreateTemplateFromUrl({
      variables: { ...fields },
    }).then(() => {
      debounce(
        graphQL.openFolder,
        2000,
      )({
        variables: { id: currentFolder.id },
        fetchPolicy: 'no-cache',
      })
    })
  }
  return (
    <>
      <CleanButton
        onClick={() =>
          modalState.update({
            show: true,
            title: 'New template',
            onSubmit,
            items: CREATE_TEMPLATE_MODAL_ITEMS,
          })
        }
      >
        <PlusCircleOutlined />
      </CleanButton>
      <CleanButton
        onClick={() => {
          modalState.update({
            show: true,
            title: 'Fetch template',
            onSubmit: onSubmitFetch,
            items: FETCH_TEMPLATE_MODAL_ITEMS,
          })
        }}
      >
        <GitlabOutlined />
      </CleanButton>
    </>
  )
}

export const CodeEditor = () => {
  const { css, setCss } = useAiDesignerContext()

  useEffect(() => {
    AiDesigner.select('aid-ctx-main')
  }, [])

  return (
    <TemplateEditor
      extensions={[cssLang(), EditorView.lineWrapping]}
      onChange={content => {
        setCss(content)
      }}
      value={css}
    />
  )
}
