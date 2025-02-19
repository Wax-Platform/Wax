import React from 'react'
import {
  FolderOutlined,
  FolderOpenOutlined,
  TeamOutlined,
  ScissorOutlined,
  FileImageOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import { useAiDesignerContext } from '../component-ai-assistant/hooks/AiDesignerContext'
import { CleanButton } from '../_styleds/common'
import chatIcon from '../../../static/chat-icon2.svg'
import templateIcon from '../../../static/template-icon-2.svg'
import { useLayout } from '../../hooks/LayoutContext'

const Button = styled(CleanButton)`
  --shadow: ${p => (p.$expanded ? '#0001' : '#0000')};
  aspect-ratio: 1 / 1;
  background-color: ${p =>
    p.$expanded ? 'var(--color-trois-lightest)' : '#00000000'};
  border-radius: 50%;
  box-shadow: none;
  height: fit-content;
  max-height: ${p => (p.$hide ? 0 : '100%')};
  max-width: ${p => (p.$hide ? 0 : '80%')};
  opacity: ${p => (p.$hide ? 0 : 1)};
  pointer-events: ${p => (p.$hide ? 'none' : 'auto')};
  text-decoration: none;
  transition: all 0.2s;
  width: 80%;

  svg {
    fill: ${p =>
      p.$expanded ? 'var(--color-trois-opaque)' : 'var(--color-trois-opaque)'};
    height: 80%;
    padding: 0;
    width: 20px;
  }

  img {
    height: 20px;
    object-fit: contain;
    padding: 0;
    transform: scale(1.1) translateY(2px);
  }

  &:hover {
    background-color: var(--color-trois-lightest);
  }
`

export const FileManagerButton = () => {
  const { userMenu, hideUserMenu, showUserMenu, userMenuOpen } = useLayout()

  return (
    <Button
      onClick={() => {
        !userMenuOpen && showUserMenu()
        userMenu.state.files ? hideUserMenu() : userMenu.update({ files: true })
      }}
      $expanded={userMenu.state.files}
      title="Show / Hide Filemanager"
    >
      {!userMenu.state.files ? (
        <FolderOutlined style={{ fontSize: '32px' }} />
      ) : (
        <FolderOpenOutlined style={{ fontSize: '32px' }} />
      )}
    </Button>
  )
}

export const TeamButton = () => {
  const { userMenu, hideUserMenu, showUserMenu, userMenuOpen } = useLayout()

  return (
    <Button
      onClick={() => {
        !userMenuOpen && showUserMenu()
        userMenu.state.team ? hideUserMenu() : userMenu.update({ team: true })
      }}
      $expanded={userMenu.state.team}
      title="Team"
    >
      <TeamOutlined />
    </Button>
  )
}

export const ChatButton = () => {
  const { designerOn } = useAiDesignerContext()
  const { userMenu, hideUserMenu, showUserMenu, userMenuOpen } = useLayout()

  return (
    <Button
      $hide={!designerOn}
      onClick={() => {
        !userMenuOpen && showUserMenu()
        userMenu.state.chat ? hideUserMenu() : userMenu.update({ chat: true })
      }}
      $expanded={userMenu.state.chat}
      title="Chat"
    >
      <img src={chatIcon} alt="Chat" />
    </Button>
  )
}

export const CodeEditorButton = () => {
  const { designerOn } = useAiDesignerContext()
  const { userMenu, hideUserMenu, showUserMenu, userMenuOpen } = useLayout()

  return (
    <Button
      $hide={!designerOn}
      onClick={() => {
        !userMenuOpen && showUserMenu()
        userMenu.state.templateManager
          ? hideUserMenu()
          : userMenu.update({ templateManager: true })
      }}
      $expanded={userMenu.state.templateManager}
      title="Template Editor"
    >
      <img src={templateIcon} alt="Code Editor" />
    </Button>
  )
}

export const TemplateManagerButton = () => {
  const { designerOn } = useAiDesignerContext()
  const { userMenu, hideUserMenu, showUserMenu, userMenuOpen } = useLayout()

  return (
    <Button
      $hide={!designerOn}
      onClick={() => {
        !userMenuOpen && showUserMenu()
        userMenu.state.snippetsManager
          ? hideUserMenu()
          : userMenu.update({ snippetsManager: true })
      }}
      $expanded={userMenu.state.snippetsManager}
      title="Snippets Manager"
    >
      <ScissorOutlined />
    </Button>
  )
}

export const SnippetsButton = () => {
  const { designerOn } = useAiDesignerContext()
  const { userMenu, hideUserMenu, showUserMenu, userMenuOpen } = useLayout()

  return (
    <Button
      $hide={!designerOn}
      onClick={() => userMenu.update({ snippets: !userMenu.state.snippets })}
      $expanded={userMenu.state.snippets}
      title="Snippets"
    >
      <ScissorOutlined />
    </Button>
  )
}

export const ImageBuilderButton = () => {
  const { designerOn } = useAiDesignerContext()
  const { userMenu, hideUserMenu, showUserMenu, userMenuOpen } = useLayout()

  return (
    <Button
      onClick={() => {
        !userMenuOpen && showUserMenu()
        userMenu.state.images
          ? hideUserMenu()
          : userMenu.update({ images: true })
      }}
      $expanded={userMenu.state.images}
      title="Image Builder"
    >
      <FileImageOutlined />
    </Button>
  )
}
