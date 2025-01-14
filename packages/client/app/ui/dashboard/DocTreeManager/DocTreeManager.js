/* stylelint-disable declaration-no-important */
import React, { Fragment, useContext } from 'react'
import styled from 'styled-components'
import { AiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
import { WindowHeading } from '../../_styleds/common'
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
  padding: 20px 5px 15px;
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

const MainMenu = ({ enableLogin }) => {
  const { layout } = useContext(AiDesignerContext)
  const { team, chat, templateManager, files } = layout
  const menuLabel = chat
    ? 'Chat'
    : team
    ? 'Team'
    : templateManager
    ? 'Template Editor'
    : null

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
          {files && <PathRender />}
        </Heading>
        {files && <FileBrowser />}
        {(chat || templateManager) && <ChatHistory />}
        {team && <TeamPopup enableLogin={enableLogin} />}
      </Content>
    </Fragment>
  )
}

export default MainMenu
