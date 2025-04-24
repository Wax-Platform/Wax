/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef } from 'react'
import styled, { css } from 'styled-components'
import { EditOutlined } from '@ant-design/icons'
import { grid, th } from '@coko/client'
import { useTranslation } from 'react-i18next'
import { Button, Modal, Input } from '../common'

const StyledButton = styled(Button)`
  font-size: 16px;
  height: ${grid(8)};
  opacity: 1;
  padding: 0;
  transition: opacity 0.2s ease-in, visibility 0.2s ease-in;

  &:hover,
  &:active {
    /* stylelint-disable-next-line declaration-no-important */
    background-color: ${th('colorBackground')} !important;
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${props =>
    props.hidden &&
    css`
      opacity: 0;
      visibility: hidden;
    `}

  .anticon {
    /* stylelint-disable-next-line declaration-no-important */
    font-size: 20px !important;
  }
`

const ProfileName = props => {
  const { selectedProfile, canModifyProfiles, onProfileRename } = props

  const { t } = useTranslation(null, {
    keyPrefix: 'pages.previewAndPublish.sections.tabs',
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameInput, setRenameInput] = useState(selectedProfile?.label)
  const inputRef = useRef(null)

  useEffect(() => {
    setRenameInput(selectedProfile.label)
  }, [JSON.stringify(selectedProfile)])

  useEffect(() => {
    if (isModalOpen && inputRef && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus()
      })
    }
  }, [isModalOpen])

  const handleRenameInputChange = value => {
    setRenameInput(value)
  }

  const handleRename = () => {
    const profileValue = selectedProfile.value
    const newName = renameInput
    setIsRenaming(true)

    onProfileRename(profileValue, newName)
      .then(() => {
        setIsModalOpen(false)
      })
      .finally(() => {
        setIsRenaming(false)
      })
  }

  const handleInputKeyDown = e => {
    if (e.key === 'Enter') handleRename()
  }

  const handleClickEdit = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <span>{selectedProfile.label}</span>
      <StyledButton
        disabled={!canModifyProfiles}
        icon={<EditOutlined />}
        onClick={handleClickEdit}
        type="text"
      />
      <Modal
        confirmLoading={isRenaming}
        onCancel={closeModal}
        onOk={handleRename}
        open={isModalOpen}
        title={t('publishingProfiles.profile.rename')}
      >
        <Input
          onChange={handleRenameInputChange}
          onKeyDown={handleInputKeyDown}
          ref={inputRef}
          value={renameInput}
        />
      </Modal>
    </>
  )
}

export default ProfileName
