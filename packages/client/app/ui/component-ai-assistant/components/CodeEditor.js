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
      title: 'Create a new template',
      onSubmit,
      items: CREATE_TEMPLATE_MODAL_ITEMS,
    })
  }

  const handleFetchTemplate = () => {
    modalState.update({
      show: true,
      title: 'Fetch template from url',
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
            title: 'Create a new template',
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
            title: 'Fetch template from url',
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

// const VIEW_BASED_CONTAINERS = {
//   list: ListContainer,
//   default: GridContainer,
// }

// export const TemplateManager = ({ view }) => {
//   const { modalState } = useModalContext()
//   const { setCss, updatePreview } = useAiDesignerContext()
//   const {
//     contextualMenu,
//     currentDoc,
//     updateTemplateCss,
//     deleteTemplate,
//     systemTemplatesData,
//   } = useDocumentContext()

//   const templates = systemTemplatesData?.getUserTemplates || []

//   const templateItemRender = template => {
//     const isCurrentTemplate = currentDoc?.template?.id === template.id

//     const handleContextMenu = e => {
//       e.preventDefault()

//       const contextMenuActions = {
//         preview: () => {
//           setCss(template.rawCss)
//           updatePreview(true)
//         },
//         fork: () => {
//           updateTemplateCss({
//             variables: {
//               id: currentDoc.template.id,
//               rawCss: template.rawCss,
//               displayName: template.displayName,
//             },
//           })
//           setCss(template.rawCss)
//           updatePreview(true)
//         },
//         showCode: () => {
//           modalState.update({
//             show: true,
//             title: capitalize(template.displayName),
//             items: [
//               {
//                 label: null,
//                 component: (
//                   <TemplateEditor
//                     extensions={[cssLang(), EditorView.editable.of(false)]}
//                     onChange={() => {}}
//                     value={template.rawCss}
//                     basicSetup={{ readOnly: true }}
//                   />
//                 ),
//               },
//             ],
//           })
//         },
//         delete: () => {
//           deleteTemplate({ variables: { id: template.id } })
//         },
//       }

//       contextualMenu.update({
//         show: true,
//         x: e.clientX,
//         y: e.clientY,
//         items: generateContextMenuItems(contextMenuActions),
//       })
//     }

//     const Container = switchOn(view, VIEW_BASED_CONTAINERS)
//     return (
//       <Container style={{ gap: '4px' }} onContextMenu={handleContextMenu}>
//         <FileIcon />
//         <IconTitleContainer>
//           <TitleLabel>
//             {isCurrentTemplate ? 'Document template' : template.displayName}
//           </TitleLabel>
//         </IconTitleContainer>
//       </Container>
//     )
//   }

//   return <Each of={templates} as={templateItemRender} if={templates.length} />
// }

// const CONTEXT_MENU_OPTIONS = ['preview', 'fork', 'showCode', 'delete']

// const CONTEXT_MENU_RENDER = {
//   preview: labelRender(<EyeOutlined />, 'Preview'),
//   fork: labelRender(<ForkOutlined />, 'Fork'),
//   showCode: labelRender(<CodeOutlined />, 'View Code'),
//   delete: labelRender(<DeleteOutlined />, 'Delete'),
// }

// function generateContextMenuItems({ preview, fork, showCode, delete: remove }) {
//   const optionValidations = {
//     default: true,
//   }

//   const actions = {
//     preview,
//     fork,
//     showCode,
//     delete: remove,
//     default: () => {},
//   }

//   const buildOption = optionName => {
//     const option = {
//       label: CONTEXT_MENU_RENDER[optionName],
//       action: actions[optionName],
//     }

//     const includeOption = switchOn(optionName, optionValidations)
//     return includeOption && option
//   }

//   return CONTEXT_MENU_OPTIONS.map(buildOption).filter(Boolean)
// }

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
