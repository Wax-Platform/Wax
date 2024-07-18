/* stylelint-disable length-zero-no-unit */
/* stylelint-disable indentation */
/* stylelint-disable string-quotes */
import React, { useContext } from 'react'
import { AiDesignerContext } from '../hooks/AiDesignerContext'
import useAssistant from '../hooks/useAiDesigner'
import styled from 'styled-components'
import PromptsInput from '../PromptsInput'
import {
  FileSyncOutlined,
  PictureOutlined,
  PrinterOutlined,
} from '@ant-design/icons'

const Assistant = styled(PromptsInput)`
  border: none;
  height: 100%;
  margin: 0;
  padding: 0px 5px;
  width: 100%;

  svg {
    fill: var(--color-blue);
    height: 15px;
    width: 15px;
  }
`
const PromptBoxWrapper = styled.div`
  align-items: center;
  background: linear-gradient(#fff, #fff) padding-box,
    linear-gradient(
        90deg,
        var(--color-blue),
        var(--color-orange),
        var(--color-yellow),
        var(--color-green)
      )
      border-box;
  border: 3px solid transparent;
  border-radius: 15px;
  bottom: 15px;
  box-shadow: 0 0 4px #0004, inset 0 0 2px #000a;
  display: flex;

  flex-direction: column;
  gap: 1rem;
  justify-content: space-between;
  overflow: hidden;
  padding: 8px;
  position: absolute;
  right: ${p => {
    if (p.$showChat) return '20px'
    return p.$bothEditors ? '7.05%' : '22.5%'
  }};
  transition: all 0.5s;
  width: ${p => {
    if (p.$showChat) return 'calc(25% - 60px)'
    if (p.$bothEditors) return '32%'
    return '50%'
  }};

  > :first-child {
    align-items: center;
  }

  &[data-collapsed='true'] {
    bottom: -200px;
    opacity: 0;
    pointer-events: none;
  }

  > :last-child {
    align-items: center;
    color: #00495c;
    display: flex;
    gap: 0;

    svg {
      color: var(--color-blue);
      height: 18px;
      transition: all 0.3s;
      width: 18px;

      &:hover {
        transform: translateY(-3px);
      }
    }

    span.anticon {
      padding: 1px 5px;
    }

    span[data-inactive='true'] svg {
      color: #bbb;
    }

    span[data-inactive='false'] svg {
      color: var(--color-green);
    }

    span[data-modelicon='true'] svg {
      height: 8px;
      width: 8px;
    }

    > :last-child {
      cursor: pointer;
      margin-left: 0.3rem;
    }
  }
  z-index: 999;
`
export const PromptBox = () => {
  const { layout, settings, onHistory, useRag, setUseRag, updatePreview } =
    useContext(AiDesignerContext)

  const {
    loading,
    ragSearchLoading,
    dalleLoading,
    handleSend,
    handleImageUpload,
  } = useAssistant()

  return (
    <PromptBoxWrapper
      $bothEditors={layout.preview && layout.editor}
      $showChat={layout.chat}
      data-collapsed={!layout.input}
    >
      <Assistant
        loading={loading || ragSearchLoading || dalleLoading}
        onSend={handleSend}
        placeholder="Type here how your article should look..."
      />
      <span
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        {/* <ModelsDropdown model={model} setModel={setModel} /> */}
        <span>
          <settings.Icons.UndoIcon
            onClick={() => onHistory.apply('undo')}
            title="Undo (Ctrl + z)"
          />
          <settings.Icons.RedoIcon
            onClick={() => onHistory.apply('redo')}
            title="Redo (Ctrl + y)"
          />
          <settings.Icons.RefreshIcon
            onClick={updatePreview}
            title="Update preview"
            type="button"
          />
          <PrinterOutlined
            as="button"
            onClick={() => previewRef?.current?.contentWindow?.print()}
            title="Print"
            type="button"
          />
          <FileSyncOutlined
            data-inactive={!useRag}
            onClick={() => setUseRag(!useRag)}
            style={{ color: 'var(--color-green)' }}
            title={`Use uploaded documents`}
          />
          <input
            accept=".png,.jpg,.webp,.gif,.jpeg"
            id="add-file-to-prompt"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            type="file"
          />
          <label
            contextMenu="form"
            htmlFor="add-file-to-prompt"
            style={{ cursor: 'pointer' }}
            title="Attach image"
          >
            <PictureOutlined style={{ color: 'var(--color-blue)' }} />
          </label>
        </span>
      </span>
    </PromptBoxWrapper>
  )
}
export default PromptBox
