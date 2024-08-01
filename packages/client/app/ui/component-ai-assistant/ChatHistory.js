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
import { AiDesignerContext } from './hooks/AiDesignerContext'
import { copyTextContent, htmlTagNames } from './utils'
import logoSmall from '../../../static/AI Design Studio-Icon.svg'
import userSmall from '../../../static/user-icon.svg'

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

const ChatHistoryContainer = styled.div`
  --profile-picture-size: 25px;
  --message-header-gap: 8px;

  background: #fff5ff;
  border-left: 1px solid #0004;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: calc(25dvw);
  overflow: auto;
  padding: 25px;
  padding-bottom: 25%;
  position: relative;
  scroll-behavior: smooth;
  scrollbar-color: #0002;
  transition: width 0.5s;
  user-select: none;
  white-space: pre-line;

  ::-webkit-scrollbar {
    height: 5px;
    width: 5px;
  }

  ::-webkit-scrollbar-thumb {
    background: #0002 !important;
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
  color: #555;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  opacity: ${p => (p.forgotten ? 0.5 : 1)};
  padding: 10px;

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
  width: 100%;

  svg {
    animation: ${fadeIn} 0.5s;
  }

  > span {
    display: flex;
    gap: var(--message-header-gap);

    > strong {
      color: #555;
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
  margin: 3px
    calc(var(--message-header-gap) + var(--profile-picture-size) - 2px);
  padding: var(--message-header-gap) 15px;

  p {
    margin: 0;
  }
`

// TODO: pass currentUser as prop
// eslint-disable-next-line react/prop-types
const ChatHistory = ({ nomessages, ...props }) => {
  const { selectedCtx, feedback, deleteLastMessage, settings } =
    useContext(AiDesignerContext)
  const { currentUser } = useCurrentUser()
  const [clipboardText, setClipboardText] = useState('')

  const getClipboardText = async () => {
    const cbTxt = await navigator.clipboard.readText()
    return cbTxt
  }

  const threadRef = useRef(null)

  const debouncedScroll = debounce(() => {
    Prism.highlightAll()
    threadRef.current.scrollTop =
      threadRef.current.scrollHeight -
      [...threadRef.current.children].pop().getBoundingClientRect().height -
      50
  }, 200)

  useEffect(() => {
    console.log(currentUser)
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
    <ChatHistoryContainer ref={threadRef} {...props}>
      <link href={prismcss} rel="stylesheet" />
      {selectedCtx?.conversation?.length > 0 ? (
        selectedCtx.conversation.map(({ role, content }, i) => {
          const forgotten =
            i < selectedCtx.conversation.length - settings.chat.historyMax - 1

          const messageid = `${role}-${i}`

          const copyText = async () => {
            if (!document?.getElementById(messageid)) return
            copyTextContent(document?.getElementById(messageid))
            const newCbTxt = await getClipboardText()
            setClipboardText(newCbTxt)
          }

          return (
            // eslint-disable-next-line react/no-array-index-key
            <span key={role + content + i}>
              <MessageContainer
                forgotten={forgotten}
                style={
                  i !== 0
                    ? { borderTop: '1px solid #0002', paddingTop: '18px' }
                    : {}
                }
              >
                <MessageHeader>
                  {role === 'user' ? (
                    <span>
                      <img
                        alt="user-profile"
                        src={currentUser?.profilePicture ?? userSmall}
                        style={{
                          background:
                            currentUser?.color ?? 'var(--color-trois)',
                        }}
                      />
                      <strong>@{currentUser?.displayName}</strong>
                    </span>
                  ) : (
                    <span>
                      <img
                        alt=""
                        src={logoSmall}
                        style={{ borderRadius: 0, marginTop: '-10px' }}
                      />
                      <strong>AI Design Studio</strong>
                    </span>
                  )}
                  <span style={{ gap: 0, color: '#888', alignItems: 'center' }}>
                    <span
                      style={{
                        width: 'fit-content',
                        justifyContent: 'flex-end',
                      }}
                    >
                      {document.getElementById(messageid)?.textContent ===
                        clipboardText && <small>copied!!</small>}
                      <CopyOutlined onClick={copyText} title="Copy message" />
                    </span>
                    {i === selectedCtx.conversation.length - 1 && (
                      <DeleteOutlined
                        onClick={deleteLastMessage}
                        title="Remove from history (not undoable)"
                      />
                    )}
                    {forgotten && <small>- forgotten -</small>}
                  </span>
                </MessageHeader>

                <MessageContent id={messageid}>
                  <ReactMarkdown>{content}</ReactMarkdown>
                </MessageContent>
              </MessageContainer>
            </span>
          )
        })
      ) : (
        <span
          style={{
            color: '#777',
            background: '#fff',
            padding: '10px',
            borderRadius: '5px',
            textAlign: 'center',
          }}
        >
          {nomessages ||
            `Make your first prompt related to ${
              selectedCtx?.tagName
                ? `this ${htmlTagNames[selectedCtx?.tagName]}`
                : 'the Document'
            }`}
        </span>
      )}
    </ChatHistoryContainer>
  )
}

export default ChatHistory
