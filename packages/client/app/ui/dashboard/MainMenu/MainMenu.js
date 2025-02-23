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
import { htmlTagNames, SettingsIcon } from '../../component-ai-assistant/utils'
import {
  CodeOutlined,
  MessageOutlined,
  SaveOutlined,
  ToolOutlined,
} from '@ant-design/icons'
import { TemplatesDropdown } from './TemplatesDropdown'
import { ImageBuilder, ImageBuilderHeader } from './ImageBuilder'
import { useLayout } from '../../../hooks/LayoutContext'
import { useBool } from '../../../hooks/dataTypeHooks'

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
  --content-window-w: 27dvw;
  background: #fff0;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: ${({ isOn }) => (!isOn ? '0' : '27dvw')};
  opacity: ${({ isOn }) => (!isOn ? '0.5' : '1')};
  overflow: hidden;
  position: relative;
  transition: all 0.3s;
  width: var(--content-window-w);
  z-index: 999;
`

const Header = styled(WindowHeading)`
  background: #fff0;
  border-bottom: 1px solid var(--color-trois-lightest);

  /* flex-direction: column; */
  gap: 15px;
  height: fit-content;
  line-height: unset;
  max-height: 100%;
  min-height: unset;
  padding: 20px 0 0;
  width: 100%;
  z-index: 9999;
`
const MenuLabel = styled(CleanButton)`
  align-items: center;
  background: var(--color-trois-lightest);
  border-radius: 1.5rem;
  box-shadow: var(--button-shadow);
  color: var(--color-trois-opaque) !important;
  display: flex;
  font-size: 14px;
  font-weight: 200;
  gap: 5px;
  justify-content: center;
  letter-spacing: 1px;
  margin: 0 0 10px 8px;
  opacity: ${({ $inactive }) => ($inactive ? '0.8' : '1')};
  padding: 6px 16px 6px 12px;
  transform: ${({ $inactive }) => ($inactive ? 'scale(0.95)' : 'scale(1)')};
  transition: all 0.3s;

  span {
    transform: ${({ $inactive }) => ($inactive ? 'scale(0.9)' : 'scale(1)')};
    transition: all 0.3s;
  }
`

const SecondHeaderRow = styled.div`
  align-items: baseline;
  background: var(--color-trois-lightest-2);
  border-bottom: 3px solid var(--color-trois-lightest);
  border-width: ${({ $hide }) => (!$hide ? '0px 0 3px' : '0')};
  color: var(--color-trois-opaque-2);
  display: flex;
  font-size: 11px;
  font-weight: 100;
  justify-content: space-between;
  max-height: ${({ $hide }) => ($hide ? '0' : '500px')};
  padding: 5px 15px;
  padding-block: ${({ $hide }) => ($hide ? '0' : '5px')};
  transform: scaleY(${({ $hide }) => ($hide ? '0' : '1')});
  transform-origin: top;
  transition: all 0.3s;
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

const FirstHeaderRow = styled(FlexRow)`
  align-items: center;
  justify-content: space-between;
  width: 100%;

  button {
    padding: 8px 10px;

    svg {
      fill: var(--color-trois-opaque);
      pointer-events: none;
    }
  }
`

const ImagesHeader = () => {
  const hide = useBool({ start: true })
  return (
    <FlexCol style={{ width: '100%' }}>
      <FirstHeaderRow>
        <MenuLabel>Images</MenuLabel>
        <CleanButton>
          <ToolOutlined onClick={hide.toggle} style={{ fontSize: '16px' }} />
        </CleanButton>
      </FirstHeaderRow>
      <SecondHeaderRow $hide={hide.state}>
        <ImageBuilderHeader />
      </SecondHeaderRow>
    </FlexCol>
  )
}
const MainMenu = ({ enableLogin }) => {
  const { previewRef, css, selectedCtx, userInteractions } =
    useAiDesignerContext()

  const { resourcesInFolder = [] } = useDocumentContext()
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
      <Content isOn={userMenuOpen}>
        <Header $files={files}>
          {menuLabel && <MenuLabel>{menuLabel}</MenuLabel>}
          {files && (
            <FlexCol style={{ width: '100%' }}>
              <PathRender />
              <SecondHeaderRow>
                <span>{resourcesInFolder?.length} resource(s)</span>
                <span>(Right click to open context menu)</span>
              </SecondHeaderRow>
            </FlexCol>
          )}
          {snippetsManager && (
            <FlexCol style={{ width: '100%' }}>
              <FirstHeaderRow style={{ gap: '10px', width: '100%' }}>
                <MenuLabel>Snippets Manager</MenuLabel>
                <SnippetManagerHeader />
              </FirstHeaderRow>
              <SecondHeaderRow>
                <span>
                  {userInteractions.ctrl && htmlTagNames[selectedCtx.tagName]
                    ? `All ${htmlTagNames[selectedCtx.tagName]}s`
                    : `${htmlTagNames[selectedCtx.tagName] || 'Document'}`}
                </span>
                <span>Select an element to apply a snippet</span>
              </SecondHeaderRow>
            </FlexCol>
          )}
          {(templateManager || chat) && <TemplateManagerHeader />}
          {images && <ImagesHeader />}
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

const TabLabel = styled.span`
  padding-right: 4px;
`
const TemplateManagerHeader = () => {
  const { userMenu } = useLayout()
  const { css, updatePreview } = useAiDesignerContext()
  const { currentDoc, updateTemplateCss } = useDocumentContext()

  return (
    <FlexCol style={{ width: '100%' }}>
      <FirstHeaderRow>
        <FlexRow>
          <MenuLabel
            $inactive={!userMenu.state.chat}
            onClick={() => userMenu.update({ chat: true })}
          >
            <MessageOutlined style={{ pointerEvents: 'none' }} />
            <TabLabel>Chat</TabLabel>
          </MenuLabel>
          <MenuLabel
            $inactive={!userMenu.state.templateManager}
            onClick={() => userMenu.update({ templateManager: true })}
          >
            <CodeOutlined />
            <TabLabel>Code</TabLabel>
          </MenuLabel>
        </FlexRow>
        <FlexRow style={{ gap: '10px' }}>
          <CleanButton
            onClick={() => {
              updateTemplateCss({
                variables: { rawCss: css, id: currentDoc.templateId },
              })
              updatePreview(true, css)
            }}
          >
            <SaveOutlined style={{ fontSize: '18px' }} />
          </CleanButton>
        </FlexRow>
      </FirstHeaderRow>
      <SecondHeaderRow>
        <span>Editing document template</span>
        <TemplatesDropdown $show />
      </SecondHeaderRow>
    </FlexCol>
  )
}
