import React, { useContext } from 'react'
import {
  FolderOutlined,
  FolderOpenOutlined,
  FileAddOutlined,
  TeamOutlined,
  CodeOutlined,
  FolderAddOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import { AiDesignerContext } from '../component-ai-assistant/hooks/AiDesignerContext'
import { CleanButton } from '../_styleds/common'
import { uuid } from '@coko/client'
import { useDocumentContext } from '../dashboard/hooks/DocumentContext'
import { useHistory } from 'react-router-dom'

const Button = styled(CleanButton)`
  --shadow: ${p => (p.$expanded ? '#0001' : '#0000')};
  aspect-ratio: 1 / 1;
  background-color: ${p =>
    p.$expanded ? 'var(--color-trois-lightest)' : '#00000000'};
  border-radius: 50%;
  box-shadow: none;
  height: fit-content;
  text-decoration: none;
  transition: all 0.2s;
  width: 80%;

  &:hover {
    background-color: var(--color-trois-lightest);
  }

  svg {
    fill: ${p =>
      p.$expanded ? 'var(--color-trois-opaque)' : 'var(--color-trois)'};
    height: 80%;
    padding: 0;
    width: 20px;
  }
`
const toggleLayout = (...keys) => ({
  team: keys.includes('team'),
  chat: keys.includes('chat'),
  files: keys.includes('files'),
  templateManager: keys.includes('templateManager'),
  userMenu: !keys.includes('userMenu'),
})

export const FileManagerButton = () => {
  const { layout, updateLayout } = useContext(AiDesignerContext)
  const action = layout.files && layout.userMenu && 'userMenu'
  const newLayout = toggleLayout('files', action)

  return (
    <Button
      $expanded={layout.userMenu && layout.files}
      onClick={() => updateLayout(newLayout)}
      title="Show / Hide Filemanager"
    >
      {!layout.files || !layout.userMenu ? (
        <FolderOutlined style={{ fontSize: '32px' }} />
      ) : (
        <FolderOpenOutlined style={{ fontSize: '32px' }} />
      )}
    </Button>
  )
}

export const TeamButton = () => {
  const { layout, updateLayout } = useContext(AiDesignerContext)
  const action = layout.team && layout.userMenu && 'userMenu'
  const newLayout = toggleLayout('team', action)

  return (
    <Button
      onClick={() => updateLayout(newLayout)}
      $expanded={layout.userMenu && layout.team}
      title="Team"
    >
      <TeamOutlined />
    </Button>
  )
}

export const ChatButton = ({ aiIcon }) => {
  const { layout, updateLayout, designerOn } = useContext(AiDesignerContext)
  const action = layout.chat && layout.userMenu && 'userMenu'
  const newLayout = toggleLayout('chat', action)

  return (
    designerOn && (
      <Button
        $expanded={layout.userMenu && layout.chat}
        onClick={() => updateLayout(newLayout)}
      >
        <img style={{ width: '18px' }} src={aiIcon} alt="AI" />
      </Button>
    )
  )
}

export const TemplateManagerButton = () => {
  const { layout, updateLayout } = useContext(AiDesignerContext)
  const action = layout.templateManager && layout.userMenu && 'userMenu'
  const newLayout = toggleLayout('templateManager', action)

  return (
    <Button
      onClick={() => {
        console.log(newLayout)
        updateLayout(newLayout)
      }}
      $expanded={layout.userMenu && layout.templateManager}
      title="Template Editor"
    >
      <CodeOutlined style={{ fontSize: '25px' }} />
    </Button>
  )
}
