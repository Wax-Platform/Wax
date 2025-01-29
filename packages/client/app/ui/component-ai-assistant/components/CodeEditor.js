/* stylelint-disable declaration-no-important */
import React, { useEffect, useState } from 'react'
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
  FileOutlined,
  ForkOutlined,
} from '@ant-design/icons'
import { FlexCol, FlexRow } from '../../_styleds/common'
import { labelRender } from '../../dashboard/MainMenu/utils/resourcesUtils'
import { switchOn } from '../../../shared/generalUtils'
import { useModalContext } from '../../../hooks/modalContext'
import { capitalize, set } from 'lodash'
import {
  FileIcon,
  GridContainer,
  IconTitleContainer,
  TitleLabel,
} from '../../dashboard/MainMenu/Resource'

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
    width: 100%;
  }
`

const TemplateItem = styled.div`
  align-items: center;
  background: var(--color-trois-lightest);
  border: ${p => (p.$docTemplate ? '1px dashed var(--color-trois)' : 'none')};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: calc(25.5dvw / 5);
  width: calc((25.5dvw) / 4.3);

  p {
    color: var(--color-trois-opaque);
    font-size: 14px;
    margin: 0;
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
    label: 'Css',
    component: (
      <TemplateEditor
        style={{ width: '100%' }}
        basicSetup={{ lineNumbers: false }}
        data-field-id="rawCss"
        extensions={[cssLang()]}
        onChange={content => {
          document.querySelector('[data-field-id="rawCss"]').value = content
        }}
      />
    ),
  },
]

const Header = styled(FlexRow)`
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  width: 100%;

  input {
    background: none;
    border: none;
    border-bottom: 1px solid var(--color-trois-opaque);
    font-size: 14px;
    padding: 5px;
    width: 100%;

    &:focus {
      border-bottom-color: var(--color-trois);
      outline: none;
    }
  }
`

export const TemplateManagerHeader = () => {
  const { createTemplate, fetchAndCreateTemplateFromUrl } = useDocumentContext()
  const { modalState } = useModalContext()
  const [fetchTemplateInput, setFetchTemplateInput] = useState('')

  const handleInputChange = event => {
    setFetchTemplateInput(event.target.value)
  }
  const onSubmit = fields => {
    createTemplate({ variables: { input: { ...fields } } })
  }

  return (
    <Header>
      <input
        type="text"
        placeholder="Write the url to fetch the template"
        value={fetchTemplateInput}
        onChange={handleInputChange}
      />
      <button
        onClick={e => {
          e.preventDefault()
          fetchAndCreateTemplateFromUrl({
            variables: { url: fetchTemplateInput },
          })
        }}
      >
        Fetch
      </button>
      <button
        onClick={() =>
          modalState.update({
            show: true,
            title: 'Create a new template',
            onSubmit,
            items: CREATE_TEMPLATE_MODAL_ITEMS,
          })
        }
      >
        Create
      </button>
    </Header>
  )
}

const TemplatesWrapper = styled(FlexRow)`
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-start;
  padding: 4px;
  width: 100%;
`

export const TemplateManager = () => {
  const { modalState } = useModalContext()
  const { setCss, updatePreview } = useAiDesignerContext()
  const {
    contextualMenu,
    currentDoc,
    updateTemplateCss,
    deleteTemplate,
    systemTemplatesData,
    getDoc,
  } = useDocumentContext()

  const templates = systemTemplatesData?.getUserTemplates || []

  const templateItemRender = template => {
    const isCurrentTemplate = currentDoc?.template?.id === template.id
    console.log(template.imageUrl)

    const handleContextMenu = e => {
      e.preventDefault()

      const contextMenuActions = {
        preview: () => {
          setCss(template.rawCss)
        },
        fork: () => {
          updateTemplateCss({
            variables: {
              id: currentDoc.template.id,
              rawCss: template.rawCss,
              displayName: template.displayName,
            },
          }).then(() => getDoc({ variables: { id: currentDoc.id } }))
          setCss(template.rawCss)
          updatePreview(true)
        },
        showCode: () => {
          modalState.update({
            show: true,
            title: capitalize(template.displayName),
            items: [
              {
                label: null,
                component: (
                  <TemplateEditor
                    extensions={[cssLang(), EditorView.editable.of(false)]}
                    onChange={() => {}}
                    value={template.rawCss}
                    basicSetup={{ readOnly: true }}
                  />
                ),
              },
            ],
          })
        },
        delete: () => {
          deleteTemplate({ variables: { id: template.id } })
        },
      }

      contextualMenu.update({
        show: true,
        x: e.clientX,
        y: e.clientY,
        items: generateContextMenuItems(contextMenuActions),
      })
    }
    return (
      <GridContainer style={{ gap: '4px' }} onContextMenu={handleContextMenu}>
        <FileIcon />
        <IconTitleContainer>
          <TitleLabel>
            {isCurrentTemplate ? 'Document template' : template.displayName}
          </TitleLabel>
        </IconTitleContainer>
      </GridContainer>
    )
  }

  return <Each of={templates} as={templateItemRender} if={templates.length} />
}

const CONTEXT_MENU_OPTIONS = ['preview', 'fork', 'showCode', 'delete']

const CONTEXT_MENU_RENDER = {
  preview: labelRender(<EyeOutlined />, 'Preview'),
  fork: labelRender(<ForkOutlined />, 'Fork'),
  showCode: labelRender(<CodeOutlined />, 'View Code'),
  delete: labelRender(<DeleteOutlined />, 'Delete'),
}

function generateContextMenuItems({ preview, fork, showCode, delete: remove }) {
  const optionValidations = {
    default: true,
  }

  const actions = {
    preview,
    fork,
    showCode,
    delete: remove,
    default: () => {},
  }

  const buildOption = optionName => {
    const option = {
      label: CONTEXT_MENU_RENDER[optionName],
      action: actions[optionName],
    }

    const includeOption = switchOn(optionName, optionValidations)
    return includeOption && option
  }

  return CONTEXT_MENU_OPTIONS.map(buildOption).filter(Boolean)
}

export const CodeEditor = () => {
  const { css, setCss } = useAiDesignerContext()

  return (
    <TemplateEditor
      extensions={[cssLang()]}
      onChange={content => {
        setCss(content)
      }}
      value={css}
    />
  )
}
