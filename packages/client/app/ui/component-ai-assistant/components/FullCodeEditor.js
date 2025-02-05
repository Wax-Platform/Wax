/* stylelint-disable string-quotes */
/* stylelint-disable declaration-no-important */
import React, { useEffect, useState } from 'react'
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror'
import { css as cssLang } from '@codemirror/lang-css'
import { useAiDesignerContext } from '../hooks/AiDesignerContext'
import styled from 'styled-components'
import { useDocumentContext } from '../../dashboard/hooks/DocumentContext'
import { useLazyQuery } from '@apollo/client'
import { GET_TEMPLATE } from '../../../graphql/templates.graphql'
import { TemplateEditor } from './CodeEditor'
import { CleanButton, FlexRow } from '../../_styleds/common'
import { CloseOutlined, SaveOutlined } from '@ant-design/icons'
import { Actions } from '../../dashboard/MainMenu/PathRender'

const StyledWindow = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100dvh - (var(--header-height) + var(--menu-height, 0px)));

  opacity: ${p => (p.$show ? '1' : '0')};

  overflow: hidden;
  position: relative;
  transition: all 0.3s linear;
  width: ${p => (p.$show ? '100%' : '0')};
`

const CssEditor = styled(TemplateEditor)`
  height: 100%;

  .cm-scroller {
    height: 100%;
    overflow: visible;
  }
`

const EditorScroll = styled.div`
  display: flex;
  margin: 0;
  overflow: scroll;
  position: relative;
  scroll-behavior: smooth;
  width: 100%;
`

const Header = styled(FlexRow)`
  align-items: center;
  border-bottom: 1px solid var(--color-trois-lightest);
  justify-content: space-between;
  padding: 13px 20px;

  h3 {
    color: var(--color-trois-opaque);
    margin: 0;
  }
`

export const FullCodeEditor = ({ code, config }) => {
  const [localCode, setLocalCode] = useState(code)
  const { templateToEdit, setTemplateToEdit } = useAiDesignerContext()
  const { updateTemplateCss } = useDocumentContext()

  const [getTemplate, { data: templateData }] = useLazyQuery(GET_TEMPLATE)
  useEffect(() => {
    if (templateToEdit) {
      getTemplate({
        variables: {
          id: templateToEdit,
        },
      })
    }
  }, [templateToEdit])

  useEffect(() => {
    if (templateData?.getTemplate?.rawCss) {
      setLocalCode(templateData.getTemplate.rawCss)
    }
  }, [templateData])

  return (
    <StyledWindow $show={templateToEdit}>
      <Header>
        <h3>
          {templateData?.getTemplate?.displayName
            ? templateData.getTemplate.displayName
            : 'Loading...'}
        </h3>
        <FlexRow style={{ gap: '8px', alignItems: 'center' }}>
          <Actions>
            <CleanButton
              onClick={() => {
                updateTemplateCss({
                  variables: {
                    id: templateToEdit,
                    rawCss: localCode,
                  },
                })
              }}
            >
              <SaveOutlined />
            </CleanButton>
          </Actions>
          <Actions>
            <CleanButton onClick={() => setTemplateToEdit(null)}>
              <CloseOutlined style={{ pointerEvents: 'none' }} />
            </CleanButton>
          </Actions>
        </FlexRow>
      </Header>
      <EditorScroll>
        <CssEditor
          value={localCode}
          extensions={[cssLang(), EditorView.lineWrapping]}
          onChange={value => {
            setLocalCode(value)
          }}
          {...config}
        />
      </EditorScroll>
    </StyledWindow>
  )
}
