import React, { useContext } from 'react'
import {
  FolderOutlined,
  FolderOpenOutlined,
  TeamOutlined,
  CodeOutlined,
  ScissorOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import { useAiDesignerContext } from '../component-ai-assistant/hooks/AiDesignerContext'
import { CleanButton } from '../_styleds/common'
import chatIcon from '../../../static/chat-icon2.svg'
import templateIcon from '../../../static/template-icon-2.svg'
import AiDesigner from '../../AiDesigner/AiDesigner'
import { getPreviewIframe } from '../component-ai-assistant/utils'

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
const toggleLayout = (...keys) => ({
  team: keys.includes('team'),
  chat: keys.includes('chat'),
  files: keys.includes('files'),
  snippetsManager: keys.includes('snippetsManager'),
  codeEditor: keys.includes('codeEditor'),
  userMenu: !keys.includes('userMenu'),
})

export const FileManagerButton = () => {
  const { layout, updateLayout } = useAiDesignerContext()
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
  const { layout, updateLayout } = useAiDesignerContext()
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

export const ChatButton = () => {
  const { layout, updateLayout, designerOn } = useAiDesignerContext()
  const action = layout.chat && layout.userMenu && 'userMenu'
  const newLayout = toggleLayout('chat', action)

  return (
    designerOn && (
      <Button
        $expanded={layout.userMenu && layout.chat}
        onClick={() => updateLayout(newLayout)}
      >
        <img src={chatIcon} alt="Chat" />
      </Button>
    )
  )
}

export const CodeEditorButton = () => {
  const { layout, updateLayout, designerOn } = useAiDesignerContext()
  const action = layout.codeEditor && layout.userMenu && 'userMenu'
  const newLayout = toggleLayout('codeEditor', action)

  return (
    designerOn && (
      <Button
        onClick={() => {
          updateLayout(newLayout)

          if (AiDesigner.selected?.id !== 'aid-ctx-main') {
            AiDesigner.select('aid-ctx-main')
            getPreviewIframe()
              ?.contentDocument.querySelector('.selected-id')
              ?.classList.remove('selected-id')
          }
        }}
        $expanded={layout.userMenu && layout.codeEditor}
        title="Template Editor"
      >
        <img src={templateIcon} alt="Code Editor" />
      </Button>
    )
  )
}

export const TemplateManagerButton = () => {
  const { layout, updateLayout, designerOn } = useAiDesignerContext()
  const action = layout.snippetsManager && layout.userMenu && 'userMenu'
  const newLayout = toggleLayout('snippetsManager', action)

  return (
    designerOn && (
      <Button
        onClick={() => updateLayout(newLayout)}
        $expanded={layout.userMenu && layout.snippetsManager}
        title="Snippets Manager"
      >
        <ScissorOutlined />
      </Button>
    )
  )
}

export const SnippetsButton = () => {
  const { layout, updateLayout, designerOn } = useAiDesignerContext()
  const action = layout.snippets && layout.userMenu && 'userMenu'
  const newLayout = toggleLayout('snippets', action)

  return (
    designerOn && (
      <Button
        onClick={() => updateLayout(newLayout)}
        $expanded={layout.userMenu && layout.snippets}
        title="Snippets"
      >
        <ScissorOutlined />
      </Button>
    )
  )
}
