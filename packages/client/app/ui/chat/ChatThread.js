import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { grid } from '@coko/client'
import ChatInput from './ChatInput'
import ChatMessageList from './ChatMessageList'
import { VisuallyHiddenElement } from '../common'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: ${grid(2)};
  background: white;
`

const StyledChatMessageList = styled(ChatMessageList)`
  flex-grow: 1;
  overflow-y: auto;
`

const StyledChatInput = styled(ChatInput)`
  margin-top: ${grid(1)};
`

const ChatThread = props => {
  const {
    participants,
    announcementText,
    hasMore,
    isActive,
    messages,
    onFetchMore,
    onSendMessage,
    infiniteScroll,
    inputPlaceholder,
    ...rest
  } = props

  const wrapperRef = useRef()
  const [focusableElements, setFocusableElements] = useState([])

  const moveTo = direction => {
    const currentIndex = focusableElements.indexOf(document.activeElement)

    if (direction === 'UP' && currentIndex > 0) {
      focusableElements[currentIndex - 1].focus()
    } else if (
      direction === 'DOWN' &&
      currentIndex < focusableElements.length - 1
    ) {
      focusableElements[currentIndex + 1].focus()
    }
  }

  const handleKeyDown = e => {
    const { key } = e

    switch (key) {
      case 'ArrowUp':
        e.preventDefault()
        moveTo('UP')
        break
      case 'ArrowDown':
        e.preventDefault()
        moveTo('DOWN')
        break
      default:
        break
    }
  }

  useEffect(() => {
    const messageNodeList = wrapperRef.current.querySelectorAll('.message')
    const messageArray = Array.from(messageNodeList)
    setFocusableElements(messageArray)
  }, [messages])

  useEffect(() => {
    setTimeout(() => {
      isActive && wrapperRef.current.querySelector('.ant-input')?.focus()
    }, 200)
  }, [isActive])

  return (
    <Wrapper onKeyDown={handleKeyDown} ref={wrapperRef}>
      <StyledChatMessageList
        hasMore={hasMore}
        infiniteScroll={infiniteScroll}
        messages={messages}
        onFetchMore={onFetchMore}
        participants={participants}
        {...rest}
      />
      <StyledChatInput
        aria-label="Write a message"
        onSend={onSendMessage}
        participants={participants}
        placeholder={inputPlaceholder || 'Write a message'}
        type="text"
      />
      {announcementText && (
        <VisuallyHiddenElement aria-live="assertive" role="alert">
          {announcementText}
        </VisuallyHiddenElement>
      )}
    </Wrapper>
  )
}

ChatThread.propTypes = {
  isActive: PropTypes.bool,
  announcementText: PropTypes.string,
  messages: PropTypes.arrayOf(PropTypes.shape()),
  onFetchMore: PropTypes.func,
  onSendMessage: PropTypes.func,
  hasMore: PropTypes.bool,
  infiniteScroll: PropTypes.bool,
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      display: PropTypes.string,
      role: PropTypes.string,
    }),
  ),
  inputPlaceholder: PropTypes.string,
}

ChatThread.defaultProps = {
  isActive: false,
  announcementText: '',
  messages: [],
  onFetchMore: () => {},
  hasMore: false,
  onSendMessage: () => {},
  participants: [],
  infiniteScroll: false,
  inputPlaceholder: null,
}

export default ChatThread
