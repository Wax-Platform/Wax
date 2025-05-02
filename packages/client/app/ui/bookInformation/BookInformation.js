/* stylelint-disable declaration-no-important, string-quotes */
/* eslint-disable react/prop-types */
import React from 'react'
import styled from 'styled-components'
import { th, grid } from '@coko/client'
import { Link } from 'react-router-dom'
import { PrinterOutlined, UsergroupAddOutlined } from '@ant-design/icons'
import { Tooltip as AntTooltip } from 'antd'
import { Button } from '../common'
import RobotSvg from './RobotSvg'

const Wrapper = styled.div`
  display: flex !important;
  flex-shrink: 0;
  gap: 1ch;
  position: absolute;
  right: 1%;

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

const BookInformation = props => {
  const {
    viewInformation,
    toggleInformation,
    showAiAssistantLink,
    showKnowledgeBaseLink,
    bookId,
    bookComponentId,
  } = props

  return (
    <Wrapper>
      <Tooltip placement="bottom" title="Share">
        <StyledButton
          aria-label="Toggle book collaborators"
          aria-pressed={viewInformation === 'members'}
          icon={<UsergroupAddOutlined />}
          onClick={() => toggleInformation('members')}
        />
      </Tooltip>
      <Tooltip placement="bottom" title="Preview and Publish">
        <StyledLink
          aria-label="Preview and Publish"
          to={`/document/${bookComponentId}/exporter`}
        >
          <PrinterOutlined />
        </StyledLink>
      </Tooltip>
      {showKnowledgeBaseLink && (
        <Tooltip placement="bottom" title="Knowledge Base">
          <StyledLink
            aria-label="Knowledge Base"
            to={`/document/${bookComponentId}/knowledge-base`}
          >
            KB
          </StyledLink>
        </Tooltip>
      )}
      {showAiAssistantLink && (
        <Tooltip placement="bottomRight" title="AI Designer (Beta)">
          <StyledLink
            aria-label="AI Designer (Beta)"
            to={`/document/${bookComponentId}/ai-pdf`}
          >
            <RobotSvg />
          </StyledLink>
        </Tooltip>
      )}
    </Wrapper>
  )
}

export default BookInformation
