/* eslint-disable react/no-array-index-key */
/* stylelint-disable indentation */
/* stylelint-disable alpha-value-notation */
/* stylelint-disable color-function-notation */
/* eslint-disable react/prop-types */
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { th, serverUrl } from '@coko/client'

import styled, { keyframes } from 'styled-components'
import { useParams } from 'react-router-dom'

import { DeleteOutlined } from '@ant-design/icons' // Font Awesome icon
import Modal from '../common/Modal'

const StyledModal = styled(Modal)`
  font-family: ${th('fontBrand')};

  p {
    font-size: ${th('fontSizeBaseSmall')};
  }

  .ant-modal-content {
    border-radius: 10px;
  }

  .ant-modal-header {
    border-radius: 10px 10px 0 0;
  }
`

const fadeIn = keyframes`

from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`

const FileUploadContainer = styled.div`
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-family: sans-serif;
  margin: 50px auto;
  max-width: 1000px;
  padding: 20px;
  text-align: center;
`

const DropArea = styled.div`
  background-color: ${props => (props.$isDragging ? '#e6f7ff' : '#f9f9f9')};
  border: 2px dashed ${props => (props.$isDragging ? '#0056b3' : '#007bff')};
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 40px 20px;
  position: relative;
  text-align: center;
  transition: background-color 0.3s ease, border-color 0.3s ease;

  p {
    color: #555;
    margin: 0;
  }
`

const DropOverlay = styled.div`
  align-items: center;
  animation: ${fadeIn} 0.2s ease-out; /* Apply animation */
  background-color: rgba(0, 123, 255, 0.1);
  border-radius: 8px;
  bottom: 0;
  color: #007bff;
  display: flex;
  font-size: 1.2em;
  justify-content: center;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
`

const UploadButton = styled.button`
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  font-size: 1em;
  margin-top: 10px;
  padding: 10px 20px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`

const UploadedFilesPreview = styled.div`
  border-top: 1px solid #eee;
  margin-top: 30px;
  padding-top: 20px;

  h3 {
    color: #333;
    margin-bottom: 15px;
  }

  ul {
    list-style: none;
    padding: 0;
  }
`

const FileListItem = styled.li`
  align-items: center;
  background-color: #e9e9e9;
  border-radius: 4px;
  color: #555;
  display: flex;
  font-size: 0.95em;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 10px 15px;
`

const Files = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
  padding-top: 20px;
`

const Tile = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 120px;
`

const FileWrapper = styled.div`
  height: 100px;
  position: relative;
  width: 100%;

  &:hover .icon-wrapper {
    opacity: 1;
  }
`

const StyledImage = styled.img`
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  height: 100%;
  object-fit: cover;
  width: 100%;
`

const IconWrapper = styled.div`
  opacity: 0;
  position: absolute;
  right: 6px;
  top: 6px;
  transition: opacity 0.2s ease-in-out;
`

const DeleteOutlinedStyled = styled(DeleteOutlined)`
  background: #000;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
`

const TileName = styled.div`
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
  word-break: break-word;
`

const DeleteButton = styled.button`
  align-items: center;
  background-color: #dc3545;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  font-size: 0.8em;
  height: 25px;
  justify-content: center;
  transition: background-color 0.3s ease;
  width: 25px;

  &:hover {
    background-color: #c82333;
  }
`

const FileUpload = ({
  open,
  userFileManagerFiles,
  uploadToFileManager,
  deleteFromFileManager,
  updateFileInManager,
  setUserFileManagerFiles,
  getUserFileManager,
}) => {
  const { bookComponentId } = useParams()
  const [files, setFiles] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const dropAreaRef = useRef(null) // Ref for the drop area element

  const handleDragEnter = useCallback(e => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(e => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback(e => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDrop = useCallback(
    e => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const droppedFiles = Array.from(e.dataTransfer.files)
      handleNewFiles(droppedFiles)
    },
    [files],
  )

  const onDeleteFile = useCallback(
    async item => {
      await deleteFromFileManager({ variables: { ids: [item.file.id] } })
      const userFiles = await getUserFileManager({ variables: {} })

      setUserFileManagerFiles([
        ...JSON.parse(userFiles.data.getUserFileManager),
      ])
    },
    [files],
  )

  const handleFileInputChange = useCallback(
    e => {
      const selectedFiles = Array.from(e.target.files)
      handleNewFiles(selectedFiles)
    },
    [files],
  )

  const handleNewFiles = useCallback(
    newFiles => {
      const validFiles = newFiles.filter(file => {
        //  add validation logic here (e.g., file type, size)
        const isAlreadyAdded = files.some(
          existingFile =>
            existingFile.name === file.name && existingFile.size === file.size,
        )

        return !isAlreadyAdded
      })

      setFiles(prevFiles => [...prevFiles, ...validFiles])
    },
    [files],
  )

  const handleDeleteFile = useCallback(fileToDelete => {
    setFiles(prevFiles => prevFiles.filter(file => file !== fileToDelete))
  }, [])

  const openFileSelection = () => {
    fileInputRef.current.click()
  }

  const uploadFiles = async () => {
    const filesInserted = await uploadToFileManager({
      variables: {
        files,
        fileType: 'fileManagerImage',
        entityId: bookComponentId,
      },
    })

    await Promise.all(
      filesInserted.data.uploadToFileManager.map(file =>
        updateFileInManager({
          variables: {
            fileId: file.id,
            input: {
              bookComponentId: [bookComponentId],
            },
          },
        }),
      ),
    )

    const userFiles = await getUserFileManager({ variables: {} })

    setUserFileManagerFiles([...JSON.parse(userFiles.data.getUserFileManager)])
    setFiles([])
  }

  useEffect(() => {
    const dropArea = dropAreaRef.current

    if (dropArea) {
      console.log('Attaching event listeners to dropArea:', dropArea)
      dropArea.addEventListener('dragenter', handleDragEnter)
      dropArea.addEventListener('dragleave', handleDragLeave)
      dropArea.addEventListener('dragover', handleDragOver)
      dropArea.addEventListener('drop', handleDrop)
    }

    return () => {
      if (dropArea) {
        dropArea.removeEventListener('dragenter', handleDragEnter)
        dropArea.removeEventListener('dragleave', handleDragLeave)
        dropArea.removeEventListener('dragover', handleDragOver)
        dropArea.removeEventListener('drop', handleDrop)
      }
    }
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop, open])

  const SelectImage = (e, fileId) => {
    e.preventDefault()
    console.log('fileId', fileId)
  }

  return (
    <StyledModal
      // bodyStyle={{ fontSize: th('fontSizeBaseSmall') }}
      closable
      // footer={null}
      maskClosable
      // onCancel={handleCancel}
      // onOk={() => {
      //   deleteResourceFn({ variables: { id: deleteResourceRow.id } })
      //   setDeleteResourceRow(null)
      // }}
      open={open}
      title="Image Manager"
      width="1020px"
    >
      <FileUploadContainer>
        <input
          multiple
          onChange={handleFileInputChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
          type="file"
        />

        <DropArea
          $isDragging={isDragging}
          onClick={openFileSelection}
          ref={dropAreaRef}
        >
          <p>Drag and drop images here or click to select images</p>
          {isDragging && <DropOverlay>Drop your images here</DropOverlay>}
        </DropArea>

        {files.length > 0 && (
          <UploadedFilesPreview>
            <h3>Selected Images:</h3>
            <ul>
              {files.map((file, index) => (
                <FileListItem key={index}>
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  <DeleteButton onClick={() => handleDeleteFile(file)}>
                    X
                  </DeleteButton>
                </FileListItem>
              ))}
            </ul>
          </UploadedFilesPreview>
        )}
        {files.length > 0 && (
          <UploadButton onClick={uploadFiles}>Upload</UploadButton>
        )}

        <Files>
          {userFileManagerFiles.map((item, index) => (
            <Tile key={index}>
              <FileWrapper onClick={e => SelectImage(e, item.file.id)}>
                <StyledImage
                  alt={item.file.name}
                  src={`${serverUrl}/file/${item.file.id}`}
                />
                <IconWrapper className="icon-wrapper">
                  <DeleteOutlinedStyled
                    className="delete-icon"
                    onClick={() => onDeleteFile(item)}
                  />
                </IconWrapper>
              </FileWrapper>
              <TileName>{item.file.name}</TileName>
            </Tile>
          ))}
        </Files>
      </FileUploadContainer>
    </StyledModal>
  )
}

export default FileUpload
