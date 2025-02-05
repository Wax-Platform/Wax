/* stylelint-disable no-descending-specificity */
/* stylelint-disable length-zero-no-unit */
/* stylelint-disable indentation */
/* stylelint-disable string-quotes */
import React, { useState } from 'react'
import { useAiDesignerContext } from '../hooks/AiDesignerContext'
import useAssistant from '../hooks/useAiDesigner'
import styled from 'styled-components'
import PromptsInput from '../PromptsInput'
import { DownOutlined, PictureOutlined } from '@ant-design/icons'
import { ModelsList, htmlTagNames } from '../utils'
import Toolbar from './Toolbar'

const Dropdown = styled.div`
  background: var(--color-trois-lightest-2);
  border: ${p => (p.$open ? '1px' : '0px')} solid var(--color-trois-alpha);
  border-radius: 5px;
  bottom: 0;
  height: fit-content;
  left: calc(100% + ${p => (p.$open ? '20px' : '8px')});
  max-height: ${p => (p.$open ? '150px' : '0')};
  max-width: ${p => (p.$open ? '180px' : '0')};
  overflow: hidden;
  position: absolute;
  transition: all 0.3s;
  width: 180px;
  z-index: 999;

  ul {
    display: flex;
    flex-direction: column;
    list-style: none;
    margin: 0;
    padding: 0;

    small {
      background-color: transparent;
      color: var(--color-trois-opaque-2);
      padding: 2px 8px;
      width: 100%;
    }

    li {
      align-items: center;
      background-color: #fff;
      display: flex;
      height: 25px;
      margin: 0;
      padding: 0 10px;

      button {
        align-items: center;
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        display: flex;
        font-size: 11px;
        justify-content: space-between;
        margin: 0;
        outline: none;
        padding: 0;
        text-align: left;
        width: 100%;

        &::after {
          background-color: #bbb;
          border-radius: 50%;
          content: ' ';
          display: flex;
          height: 5px;
          width: 5px;
        }
      }

      button[data-selected='true'] {
        color: var(--color-trois-opaque);

        &::after {
          background-color: var(--color-trois);
        }
      }

      &:hover {
        background-color: #fffd;
      }
    }

    li:not(:last-child) {
      border-bottom: 1px solid var(--color-trois-alpha);
    }
  }
`

const ModelsDropdown = () => {
  const { model, setModel } = useAiDesignerContext()
  const [openDropdown, setOpenDropdown] = useState(false)
  const handleOpen = () => setOpenDropdown(!openDropdown)

  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '12px',
        borderBottom: '1px solid var(--color-blue-alpha)',
        padding: '3px 3px 3px 8px',
        gap: '0.5rem',
        position: 'relative',
        minWidth: '100px',
        justifyContent: 'space-between',
      }}
    >
      <button
        onClick={handleOpen}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          margin: '0',
          outline: 'none',
          padding: '0',
          border: 'none',
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          color: 'var(--color-trois)',
        }}
        type="button"
      >
        <small>{model[2]}</small>
        <DownOutlined data-modelicon label={model[2]} title="Select model" />
      </button>
      <Dropdown $open={openDropdown}>
        {Object.entries(ModelsList).map(([api, list]) => (
          <ul key={api}>
            <small>{api}</small>
            {list.map(({ model: mod, label }) => {
              const handleSetModel = () => {
                setModel([api, mod, label])
                setOpenDropdown(false)
              }

              return (
                <li key={label}>
                  <button
                    data-selected={model[2] === label}
                    onClick={handleSetModel}
                    type="button"
                  >
                    {label}
                  </button>
                </li>
              )
            })}
          </ul>
        ))}
      </Dropdown>
    </span>
  )
}

const Assistant = styled(PromptsInput)`
  background: none;
  border: none;
  height: 100%;
  margin: 0;
  padding: 0px 5px;
  width: 100%;

  svg {
    fill: var(--color-trois-opaque);
    height: 15px;
    width: 15px;
  }
`
const AbsoluteContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding-bottom: 16px;
  transition: all 0.3s 0.2s;
  width: 98%;
`

const PromptBoxWrapper = styled.div`
  align-items: center;
  background: var(--color-trois-lightest-2);
  border-top: 1px solid var(--color-trois-alpha);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: space-between;
  /* overflow: hidden; */
  padding: 16px 8px;
  transition: all 0.3s;
  width: 100%;

  > :first-child {
    align-items: center;
  }

  > :last-child {
    align-items: center;
    color: #00495c;
    display: flex;
    gap: 0;

    svg {
      color: var(--color-trois);
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
      color: var(--color-secondary);
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
  z-index: 9999;
`

const RelativeContainer = styled.div`
  align-items: center;
  display: flex;
  font-size: 14px;
  gap: 5px;
  height: 35px;
  justify-content: space-between;
  margin-top: -35px;
  position: relative;
  white-space: nowrap;
  width: 100%;
  z-index: 9999999999999999;

  button#element-snippets {
    background: var(--color-trois);
    border: none;
    border-radius: 50%;
    box-shadow: 0 0 4px #0002;
    color: #eee;
    cursor: pointer;
    outline: none;
    padding: 5px;
    pointer-events: all;
  }

  > span,
  > span > span {
    display: flex;
    gap: 4px;
  }

  > small.element-type {
    background-color: #fffe;
    border-radius: 5px;
    box-shadow: 0 0 4px #0002;
    color: var(--color-trois);
    line-height: 1;
    padding: 5px 8px;
  }
`
export const PromptBox = props => {
  const {
    layout,
    settings,
    onHistory,
    // useRag,
    // setUseRag,
    designerOn,
  } = useAiDesignerContext()

  const {
    loading,
    ragSearchLoading,
    dalleLoading,
    handleSend,
    // handleImageUpload,
  } = useAssistant()

  return (
    <AbsoluteContainer
      $bothEditors={layout.preview && layout.editor}
      $showChat={layout.chat}
      $show={designerOn}
      {...props}
    >
      <PromptBoxWrapper>
        <Assistant
          loading={loading || ragSearchLoading || dalleLoading}
          onSend={handleSend}
          placeholder="Type here how your document should look..."
        />
        <span
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <ModelsDropdown />
          {/* <span style={{ display: 'flex', alignItems: 'center' }}>
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
              <PictureOutlined style={{ color: 'var(--color-trois)' }} />
            </label>
          </span> */}
        </span>
      </PromptBoxWrapper>
    </AbsoluteContainer>
  )
}
export default PromptBox
