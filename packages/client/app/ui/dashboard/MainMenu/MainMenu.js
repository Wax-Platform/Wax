/* stylelint-disable declaration-no-important */
import React, { Fragment } from 'react'
import styled from 'styled-components'
import { useAiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
import { FlexCol, WindowHeading } from '../../_styleds/common'
import aiIcon from '../../../../static/chat-icon.svg'
import {
  ChatButton,
  FileManagerButton,
  TeamButton,
  TemplateManagerButton,
} from '../../menu/menuOptions'
import FileBrowser from './FileBrowser'
import ChatHistory from '../../component-ai-assistant/ChatHistory'
import TeamPopup from '../../common/TeamPopup'
import PathRender from './PathRender'
import { useDocumentContext } from '../hooks/DocumentContext'
import { TemplateManagerHeader } from '../../component-ai-assistant/components/CodeEditor'

const Menu = styled.nav`
  align-items: center;
  background: var(--color-trois-lightest-2);
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

const Content = styled.section`
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

const Heading = styled(WindowHeading)`
  background: #fff0;
  gap: 15px;
  padding: 20px 5px 0;
  width: 100%;

  p {
    background: var(--color-trois-lightest);
    border-radius: 1.5rem;
    box-shadow: var(--button-shadow);
    color: var(--color-trois-opaque) !important;
    font-size: 16px;
    font-weight: 200;
    letter-spacing: 1px;
    margin: 0;
    padding: 5px 12px;
  }
`

const FilesInfoFixed = styled.div`
  background: #fff0;
  border-bottom: 3px solid var(--color-trois-lightest);
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

const MainMenu = ({ enableLogin }) => {
  const { layout } = useAiDesignerContext()
  const { resourcesInFolder = [], currentFolder } = useDocumentContext()
  const { team, chat, templateManager, files } = layout

  const menuLabel = chat
    ? 'Chat'
    : team
    ? 'Team'
    : templateManager
    ? 'Code Editor'
    : null

  const isTemplatesFolder =
    currentFolder.resourceType === 'sys' && currentFolder.title === 'Templates'
  return (
    <Fragment>
      <Menu>
        <FileManagerButton />
        <TeamButton />
        <ChatButton aiIcon={aiIcon} />
        <TemplateManagerButton />
      </Menu>
      <Content layout={layout}>
        <Heading>
          {menuLabel && <p>{menuLabel}</p>}
          {files && (
            <FlexCol style={{ width: '100%' }}>
              <PathRender />
              {!isTemplatesFolder ? (
                <FilesInfoFixed>
                  <span>{resourcesInFolder?.length} resource(s)</span>
                  <span>(Right click to open context menu)</span>
                </FilesInfoFixed>
              ) : (
                <TemplateManagerHeader />
              )}
            </FlexCol>
          )}
        </Heading>
        {files && <FileBrowser />}
        {(chat || templateManager) && <ChatHistory />}
        {team && <TeamPopup enableLogin={enableLogin} />}
      </Content>
    </Fragment>
  )
}

export default MainMenu
