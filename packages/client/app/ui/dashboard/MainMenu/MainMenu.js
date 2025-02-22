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
  ImageBuilderButton,
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
import { ImageBuilder, ImageBuilderHeader } from './ImageBuilder'
import { useLayout } from '../../../hooks/LayoutContext'

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
  --border-color: ${({ chat }) =>
    chat ? 'var(--color-trois-alpha)' : '#fff0'};
  background: #fff0;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: ${({ isOn }) => (!isOn ? '0' : '27dvw')};
  opacity: ${({ isOn }) => (!isOn ? '0.5' : '1')};
  overflow: hidden;
  position: relative;
  transition: all 0.3s;
  width: 27dvw;
  z-index: 999;
`

const Header = styled(WindowHeading)`
  background: #fff0;
  /* flex-direction: column; */
  gap: 15px;
  height: fit-content;
  line-height: unset;
  max-height: 100%;
  min-height: unset;
  padding: 20px 0 0;
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
  z-index: 9999;

  svg {
    fill: var(--color-trois-opaque);
  }
`
const ContentScrollWrapper = styled(FlexRow)`
  align-items: flex-start;
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
  const { previewRef, css, selectedCtx, userInteractions, updatePreview } =
    useAiDesignerContext()

  const {
    resourcesInFolder = [],
    currentDoc,
    updateTemplateCss,
  } = useDocumentContext()

  const { userMenu, userMenuOpen } = useLayout()

  const { team, chat, templateManager, files, snippetsManager, images } =
    userMenu.state

  const menuLabel = team ? 'Team' : null

  useEffect(() => {
    const body = previewRef?.current?.contentDocument.body

    if (body) {
      body.style.transformOrigin = 'top center'
      userMenuOpen
        ? (body.style.transform = 'scale(0.80) translateX(-10%)')
        : (body.style.transform = 'scale(1)')
    }
  }, [userMenuOpen, css])

  return (
    <Fragment>
      <Menu>
        <FileManagerButton />
        <TeamButton />
        <ImageBuilderButton />
        <CodeEditorButton />
        <TemplateManagerButton />
      </Menu>
      <Content {...{ ...userMenu.state, isOn: userMenuOpen }}>
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
              <CodeEditorHeaderRow style={{ gap: '10px', width: '100%' }}>
                <MenuLabel>Snippets Manager</MenuLabel>
                <SnippetManagerHeader />
              </CodeEditorHeaderRow>
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
          {(templateManager || chat) && (
            <FlexCol style={{ width: '100%' }}>
              <CodeEditorHeaderRow>
                <MenuLabel>Template Manager</MenuLabel>
                <FlexRow style={{ gap: '10px' }}>
                  <ChatButton />
                  <CleanButton
                    onClick={() => {
                      updateTemplateCss({
                        variables: { rawCss: css, id: currentDoc.templateId },
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
          {images && (
            <FlexCol style={{ width: '100%' }}>
              <FilesInfoFixed>
                <ImageBuilderHeader />
              </FilesInfoFixed>
            </FlexCol>
          )}
        </Header>
        <ContentScrollWrapper id="user-menu-scroller">
          {files && <FileBrowser />}
          {team && <TeamPopup enableLogin={enableLogin} />}
          {chat && <ChatHistory />}
          {snippetsManager && <SnippetsManager />}
          {templateManager && <CodeEditor />}
          {images && <ImageBuilder />}
        </ContentScrollWrapper>
        <Footer>
          {(chat || templateManager || snippetsManager || images) && (
            <PromptBox />
          )}
        </Footer>
      </Content>
    </Fragment>
  )
}

export default MainMenu
