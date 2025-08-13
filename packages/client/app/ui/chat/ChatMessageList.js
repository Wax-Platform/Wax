import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import InfiniteScroll from 'react-infinite-scroll-component'
import { grid } from '@coko/client'
import YjsContext from '../provider-yjs/YjsProvider'
import ChatMessage from './ChatMessage'
import { Button, Empty, Spin, VisuallyHiddenElement } from '../common'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column-reverse;
  height: 100%;
  overflow: auto;
  overflow-anchor: none;
  overscroll-behavior: contain;

  * + * {
    margin-top: ${grid(1)};
  }
`

const MessagesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-inline: 4px;
`

const StyledInfiniteScroll = styled(InfiniteScroll)`
  display: flex;
  flex-direction: column;
`

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-block: ${grid(6)} ${grid(3)};

  // put the loader on top even now that order of messages is not reversed
  order: -1;
`

const TopMessageWrapper = styled.p`
  order: ${props => (props.infiniteScroll ? '-1' : '0')};
  text-align: center;
`

const ChatMessageList = props => {
  const {
    className,
    hasMore,
    messages,
    onFetchMore,
    infiniteScroll,
    participants,
  } = props
  
  const { sharedUsers } = useContext(YjsContext)

  const participantUsernames = participants.map(
    participant => participant.display,
  )

  // Helper function to get user color from sharedUsers
  const getUserColor = (username) => {
    const sharedUser = sharedUsers.find(sharedUser => 
      sharedUser.user?.displayName === username
    )
    return sharedUser?.user?.color || null
  }

  console.log(sharedUsers)

  const messageList = () =>
    infiniteScroll ? (
      <StyledInfiniteScroll
        dataLength={messages.length}
        endMessage={
          <TopMessageWrapper infiniteScroll>
            Start of the conversation
          </TopMessageWrapper>
        }
        hasMore={hasMore}
        inverse
        loader={
          <SpinnerWrapper id="chat-loading">
            <VisuallyHiddenElement aria-live="assertive" role="status">
              loading previous messages
            </VisuallyHiddenElement>
            <Spin />
          </SpinnerWrapper>
        }
        next={onFetchMore}
        scrollableTarget="scrollableDiv"
        scrollThreshold="50px"
      >
        {messages.map(({ content, date, own, user, attachments, id }) => {
          const userColor = getUserColor(user)
          return (
            <ChatMessage
              attachments={attachments}
              className="message"
              content={content}
              date={date}
              key={id}
              own={own}
              participants={participantUsernames}
              user={user}
              userColor={userColor}
            />
          )
        })}
      </StyledInfiniteScroll>
    ) : (
      <>
        <MessagesWrapper>
          {messages.map(({ content, date, own, user, id, attachments }) => {
            const userColor = getUserColor(user)
            return (
              <ChatMessage
                attachments={attachments}
                className="message"
                content={content}
                date={date}
                key={id}
                own={own}
                participants={participantUsernames}
                user={user}
                userColor={userColor}
              />
            )
          })}
        </MessagesWrapper>
        <TopMessageWrapper>
          {hasMore ? (
            <Button onClick={onFetchMore}>Load older</Button>
          ) : (
            'Start of the conversation'
          )}
        </TopMessageWrapper>
      </>
    )

  return (
    <Wrapper className={className} id="scrollableDiv">
      {messages.length === 0 ? (
        <Empty
          description="No conversations yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          role="status"
        />
      ) : (
        messageList()
      )}
    </Wrapper>
  )
}

ChatMessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      content: PropTypes.string,
      date: PropTypes.string,
      own: PropTypes.bool,
      user: PropTypes.string,
    }),
  ),
  participants: PropTypes.arrayOf(PropTypes.shape()),
  hasMore: PropTypes.bool,
  infiniteScroll: PropTypes.bool,
  onFetchMore: PropTypes.func,
}

ChatMessageList.defaultProps = {
  messages: [],
  hasMore: false,
  infiniteScroll: false,
  onFetchMore: () => {},
  participants: [],
}

export default ChatMessageList
