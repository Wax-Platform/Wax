import React, { useState, useEffect } from 'react'
import { Button, Row, Space, Typography, Upload as AntUpload } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { Trans } from 'react-i18next'

const { Text } = Typography
const { Dragger } = AntUpload

const StyledDragger = styled(Dragger)`
  .ant-upload-drag {
    margin: 0;
    min-height: 300px;
    padding: 0;
    position: relative;
  }

  .ant-upload-drag-container {
    display: block;
    margin: 0;
    max-height: 100%;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
  }

  .ant-upload-btn {
    display: flex;
    justify-content: center;
    min-height: 300px;
  }
`

const FileInfoText = styled(Text)`
  text-align: left;
  width: 85%;
`

const StyledSpace = styled(Space)`
  display: flex;
`

// const FilesList = styled.div`
//   max-height: 200px;
//   overflow-y: auto;
//   padding: 0 15px 0 35px;
// `

const Upload = props => {
  const { multiple, onFilesChange } = props

  const [files, setFiles] = useState([])
  // const { t } = useTranslation()

  useEffect(() => {
    onFilesChange(files)
  }, [files])

  const onFileSelect = ({ file }) => {
    if (multiple) {
      setFiles(prevFiles => [...prevFiles, file])
    } else {
      setFiles([file])
    }
  }

  const onClickRemove = (evt, file) => {
    evt.stopPropagation()
    removeFile(file)
  }

  const removeFile = fileToRemove => {
    setFiles(files.filter(file => file.uid !== fileToRemove.uid))
  }

  return (
    <StyledDragger
      {...props}
      action=""
      customRequest={onFileSelect}
      showUploadList={false}
    >
      <StyledSpace direction="vertical" size="middle">
        <Text>
          <Trans i18nKey="pages.newBook.importPage.dropArea">
            Drag and drop files, or <Text underline>browse</Text>
          </Trans>
        </Text>
        {files.length > 0 &&
          files.map(file => (
            <Row
              align="middle"
              justify="space-between"
              key={file.uid}
              span={24}
            >
              <FileInfoText ellipsis={{ tooltip: file.name }} strong>
                {file.name}
              </FileInfoText>
              <Button
                icon={<CloseOutlined />}
                onClick={evt => onClickRemove(evt, file)}
                type="link"
              />
            </Row>
          ))}
      </StyledSpace>
    </StyledDragger>
  )
}

Upload.propTypes = {
  multiple: PropTypes.bool,
  onFilesChange: PropTypes.func,
}

Upload.defaultProps = {
  multiple: false,
  onFilesChange: () => {},
}

export default Upload
