/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/prop-types */
import React, { useEffect, useContext, useState } from 'react'
import styled from 'styled-components'
import { debounce } from 'lodash'
import { rotate360 } from '@coko/client'
import PropTypes from 'prop-types'
import { CloseOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { autoResize, callOn } from './utils'
import { useAiDesignerContext } from './hooks/AiDesignerContext'

const StyledForm = styled.form`
  --color: #00495c;
  --color-border: #0004;
  --font-size: 14px;
  align-items: center;
  background-color: #fffe;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  display: flex;
  filter: ${p => (p.$enabled ? 'none' : 'grayscale(100%)')};
  font-size: var(--font-size);
  gap: 8px;
  height: fit-content;
  justify-content: center;
  margin: 0;
  min-height: 32px;
  opacity: ${p => (p.$enabled ? '1' : '0.2')};
  overflow: visible;
  position: relative;
  transition: all 1s;
  width: 500px;

  > span > span {
    border: 1px solid var(--color-blue-alpha-2);
    border-radius: 0.3rem;
    display: flex;
    width: fit-content;
  }

  button {
    padding: 0;
  }

  textarea {
    --height: ${p => p.height || `60px`};
    background: none;
    border: none;
    caret-color: var(--color);
    font-size: inherit;
    height: var(--height);
    max-height: 100px;
    outline: none;
    overflow-y: auto;
    resize: none;
    width: 100%;
  }
`

export const StyledSpinner = styled.div`
  display: flex;
  height: fit-content;
  width: 24px;

  &::after {
    animation: ${rotate360} 1s linear infinite;
    border: 2px solid var(--color-trois);
    border-color: var(--color-trois) transparent;
    border-radius: 50%;
    /* stylelint-disable-next-line string-quotes */
    content: ' ';
    display: block;
    height: 18px;
    margin: 1px;
    width: 18px;
  }
`

const PromptsInput = ({ disabled, className, loading, onSend, ...rest }) => {
  const {
    selectedCtx,
    history,
    userPrompt,
    userImages,
    setUserPrompt,
    setUserImages,
    promptRef,
  } = useAiDesignerContext()

  const [showImg, setShowImg] = useState(false)

  useEffect(() => {
    debouncedResize()
  }, [userPrompt])

  const handleChange = ({ target }) => {
    if (loading || disabled) return
    setUserPrompt(target.value)
  }

  const handleKeydown = e => {
    if (disabled) return
    callOn(e.key, {
      Enter: () => !e.shiftKey && onSend(e),
      ArrowDown: () => {
        if (!e.shiftKey) return
        const userHistory = selectedCtx.conversation.filter(
          v => v.role === 'user',
        )
        if (userHistory.length < 1) return
        history.current.prompts.index > 0
          ? (history.current.prompts.index -= 1)
          : (history.current.prompts.index = userHistory.length - 1)

        history.current.prompts.active &&
          setUserPrompt(userHistory[history.current.prompts.index].content)
        history.current.prompts.active = true
      },
      ArrowUp: () => {},
      default: () =>
        history.current.prompts.active &&
        (history.current.prompts.active = false),
    })
  }

  const debouncedResize = debounce(() => {
    autoResize(promptRef.current)
  }, 300)

  return (
    <StyledForm $enabled={!disabled} className={className}>
      <span
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <textarea
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeydown}
          ref={promptRef}
          value={userPrompt}
          {...rest}
        />
        {userImages && (
          <span style={{ gap: '3px' }}>
            <span
              onMouseEnter={() => setShowImg(true)}
              onMouseLeave={() => setShowImg(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                position: 'relative',
              }}
            >
              <img
                alt="userimage"
                src={userImages?.src || userImages.base64Img}
                style={{
                  marginRight: '5px',
                  width: '50px',
                  height: '50px',
                  objectFit: 'contain',
                }}
              />
              <CloseOutlined
                onClick={() => {
                  setUserImages('')
                  setShowImg(false)
                }}
                style={{ width: '8px', color: 'var(--color-blue-alpha-1)' }}
              />
            </span>
            <div
              style={{
                position: 'absolute',
                top: '-265px',
                right: 0,
                padding: '10px',
                background: '#f5f5f5',
                boxShadow: '0 0 10px #0002',
                pointerEvents: 'none',
                userSelect: 'none',
                transition: 'all 0.3s ease-in-out',
                opacity: !showImg ? '0' : '1',
              }}
            >
              <img
                alt="userimage"
                src={userImages?.src || userImages.base64Img}
                style={{
                  width: '230px',
                  objectFit: 'contain',
                  height: '230px',
                }}
              />
            </div>
          </span>
        )}
      </span>
      {loading ? (
        <StyledSpinner />
      ) : (
        onSend && (
          <ArrowRightOutlined
            onClick={e => userPrompt.length > 1 && !disabled && onSend()}
            style={{
              filter: userPrompt.length < 2 ? 'grayscale(100)' : 'none',
              opacity: userPrompt.length < 2 ? '0.5' : 1,
            }}
          />
        )
      )}
    </StyledForm>
  )
}

PromptsInput.propTypes = {
  disabled: PropTypes.bool,
  className: PropTypes.string,
}

PromptsInput.defaultProps = {
  disabled: false,
  className: '',
}

export default PromptsInput
