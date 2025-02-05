/* stylelint-disable no-descending-specificity */
/* stylelint-disable declaration-no-important */
import React, { Fragment, useEffect } from 'react'
import styled from 'styled-components'
import { useAiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
import {
  CleanButton,
  FlexCol,
  FlexRow,
  WindowHeading,
} from '../../_styleds/common'
import {
  ChatButton,
  FileManagerButton,
  TeamButton,
  CodeEditorButton,
  TemplateManagerButton,
} from '../../menu/menuOptions'
import FileBrowser from './FileBrowser'
import ChatHistory from '../../component-ai-assistant/ChatHistory'
import TeamPopup from '../../common/TeamPopup'
import PathRender from './PathRender'
import { useDocumentContext } from '../hooks/DocumentContext'
import { CodeEditor } from '../../component-ai-assistant/components/CodeEditor'
import PromptBox from '../../component-ai-assistant/components/PromptBox'
import {
  SnippetManagerHeader,
  SnippetsManager,
} from '../../component-ai-assistant/SnippetsManager'
import { htmlTagNames } from '../../component-ai-assistant/utils'
import { SaveOutlined } from '@ant-design/icons'
import { TemplatesDropdown } from './TemplatesDropdown'

const Menu = styled.nav`
  align-items: center;
  background: #fff0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  height: 100%;
  padding-top: 15px;
  width: 50px;
  z-index: 101;

  > button {
    font-size: 15px !important;
  }
`

const Content = styled.div`
  --border-color: ${({ layout }) =>
    layout.chat && layout.userMenu ? 'var(--color-trois-alpha)' : '#fff0'};
  background: #fff0;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: ${({ layout }) => (!layout.userMenu ? '0' : '27dvw')};
  opacity: ${({ layout }) => (!layout.userMenu ? '0.5' : '1')};
  overflow: hidden;
  position: relative;
  transition: all 0.3s;
  width: 27dvw;
  z-index: 999;
`

const Header = styled(WindowHeading)`
  background: #fff0;
  gap: 15px;
  height: fit-content;
  max-height: 100%;
  padding: ${({ $files }) => ($files ? '20px 5px 0' : '25px 5px 0')};
  width: 100%;
`
const MenuLabel = styled.p`
  background: var(--color-trois-lightest);
  border-radius: 1.5rem;
  box-shadow: var(--button-shadow);
  color: var(--color-trois-opaque) !important;
  font-size: 14px;
  font-weight: 200;
  letter-spacing: 1px;
  margin: 0 0 10px 8px;
  padding: 6px 12px;
`

const FilesInfoFixed = styled.div`
  background: var(--color-trois-lightest-2);
  border-bottom: 3px solid var(--color-trois-lightest);
  border-top: 1px solid var(--color-trois-lightest);
  color: var(--color-trois-opaque-2);
  display: flex;
  font-size: 11px;
  font-weight: 100;
  justify-content: space-between;
  padding: 8px 15px;
  user-select: none;
  width: 100%;
  z-index: 999;

  svg {
    fill: var(--color-trois-opaque);
  }
`
const ContentScrollWrapper = styled.div`
  height: 100%;
  overflow: auto;
  width: 100%;
`
const Footer = styled(FlexRow)`
  background: #fff0;
  gap: 0;
  height: fit-content;
  justify-content: center;
`

const CodeEditorHeaderRow = styled(FlexRow)`
  align-items: center;
  justify-content: space-between;
  width: 100%;

  button {
    font-size: 18px;
    padding: 8px 10px;

    svg {
      fill: var(--color-trois-opaque);
      pointer-events: none;
    }
  }
`

const MainMenu = ({ enableLogin }) => {
  const { layout, previewRef, css, selectedCtx, userInteractions } =
    useAiDesignerContext()
  const {
    resourcesInFolder = [],
    currentDoc,
    updateTemplateCss,
    updatePreview,
  } = useDocumentContext()
  const { team, chat, codeEditor, files, snippetsManager } = layout

  const menuLabel = chat ? 'Chat' : team ? 'Team' : null

  useEffect(() => {
    const body = previewRef?.current?.contentDocument.body
    console.log({
      body,
    })
    if (body) {
      body.style.transformOrigin = 'top center'
      layout.userMenu
        ? (body.style.transform = 'scale(0.80) translateX(-10%)')
        : (body.style.transform = 'scale(1)')
    }
  }, [layout.userMenu, css])

  return (
    <Fragment>
      <Menu>
        <FileManagerButton />
        <TeamButton />
        {/* <ChatButton /> */}
        <CodeEditorButton />
        <TemplateManagerButton />
      </Menu>
      <Content layout={layout}>
        <Header $files={files}>
          {menuLabel && <MenuLabel>{menuLabel}</MenuLabel>}
          {files && (
            <FlexCol style={{ width: '100%' }}>
              <PathRender />
              <hr style={{ height: '8px', margin: 0 }} />
              <FilesInfoFixed>
                <span>{resourcesInFolder?.length} resource(s)</span>
                <span>(Right click to open context menu)</span>
              </FilesInfoFixed>
            </FlexCol>
          )}
          {snippetsManager && (
            <FlexCol style={{ width: '100%' }}>
              <SnippetManagerHeader />
              <FilesInfoFixed>
                <span>
                  {userInteractions.ctrl && htmlTagNames[selectedCtx.tagName]
                    ? `All ${htmlTagNames[selectedCtx.tagName]}s`
                    : `${htmlTagNames[selectedCtx.tagName] || 'Document'}`}
                </span>
                <span>Select an element to apply a snippet</span>
              </FilesInfoFixed>
            </FlexCol>
          )}
          {codeEditor && (
            <FlexCol style={{ width: '100%' }}>
              <CodeEditorHeaderRow>
                <MenuLabel>Code Editor</MenuLabel>
                <FlexRow style={{ gap: '10px' }}>
                  <CleanButton
                    onClick={() => {
                      updateTemplateCss({
                        variables: { rawCss: css, id: currentDoc.template.id },
                      })
                      updatePreview(true, css)
                    }}
                  >
                    <SaveOutlined />
                  </CleanButton>
                </FlexRow>
              </CodeEditorHeaderRow>

              <FilesInfoFixed>
                <span>Editing document template</span>
                <TemplatesDropdown $show />
              </FilesInfoFixed>
            </FlexCol>
          )}
        </Header>
        <ContentScrollWrapper>
          {files && <FileBrowser />}
          {team && <TeamPopup enableLogin={enableLogin} />}
          {chat && <ChatHistory />}
          {snippetsManager && <SnippetsManager />}
          {codeEditor && <CodeEditor />}
        </ContentScrollWrapper>
        <Footer>
          {(chat || codeEditor || snippetsManager) && <PromptBox />}
        </Footer>
      </Content>
    </Fragment>
  )
}

export default MainMenu
