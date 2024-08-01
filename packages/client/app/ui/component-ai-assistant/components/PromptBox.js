/* stylelint-disable no-descending-specificity */
/* stylelint-disable length-zero-no-unit */
/* stylelint-disable indentation */
/* stylelint-disable string-quotes */
import React, { useContext, useState } from 'react'
import { AiDesignerContext } from '../hooks/AiDesignerContext'
import useAssistant from '../hooks/useAiDesigner'
import styled from 'styled-components'
import PromptsInput from '../PromptsInput'
import {
  DownOutlined,
  FileSyncOutlined,
  PictureOutlined,
  PrinterOutlined,
} from '@ant-design/icons'
import { ModelsList, htmlTagNames } from '../utils'
import Toolbar from './Toolbar'
import { SnippetsDropdown } from '../SelectionBox'

const Dropdown = styled.div`
  background: linear-gradient(90deg, var(--color-purple), var(--color-trois))
      padding-box,
    linear-gradient(90deg, var(--color-purple), var(--color-trois)) border-box;
  border: ${p => (p.$open ? '3px' : '0px')} solid transparent;
  border-radius: 5px;
  bottom: 0;
  height: fit-content;
  max-height: ${p => (p.$open ? '150px' : '0')};
  max-width: ${p => (p.$open ? '180px' : '0')};
  overflow: hidden;
  position: absolute;
  right: calc(100% + ${p => (p.$open ? '20px' : '8px')});
  transition: all 0.5s;
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
      color: #f1f1f1;
      padding: 2px 4px;
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
        color: var(--color-trois);

        &::after {
          background-color: var(--color-trois);
        }
      }

      &:hover {
        background-color: #fffd;
      }
    }

    li:not(:last-child) {
      border-bottom: 1px solid #0001;
    }
  }
`

const ModelsDropdown = () => {
  const { model, setModel } = useContext(AiDesignerContext)
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

const StyledToolbar = styled(Toolbar)`
  --snippet-icon-st: #fff;
  align-items: center;
  background: none;
  border: none;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: row;
  gap: 5px;
  /* height: 100%; */
  outline: none;
  padding: 0;
  /* position: absolute; */
  position: unset;
  transform: none;
  transform-origin: top right;
  transition: transform 0.5s;
  user-select: none;
  width: fit-content;
  z-index: 99999999;

  #snips-dropdown {
    right: ${p => (p.$horizontal ? '0' : '53px')};
    top: ${p => (p.$horizontal ? '53px' : '-1px')};
    transition: all 0.3s;
    z-index: 1;
  }

  > button,
  > :first-child {
    background: #fff;
    border-radius: 50%;
    border-right: 1px solid var(--color-blue-alpha-2);
    height: 20px;
    transform: rotateZ(${p => (p.$horizontal ? '90deg' : '0')});
    transition: all 0.8s;
    width: 20px;
    z-index: 9;
  }

  img:not(:first-child),
  .anticon svg:not(#snips-dropdown .anticon svg),
  > button > img {
    color: var(--color-trois);
    height: 14px;
    object-fit: contain;
    width: 100%;
  }

  > :first-child {
    display: none;
    height: 22px;
    margin: ${p => (!p.$horizontal ? '8px 6px 10px 2px' : '8px 0px 10px 3px')};
    width: 22px;
  }

  > *:not(:first-child) {
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 4px #0004;
    color: #eee;
    cursor: pointer;
    outline: none;
    padding: 2px;
    pointer-events: all;
    transition: all 0.3s;
  }

  button {
    background: none;
    cursor: pointer;
    margin: 0;
    outline: none;
    padding: 0;

    .anticon svg:not(#snips-dropdown .anticon svg),
    > img {
      filter: grayscale();
    }

    > svg {
      height: 20px;
      width: 20px;
    }
  }

  button[data-active='true'] {
    .anticon svg:not(#snips-dropdown .anticon svg),
    > img {
      filter: none;
    }
  }

  button[data-dropdown='true'] {
    background: var(--color-blue-alpha-2);
  }

  svg {
    fill: var(--color-trois);
  }
`

const Assistant = styled(PromptsInput)`
  border: none;
  height: 100%;
  margin: 0;
  padding: 0px 5px;
  width: 100%;

  svg {
    fill: var(--color-trois);
    height: 15px;
    width: 15px;
  }
`
const AbsoluteContainer = styled.div`
  align-items: center;
  bottom: ${p => (p.$show ? '15px' : '-140px')};
  display: flex;
  flex-direction: column;
  position: absolute;
  right: ${p => {
    if (p.$showChat) return '30px'
    return p.$bothEditors ? '8.2%' : '23.4%'
  }};

  transition: all 0.5s 0.2s;
  width: ${p => {
    if (p.$showChat) return 'calc(25% - 60px)'
    if (p.$bothEditors) return '32%'
    return '50%'
  }};
`

const PromptBoxWrapper = styled.div`
  align-items: center;
  background: linear-gradient(#fff, #fff) padding-box,
    linear-gradient(
        90deg,
        var(--color-trois),
        var(--color-pink),
        var(--color-secondary)
      )
      border-box;
  border: 3px solid transparent;
  border-radius: 15px;
  box-shadow: 0 0 4px #0004, inset 0 0 2px #000a;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: space-between;
  /* overflow: hidden; */
  padding: 8px;
  transition: all 0.5s;
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
  z-index: 999;
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
export const PromptBox = () => {
  const {
    layout,
    settings,
    onHistory,
    // useRag,
    // setUseRag,
    previewRef,
    updatePreview,
    selectedCtx,
    designerOn,
  } = useContext(AiDesignerContext)

  const {
    loading,
    ragSearchLoading,
    dalleLoading,
    handleSend,
    handleImageUpload,
  } = useAssistant()

  return (
    <AbsoluteContainer
      $bothEditors={layout.preview && layout.editor}
      $showChat={layout.chat}
      $show={designerOn}
    >
      <RelativeContainer>
        <small className="element-type">
          {htmlTagNames[selectedCtx?.tagName] || 'Document'}
        </small>

        <span>
          <StyledToolbar />
          {!!selectedCtx?.node && <SnippetsDropdown />}
        </span>
      </RelativeContainer>
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
          <span>
            <span style={{ display: 'flex', alignItems: 'center' }}>
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
            </span>
          </span>
        </span>
      </PromptBoxWrapper>
    </AbsoluteContainer>
  )
}
export default PromptBox
