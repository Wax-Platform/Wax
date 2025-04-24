/* stylelint-disable declaration-no-important */
import React from 'react'
import { Upload } from 'antd'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

const { Dragger } = Upload

const StyledDragger = styled(Dragger)`
  height: 100% !important;

  .ant-upload-drag-container,
  .ant-upload-drag {
    background: #f8f8f8;
    border: none !important;
    cursor: unset !important;
    display: flex !important;
    flex-direction: column !important;
    height: 100%;
    margin: 0;
    outline: none !important;
    width: 100% !important;

    &:hover {
      border: none !important;
      outline: none !important;
    }
  }

  .ant-upload-btn {
    display: flex !important;
    height: 100% !important;
    padding: 0 !important;
  }

  &:hover {
    .ant-upload-drag-container,
    .ant-upload-drag .ant-upload-btn {
      border: none !important;
      outline: none !important;
    }
  }
`

const UploadHiddenDropZone = props => {
  const { t } = useTranslation()
  return (
    <StyledDragger
      {...props}
      action=""
      aria-label={t('pages.knowledgeBase.files.uploadZone')}
      openFileDialogOnClick={false}
      showUploadList={false}
    />
  )
}

UploadHiddenDropZone.propTypes = {
  onFileSelect: PropTypes.func,
}

UploadHiddenDropZone.defaultProps = {
  onFileSelect: () => {},
}

export default UploadHiddenDropZone
