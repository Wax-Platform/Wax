/* stylelint-disable declaration-no-important, string-quotes */
/* eslint-disable react/prop-types */
import React from 'react'
import styled from 'styled-components'
import { th, grid } from '@coko/client'
import { Link, useParams } from 'react-router-dom'
import { SettingOutlined } from '@ant-design/icons'
import { Tooltip as AntTooltip } from 'antd'
import { Button } from '../common'

const Wrapper = styled.div`
  display: flex !important;
  flex-shrink: 0;
  gap: 1ch;
  left: 27vh;
  position: absolute;
  top: 6px;
  z-index: 999;

  > button[aria-pressed='true'] {
    background-color: rgb(63 133 198);
    color: white;

    &:hover {
      border-color: rgb(63 133 198);
      color: white;
    }
  }

  #book-menu {
    margin-block-start: 0; // ${grid(3)};
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s, margin-block-start 0.4s;

    button,
    a {
      padding-inline: 24px;
      text-align: start;
      width: 100%;
    }

    button {
      border-radius: 0;
      text-align: left;

      &[aria-pressed='true'] {
        background-color: rgb(63 133 198 / 33%);
        border-inline-start: 2px solid rgb(63 133 198);
      }
    }
  }

  &:has(#book-menu-toggle[aria-expanded='true']) > #book-menu {
    margin-block-start: ${grid(3)};
    max-height: 1000px;
  }
`

const Tooltip = props => <AntTooltip trigger={['hover', 'focus']} {...props} />

const StyledButton = styled(Button)`
  block-size: 34px;
  inline-size: 34px;

  svg {
    font-size: 18px;
  }
`

const StyledLink = styled(Link)`
  block-size: 34px;
  border: 1px solid ${th('colorBorder')};
  color: inherit;
  display: grid;
  font-size: 18px;
  inline-size: 34px;
  place-content: center;

  &:hover {
    color: inherit;
  }
`

const BookSettings = props => {
  const {
    viewInformation,
    toggleInformation,
    showAiAssistantLink,
    showKnowledgeBaseLink,
  } = props


  return (
    <Wrapper>
      <Tooltip placement="bottom" title="Settings">
        <StyledButton
          aria-label="Toggle book settings"
          aria-pressed={viewInformation === 'settings'}
          icon={<SettingOutlined />}
          onClick={() => toggleInformation('settings')}
        />
      </Tooltip>
    </Wrapper>
  )
}

export default BookSettings
