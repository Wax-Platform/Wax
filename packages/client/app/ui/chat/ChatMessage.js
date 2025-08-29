import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import DOMPurify from 'dompurify'
import { PaperClipOutlined } from '@ant-design/icons'

import { grid, th } from '@coko/client'

import { DateParser, VisuallyHiddenElement } from '../common'

const pullRight = css`
  margin-left: auto;
`

const Message = styled.div`
  align-self: baseline;
  background: ${props => {
    if (props.own) {
      return th('colorBackgroundHue')
    }
    return props.userColor || th('colorPrimary')
  }};
  border-radius: ${props =>
    props.own ? '15px 0 15px 15px' : '0 15px 15px 15px'};
  box-shadow: rgb(50 50 93 / 25%) 0 2px 4px -2px,
    rgb(0 0 0 / 30%) 0 1px 2px -3px;
  color: ${props => {
    if (props.own) {
      return th('colorTextDark')
    }
    return props.userColor ? '#E0E0E0' : th('colorTextReverse')
  }};
  display: inline-block;
  margin-block: 10px;
  max-inline-size: 50%;
  min-inline-size: 30%;
  ${props =>
    props.own &&
    css`
      ${pullRight}

      span {
        ${pullRight}
      }
    `};
  padding: ${grid(2)};

  &:focus {
    outline: ${props => `${props.theme.lineWidth * 4}px`} solid
      ${th('colorPrimaryBorder')};
    outline-offset: 1px;
  }

  & .mention {
    cursor: pointer;
    font-weight: 900;
  }

  > * + * {
    margin-block-start: ${grid(3)};
  }
`

const Name = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  font-weight: bold;
`

const Content = styled.div``

const Date = styled.div`
  display: flex;
  font-size: ${th('fontSizeBaseSmall')};
  font-style: italic;
  justify-content: flex-end;
`

const Attachments = styled.div`
  background-color: rgb(0 0 0 / 10%);
  border-radius: 8px;
  box-shadow: inset rgb(0 0 0 / 18%) 0 1px 2px;
  display: grid;
  grid-gap: 5px;
  grid-template-columns: repeat(2, 0.2fr);
  margin-block: ${grid(2)};
  padding: ${grid(3)};
`

const AttachmentItem = styled.a`
  border: 1px solid white;
  border-radius: 5px;
  color: inherit;
  cursor: pointer;
  display: inline-block;
  overflow: hidden;
  padding: ${grid(1)};
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 130px;

  &:focus {
    outline: 2px solid ${th('colorPrimaryBorder')};
    outline-offset: 1px;
  }
`

const ChatMessage = forwardRef((props, ref) => {
  const {
    attachments,
    className,
    content,
    date,
    own,
    user,
    participants,
    userColor,
    ...rest
  } = props

  const parts = content.split(/(@\w+)/g)
  let output = ''
  parts.forEach(part => {
    // checking if the mentioned user is a part of participants in the cat
    if (part.startsWith('@') && participants.includes(part.slice(1))) {
      output += `<span class="mention" data-testid="user-mention">${part}</span>`
      return
    }

    output += part
  })
  const sanitizedHTML = DOMPurify.sanitize(output)

  return (
    <Message
      className={className}
      data-testid={own ? 'author-message' : 'participant-message'}
      own={own}
      ref={ref}
      tabIndex={0}
      userColor={userColor}
      {...rest}
    >
      {!own && <Name>{user}</Name>}
      <VisuallyHiddenElement as="p">
        {own ? 'you said' : 'said'}
      </VisuallyHiddenElement>

      <Content>
        <div
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
        />
      </Content>
      {attachments.length > 0 && (
        <Attachments>
          {attachments.map(attachment => (
            <AttachmentItem
              data-testid="message-attachment"
              href={attachment.url}
              key={attachment.name}
              target="_blank"
            >
              <PaperClipOutlined />
              {attachment.name}
            </AttachmentItem>
          ))}
        </Attachments>
      )}
      <Date data-testid="time-indicator">
        <DateParser timestamp={date}>
          {(_, timeAgo) => <span>{timeAgo} ago</span>}
        </DateParser>
      </Date>
    </Message>
  )
})

ChatMessage.propTypes = {
  attachments: PropTypes.arrayOf(PropTypes.shape()),
  content: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  own: PropTypes.bool,
  user: PropTypes.string,
  participants: PropTypes.arrayOf(PropTypes.string),
  userColor: PropTypes.string,
}

ChatMessage.defaultProps = {
  attachments: [],
  own: false,
  user: null,
  participants: [],
  userColor: null,
}

export default ChatMessage
