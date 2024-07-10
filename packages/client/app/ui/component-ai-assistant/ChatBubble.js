/* eslint-disable react/prop-types */

import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { CloseOutlined } from '@ant-design/icons'
import { AiDesignerContext } from './hooks/AiDesignerContext'
import logoSmall from '../../../static/AI Design Studio-Icon.svg'

const Wrapper = styled.span`
  display: flex;
  overflow: visible;
  position: relative;
`

const MessageContent = styled.span`
  background-color: white;
  border-radius: 15px;
  box-shadow: ${p =>
    p.$onBottom ? 'inset -5px 8px 15px #0001' : 'inset 5px -8px 15px #0001'};
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 50vw;
  min-width: 300px;
  padding: 18px;
  position: relative;
  width: max-content;

  > * {
    opacity: var(--content-opacity);
    transition: opacity 0.3s;
  }
`

const MessageWrapper = styled.span`
  --content-opacity: ${p => (p.$hide ? 0 : 1)};
  align-items: ${p => (p.$onRight ? 'flex-end' : 'flex-start')};
  display: flex;
  filter: drop-shadow(0 0 2px #0005);
  flex-direction: column;
  font-size: 14px;
  left: 0;
  line-height: 1.1;
  position: ${p => p.position};
  top: 40px;
  transform: scale(${p => (p.$hide ? 0 : 1)});
  transform-origin: ${p => p.$transformOrigin};
  transition: transform 0.3s;
  white-space: pre-line;
  z-index: 99999;
`

const Triangle = styled.span`
  --x: ${p => (!p.$onRight ? '10px' : 'calc(100% - 10px)')};
  --y: ${p => (!p.$onBottom ? '1px' : 'calc(100% - 1px)')};

  border-bottom: ${p => (!p.$onBottom ? '16px solid #fff' : '')};
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: ${p => (p.$onBottom ? '16px solid #fff' : '')};
  height: 0;
  margin: 0;
  transform: skew(${p => p.skew}) translate(var(--x), var(--y));
  width: 0;
  z-index: 5;
`

const SmallText = styled.strong`
  color: #00495c;
  text-decoration: underline;
`

const PaddedContent = styled.span`
  display: flex;
  flex-direction: column;
  padding: 8px;
`

const UnStyledButton = styled.button`
  background: none;
  border: none;
  color: #000422;
  cursor: pointer;
  font-size: 12px;
  outline: none;
  padding: 0;
  text-align: left;
  text-decoration: underline;

  &:hover {
    color: #050;
  }
`

export const ChatBox = ({
  children,
  content,
  header,
  hide,
  $onBottom,
  $onRight,
  $transformOrigin = '30px 0',
  position = 'absolute',
  skew = '20deg',
  ...rest
}) => {
  return (
    <MessageWrapper
      $hide={hide}
      $onRight={$onRight}
      $transformOrigin={$transformOrigin}
      position={position}
      {...rest}
    >
      {!$onBottom && (
        <Triangle $onBottom={$onBottom} $onRight={$onRight} skew={skew} />
      )}
      <MessageContent $onBottom={$onBottom}>
        {children || (
          <>
            <span
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
              }}
            >
              {header}
            </span>
            <PaddedContent>{content}</PaddedContent>
          </>
        )}
      </MessageContent>
      {$onBottom && (
        <Triangle $onBottom={$onBottom} $onRight={$onRight} skew={skew} />
      )}
    </MessageWrapper>
  )
}

const OptionsTemplate = ({ content }) => {
  const { setUserPrompt, promptRef } = useContext(AiDesignerContext)
  return (
    <li>
      <UnStyledButton
        onClick={e => {
          setUserPrompt(e.target.textContent)
          promptRef.current.focus()
        }}
      >
        {String(content)}
      </UnStyledButton>
    </li>
  )
}

const ChatBubble = ({ forceHide, onClick }) => {
  const { feedback, settings } = useContext(AiDesignerContext)
  const [hideMessage, setHideMessage] = useState(false)

  useEffect(() => {
    setHideMessage(false)
  }, [feedback])

  return (
    <Wrapper>
      <UnStyledButton
        onClick={() => onClick() || setHideMessage(!hideMessage)}
        style={{
          fontSize: '18px',
          textDecoration: 'none',
          width: '25px',
          height: '25px',
          objectFit: 'cover',
          color: '#fff0',
        }}
      >
        <img
          alt="AiDesignStudioLogo"
          src={logoSmall}
          style={{ width: 'inherit', height: 'inherit', marginTop: '-4px' }}
        />
      </UnStyledButton>
      <ChatBox
        hide={
          !settings.chat.showChatBubble ||
          forceHide ||
          (!forceHide && hideMessage)
        }
      >
        <span
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <SmallText>Coko AI Design Studio:</SmallText>
          <UnStyledButton
            onClick={() => setHideMessage(!hideMessage)}
            style={{ objectFit: 'contain', width: '18px', height: '18px' }}
          >
            <CloseOutlined />
          </UnStyledButton>
        </span>
        <PaddedContent>
          {feedback || (
            <>
              <span>Hello there!</span>
              <span>{`I'm here to help with your article's design`}</span>
              <span>You can also ask for the current property values</span>
              <span>for example: What is the page size of the article?</span>
              <span style={{ marginBottom: '8px' }}>
                Here are some suggestions to get started:
              </span>
              <ul>
                <OptionsTemplate content="Change the page size 5 x 8 inches" />
                <OptionsTemplate content="Change the title font to sans serif" />
                <OptionsTemplate content="Make all the headings blue" />
              </ul>
            </>
          )}
        </PaddedContent>
      </ChatBox>
    </Wrapper>
  )
}

export default ChatBubble
