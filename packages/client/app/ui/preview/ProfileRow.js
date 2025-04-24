import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { DeleteOutlined } from '@ant-design/icons'
import { notification } from 'antd'
import { useTranslation } from 'react-i18next'
import { grid } from '@coko/client'

import { Button, Select } from '../common'

// #region styled
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(2)};
`

// #endregion styled

const ProfileRow = props => {
  const {
    canModifyProfiles,
    className,
    hasChanges,
    onProfileChange,
    onClickDelete,
    profiles,
    selectedProfile,
    loadingPreview,
    updateProfile,
  } = props

  const { t } = useTranslation(null, {
    keyPrefix: 'pages.previewAndPublish.sections.tabs.publishingProfiles',
  })

  const [updateLoading, setUpdateLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [notificationApi, notificationContextHolder] =
    notification.useNotification()

  const notify = (type, text) => {
    const messageMapper = {
      success: 'Success',
      error: 'Error',
    }

    notificationApi[type]({
      message: messageMapper[type],
      description: text,
    })
  }

  const handleSelectProfile = (_, option) => {
    onProfileChange(option.value)
  }

  const handleUpdate = () => {
    setUpdateLoading(true)

    updateProfile()
      .then(() => {
        notify('success', t('profile.actions.update.status.success'))
      })
      .catch(() => {
        notify('error', t('profile.actions.update.status.error'))
      })
      .finally(() => {
        setUpdateLoading(false)
      })
  }

  const handleClickDelete = () => {
    if (loadingPreview) return // handle here to prevent flashing

    setDeleteLoading(true)

    onClickDelete()
      .then(() => {
        notify('profile.actions.delete.status.success')
      })
      .catch(() => {
        notify('error', t('profile.actions.delete.status.error'))
      })
      .finally(() => {
        setDeleteLoading(false)
      })
  }

  return (
    <Wrapper className={className}>
      {notificationContextHolder}
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor="select-profile">{t('profile.select')}</label>
      <div style={{ display: 'flex', gap: '1ch' }}>
        <Select
          disabled={loadingPreview}
          id="select-profile"
          onChange={handleSelectProfile}
          optionLabelProp="label"
          options={profiles}
          size="large"
          value={selectedProfile.value}
        />
        <Button
          data-test="preview-save-btn"
          disabled={
            !selectedProfile.value ||
            !hasChanges ||
            loadingPreview ||
            !canModifyProfiles
          }
          loading={updateLoading}
          onClick={handleUpdate}
        >
          {t('profile.actions.update')}
        </Button>

        <Button
          data-test="preview-delete-btn"
          disabled={!selectedProfile.value || !canModifyProfiles}
          icon={<DeleteOutlined />}
          loading={deleteLoading}
          onClick={handleClickDelete}
          status="danger"
        >
          {t('profile.actions.delete')}
        </Button>
      </div>
    </Wrapper>
  )
}

ProfileRow.propTypes = {
  profiles: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    }),
  ),
  selectedProfile: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  }),
  onProfileChange: PropTypes.func.isRequired,
  updateProfile: PropTypes.func.isRequired,
  onClickDelete: PropTypes.func.isRequired,
  loadingPreview: PropTypes.bool,
  canModifyProfiles: PropTypes.bool,
  hasChanges: PropTypes.bool,
}

ProfileRow.defaultProps = {
  profiles: [],
  selectedProfile: null,
  loadingPreview: false,
  canModifyProfiles: false,
  hasChanges: false,
}

export default ProfileRow
