/* stylelint-disable string-quotes */
/* stylelint-disable declaration-no-important */
/* stylelint-disable no-descending-specificity */
import React, { useContext, useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { fadeIn, useCurrentUser } from '@coko/client'
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import ReactMarkdown from 'react-markdown'
import Prism from 'prismjs'
import prismcss from '../../../static/prism.css'
import {
  AiDesignerContext,
  useAiDesignerContext,
} from './hooks/AiDesignerContext'
import { copyTextContent, htmlTagNames } from './utils'
import logoSmall from '../../../static/AI Design Studio-Icon.svg'
import userSmall from '../../../static/user-icon.svg'
import PromptBox from './components/PromptBox'
import { TemplateManager } from './components/CodeEditor'
import Each from './utils/Each'

const chatFadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-100%);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
`

const Root = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 1em;
  height: 100%;
  justify-content: space-between;
  overflow: hidden;
  padding: 0 0 12px;
  position: relative;
  transition: all;
  width: 100%;
`

const ChatHistoryContainer = styled.div`
  --profile-picture-size: 25px;
  --message-header-gap: 8px;

  background-color: #fff0;
  display: flex;
  flex-direction: column;
  min-width: 25dvh;
  overflow: auto;
  padding: 0 25px 25px;
  position: relative;
  scroll-behavior: smooth;
  scrollbar-color: #0002;
  transition: width 0.5s;
  user-select: none;
  white-space: pre-line;
  width: 100%;

  ::-webkit-scrollbar {
    height: 5px;
    width: 5px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 5px;
    width: 5px;
  }

  ::-webkit-scrollbar-track {
    background: #fff0;
    padding: 5px;
  }

  > * {
    animation: ${fadeIn} 1s;
    margin: 0 0 1em;
    padding: 2px 0;
  }
`

const MessageContainer = styled.div`
  animation: ${chatFadeIn} 0.5s;
  border-top: ${({ hasBorder }) => (hasBorder ? '1px solid #0002' : 'none')};
  color: #555;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  opacity: ${p => (p.forgotten ? 0.5 : 1)};
  padding: 10px;
  padding-top: ${({ hasBorder }) => (hasBorder ? '18px' : '0')};

  * {
    padding: 0;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 5px 0;
  }

  a {
    color: var(--color-trois);
  }

  ul,
  ol {
    font-size: 0;
    list-style: none;

    > * {
      font-size: 14px;
      padding: 0 0 0 5px;
    }

    li {
      margin: 2px 0;
    }
  }

  pre [class*='language-'] {
    border-width: 0;
    box-shadow: none;
    margin: 5px 0;
  }

  [class*='language-'] {
    background: #222;
    border-radius: 0.5rem;
    text-shadow: none;

    span.token {
      &.operator {
        background: none;
      }
    }
  }

  strong {
    color: var(--color-purple);
  }
`

const MessageHeader = styled.div`
  align-items: center;
  display: flex;
  gap: var(--message-header-gap);
  justify-content: space-between;
  padding: 8px 0;
  width: 100%;

  svg {
    animation: ${fadeIn} 0.5s;
  }

  > span {
    display: flex;
    gap: var(--message-header-gap);

    > strong {
      color: #0009;
      padding-left: 4px;
    }
  }

  span > img,
  span > span {
    align-items: center;
    border-radius: 50%;
    display: flex;
    height: var(--profile-picture-size);
    justify-content: center;
    object-fit: contain;
    width: var(--profile-picture-size);
  }

  span {
    line-height: 1;

    img {
      margin-top: -5px;
    }
  }

  span > span {
    font-size: 12px;
  }
`

const MessageContent = styled.div`
  border-left: 1px solid #0002;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0 15px;

  p {
    margin: 0;
  }
`

const UserImage = styled.img`
  background: ${({ bgColor }) => bgColor};
`

const AIImage = styled.img`
  border-radius: 0 !important;
  margin-top: -10px;
`

const MessageActions = styled.span`
  align-items: center;
  color: #888;
  display: flex;
  gap: 0;
`

const CopyContainer = styled.span`
  justify-content: flex-end;
  width: fit-content;
`

const NoMessages = styled.span`
  background: #fff;
  border-radius: 5px;
  color: #777;
  padding: 10px;
  text-align: center;
`

const ChatHistory = ({ nomessages, ...props }) => {
  const { selectedCtx, feedback, deleteLastMessage, settings, layout } =
    useAiDesignerContext()
  const { currentUser } = useCurrentUser()
  const [clipboardText, setClipboardText] = useState('')

  const getClipboardText = async () => {
    const cbTxt = await navigator.clipboard.readText()
    return cbTxt
  }

  const threadRef = useRef(null)

  const debouncedScroll = debounce(() => {
    if (!threadRef.current) return
    Prism.highlightAll()
    threadRef.current.scrollTop =
      threadRef.current.scrollHeight -
      [...threadRef.current.children].pop()?.getBoundingClientRect().height -
      50
  }, 200)

  useEffect(() => {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(
        mutation =>
          mutation.type === 'childList' &&
          threadRef?.current &&
          debouncedScroll(),
      )
    })

    const chatContainer = threadRef.current

    if (chatContainer) {
      observer.observe(chatContainer, { childList: true })
    }

    return () => observer.disconnect()
  }, [feedback, selectedCtx.conversation])

  return (
    <Root>
      <ChatHistoryContainer ref={threadRef} {...props}>
        {layout.chat && (
          <Each
            if={selectedCtx?.conversation?.length > 0}
            of={selectedCtx?.conversation}
            as={({ role, content }, i) => {
              const forgotten =
                i <
                selectedCtx.conversation.length - settings.chat.historyMax - 1

              const messageid = `${role}-${i}`

              const copyText = async () => {
                if (!document?.getElementById(messageid)) return
                copyTextContent(document?.getElementById(messageid))
                const newCbTxt = await getClipboardText()
                setClipboardText(newCbTxt)
              }

              return (
                <>
                  <link href={prismcss} rel="stylesheet" />
                  <MessageContainer forgotten={forgotten} hasBorder={i !== 0}>
                    <MessageHeader>
                      {role === 'user' ? (
                        <span>
                          <UserImage
                            alt="user-profile"
                            src={currentUser?.profilePicture ?? userSmall}
                            bgColor={currentUser?.color ?? 'var(--color-trois)'}
                          />
                          <strong>@{currentUser?.displayName}</strong>
                        </span>
                      ) : (
                        <span>
                          <AIImage alt="" src={logoSmall} />
                          <strong>AI Design Studio</strong>
                        </span>
                      )}
                      <MessageActions>
                        <CopyContainer>
                          {document.getElementById(messageid)?.textContent ===
                            clipboardText && <small>copied!!</small>}
                          <CopyOutlined
                            onClick={copyText}
                            title="Copy message"
                          />
                        </CopyContainer>
                        {i === selectedCtx.conversation.length - 1 && (
                          <DeleteOutlined
                            onClick={deleteLastMessage}
                            title="Remove from history (not undoable)"
                          />
                        )}
                        {forgotten && <small>- forgotten -</small>}
                      </MessageActions>
                    </MessageHeader>

                    <MessageContent id={messageid}>
                      <ReactMarkdown>{content}</ReactMarkdown>
                    </MessageContent>
                  </MessageContainer>
                </>
              )
            }}
            fallback={
              <NoMessages>
                {nomessages ||
                  `Make your first prompt related to ${
                    selectedCtx?.tagName
                      ? `this ${htmlTagNames[selectedCtx?.tagName]}`
                      : 'the Document'
                  }`}
              </NoMessages>
            }
          />
        )}
        {layout.templateManager && <TemplateManager />}
      </ChatHistoryContainer>
      <PromptBox />
    </Root>
  )
}

export default ChatHistory
