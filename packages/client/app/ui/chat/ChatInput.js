/* eslint-disable no-param-reassign */
/* stylelint-disable string-quotes */
import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { MentionsInput, Mention } from 'react-mentions'
import { grid, th, useCurrentUser } from '@coko/client'

import { SendOutlined, PaperClipOutlined } from '@ant-design/icons'

import { Button, Upload } from '../common'
import { inputShadow } from '../common/_reusableStyles'

const MainContainer = styled('div')`
  display: flex;
  flex-direction: row;
  position: relative;
`

const InputContainer = styled('div')`
  flex-grow: 1;
  position: relative;
  margin: ${grid(1)};
  height: 34px;
`

const StyledMentionsInput = styled(MentionsInput)`
  flex-grow: 1;
  height: 100%;
  position: relative;

  textarea {
    border: 1px solid ${th('colorBorder')};
    height: 100%;
    min-height: 32px;
    max-height: 70px;
    ${inputShadow};
    overflow: auto;
    padding: ${grid(1)} ${grid(10)} ${grid(1)} ${grid(2)};
    padding-right: ${grid(8)}; /* Add space for the paperclip icon */
    resize: none;
  }

  [role='listbox'] {
    border: 1px solid ${th('colorBorder')};
    box-shadow: ${th('boxShadow')};
  }

  [role='option'] {
    color: ${th('colorText')};
    padding: ${grid(1)} ${grid(3)};
  }

  [role='option']:hover,
  [role='option'][aria-selected='true'] {
    background: ${th('colorPrimary')};
    color: ${th('colorTextReverse')};
  }
`

const StyledUpload = styled(Upload)`
  color: ${th('colorPrimary')};
  display: flex;
  flex-direction: row-reverse;
  position: absolute;
  right: 70px;
  top: 10px;
  transition: outline-offset 0s, outline 0s;

  [role='button'] {
    display: inline-flex;
    height: 16px;

    &:focus {
      outline: 4px solid #71ada9;
      outline-offset: 2px;
    }
  }

  .ant-upload-list {
    background-color: ${th('colorBackground')};
    border: none;
    bottom: calc(100% + 20px);
    box-shadow: ${th('boxShadow')};
    inset-inline-end: ${grid(-3)};
    max-inline-size: 250px;
    position: absolute;

    &:has(.ant-upload-list-item) {
      border: 1px solid ${th('colorBorder')};
    }
  }

  &&& .ant-upload-list-item {
    margin-block: ${grid(1)};
    padding: ${grid(2)};
  }
`

const SendButton = styled(Button)`
  border: none;
  height: 32px;
  margin: ${grid(1)};
  ${props =>
    props.$inactive &&
    `color:rgba(63, 63, 63, 0.25); 
     cursor: default;
     background: rgba(63, 63, 63, 0.04);
     &:hover, &:active, &:focus {
      color:rgba(63, 63, 63, 0.25)!important; 
      background: rgba(63, 63, 63, 0.04)!important;
     }
   `}
`

const PaperclipButton = styled(Button)`
  border: none;
  color: ${th('colorPrimary')};
  height: 32px;
  position: absolute;
  right: ${grid(1)};
  top: 1px;
  z-index: 10;

  &:hover {
    background: rgba(113 173 169 / 10%);
    color: ${th('colorPrimary')};
  }
`

// TODO -- this needs to be a wax editor with two plugins (mention & task)

const ChatInput = props => {
  const { className, onSend, participants, ...rest } = props
  const { currentUser } = useCurrentUser()
  const [inputValue, setInputValue] = useState('')
  const [mentions, setMentions] = useState([])
  const [attachments, setAttachments] = useState([])

  const inputRef = useRef(null)
  const uploadRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleTextChange = (_, newValue, __, mentioned) => {
    setInputValue(newValue)
    const mentionIDs = mentioned.map(({ id }) => id)
    setMentions(mentionIDs)
  }

  const handleKeyDown = e => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      inputRef.current.selectionStart === inputRef.current.value.length
    ) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAttachmentChange = ({ fileList }) => {
    setAttachments(fileList)
  }

  const handleRemoveAttachment = file => {
    setAttachments(selectedFiles =>
      selectedFiles.filter(item => item.uid !== file.uid),
    )
  }

  const handlePaperclipClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileInputChange = event => {
    const files = Array.from(event.target.files)

    const fileList = files.map((file, index) => ({
      uid: `file-${Date.now()}-${index}`,
      name: file.name,
      status: 'done',
      originFileObj: file,
    }))

    setAttachments(fileList)
    // Reset the input so the same file can be selected again
    event.target.value = ''
  }

  const handleSend = async () => {
    if (inputValue.trim().length !== 0 || attachments.length > 0) {
      const content =
        inputRef.current.value.trim().length === 0
          ? ' '
          : inputRef.current.value.replace(/\r?\n/g, '<br />')

      onSend(content, mentions, attachments)
      setInputValue('')
      setAttachments([])
      setMentions([])
      inputRef.current.focus()
    }
  }

  return (
    <MainContainer>
      <InputContainer>
        <StyledMentionsInput
          className="mentions-input"
          forceSuggestionsAboveCursor
          inputRef={inputRef}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          value={inputValue}
          {...rest}
        >
          <Mention
            appendSpaceOnAdd
            data={[
              ...new Set(participants.filter(p => p.id !== currentUser.id)),
            ]}
            displayTransform={(_, display) => `@${display}`}
            renderSuggestion={entry => {
              return <span>{entry.display}</span>
            }}
            trigger="@"
          />
        </StyledMentionsInput>
        <PaperclipButton
          aria-label="attach-files"
          onClick={handlePaperclipClick}
          type="text"
        >
          <PaperClipOutlined />
        </PaperclipButton>
      </InputContainer>
      <input
        accept="image/*,.pdf,.docx,.odt"
        multiple
        onChange={handleFileInputChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
        type="file"
      />
      <StyledUpload
        accept="image/*,.pdf,.docx,.odt"
        aria-label="upload-attachments"
        files={attachments}
        multiple
        onChange={handleAttachmentChange}
        onRemove={handleRemoveAttachment}
        ref={uploadRef}
        style={{ display: 'none' }}
      />
      <SendButton
        $inactive={inputValue.length === 0 && attachments.length === 0}
        data-testid="send-btn"
        onClick={handleSend}
        type="primary"
      >
        <SendOutlined />
      </SendButton>
    </MainContainer>
  )
}

ChatInput.propTypes = {
  onSend: PropTypes.func.isRequired,
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      display: PropTypes.string,
      role: PropTypes.string,
    }),
  ),
}

ChatInput.defaultProps = {
  participants: [],
}

export default ChatInput
