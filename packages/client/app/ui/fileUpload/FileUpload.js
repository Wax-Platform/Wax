/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/no-array-index-key */
/* stylelint-disable indentation */
/* stylelint-disable alpha-value-notation */
/* stylelint-disable color-function-notation */
/* eslint-disable react/prop-types */
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { th, serverUrl } from '@coko/client'

import styled, { keyframes } from 'styled-components'
import { useParams } from 'react-router-dom'

import { DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { Spin } from 'antd'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import SelectedImageInfo from './SelectedImageInfo'

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
  width: 160px;
`

const FileWrapper = styled.div`
  height: 140px;
  position: relative;
  width: 100%;

  &:hover .icon-wrapper {
    opacity: 1;
  }
`

const StyledImage = styled.img`
  border: ${props => (props.isSelected ? '3px solid #007bff' : 'none')};
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  height: 100%;
  object-fit: cover;
  transition: border 0.2s ease-in-out;
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

const SearchOutlinedStyled = styled(SearchOutlined)`
  background: #000;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  font-size: 16px;
  margin-right: 8px;
  padding: 4px;
`

const DeleteConfirmationOverlay = styled.div`
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  bottom: 0;
  color: white;
  display: flex;
  flex-direction: column;
  font-size: 12px;
  justify-content: center;
  left: 0;
  padding: 8px;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10;
`

const ConfirmationText = styled.div`
  font-weight: 500;
  margin-bottom: 8px;
  text-align: center;
`

const ConfirmationButtons = styled.div`
  display: flex;
  gap: 8px;
`

const ConfirmationButton = styled.button`
  background-color: ${props => (props.isConfirm ? '#dc3545' : '#6c757d')};
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => (props.isConfirm ? '#c82333' : '#5a6268')};
  }
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

const LargeImageModal = styled.div`
  align-items: center;
  background-color: rgba(0, 0, 0, 0.9);
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000;
`

const LargeImageContainer = styled.div`
  max-height: 90vh;
  max-width: 90vw;
  position: relative;
`

const LargeImage = styled.img`
  border-radius: 8px;
  height: auto;
  max-height: 90vh;
  max-width: 90vw;
  object-fit: contain;
`

const CloseLargeImage = styled.button`
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  font-size: 24px;
  height: 40px;
  position: absolute;
  right: -50px;
  top: 0;
  width: 40px;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`

const UploadLoaderOverlay = styled.div`
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10;
`

const LoaderText = styled.div`
  color: #333;
  font-size: 14px;
  font-weight: 500;
  margin-top: 12px;
`

const FileUpload = ({
  open,
  userFileManagerFiles,
  uploadToFileManager,
  deleteFromFileManager,
  updateFileInManager,
  setUserFileManagerFiles,
  getUserFileManager,
  onClose,
}) => {
  const { bookComponentId } = useParams()
  const [files, setFiles] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [altText, setAltText] = useState('')
  const [caption, setCaption] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [largeImageId, setLargeImageId] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const dropAreaRef = useRef(null)

  const handleDragEnter = useCallback(e => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(e => {
    e.preventDefault()
    e.stopPropagation()

    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback(e => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
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
    try {
      setIsUploading(true)
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
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    const dropArea = dropAreaRef.current

    if (dropArea) {
      dropArea.addEventListener('dragenter', handleDragEnter)
      dropArea.addEventListener('dragleave', handleDragLeave)
      dropArea.addEventListener('dragover', handleDragOver)
      dropArea.addEventListener('drop', handleDrop)
    }

    // Prevent default drag behavior globally
    const preventDefaultDrag = e => {
      e.preventDefault()
    }

    document.addEventListener('dragover', preventDefaultDrag)
    document.addEventListener('drop', preventDefaultDrag)

    return () => {
      if (dropArea) {
        dropArea.removeEventListener('dragenter', handleDragEnter)
        dropArea.removeEventListener('dragleave', handleDragLeave)
        dropArea.removeEventListener('dragover', handleDragOver)
        dropArea.removeEventListener('drop', handleDrop)
      }

      document.removeEventListener('dragover', preventDefaultDrag)
      document.removeEventListener('drop', preventDefaultDrag)
    }
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop, open])

  const SelectImage = (e, image) => {
    e.preventDefault()
    e.stopPropagation()

    if (selectedImage?.file?.id === image.file.id) {
      setSelectedImage(null)
      setAltText('')
      setCaption('')
    } else {
      setSelectedImage(image)
      setAltText(image.file.alt || '')
      setCaption(image.file.caption || '')
    }
  }

  const handleContainerClick = e => {
    if (e.target === e.currentTarget) {
      setSelectedImage(null)
    }
  }

  const InsertIntoSelection = () => {}

  const handleDeleteClick = (e, item) => {
    e.stopPropagation()
    setDeleteConfirmId(item.file.id)
  }

  const handleConfirmDelete = async item => {
    await onDeleteFile(item)
    setDeleteConfirmId(null)
  }

  const handleCancelDelete = () => {
    setDeleteConfirmId(null)

    if (selectedImage) {
      setSelectedImage(selectedImage)
    }
  }

  const handleShowLargeImage = (e, item) => {
    e.stopPropagation()
    setLargeImageId(item.file.id)
  }

  const handleCloseLargeImage = () => {
    setLargeImageId(null)
  }

  const handleModalClose = () => {
    setSelectedImage(null)
    setAltText('')
    setCaption('')
    setDeleteConfirmId(null)
    setLargeImageId(null)
    onClose()
  }

  return (
    <StyledModal
      closable
      footer={(_, { CancelBtn }) => (
        <>
          <CancelBtn />
          {selectedImage && (
            <Button onClick={InsertIntoSelection} type="primary">
              Insert Into Selection
            </Button>
          )}
        </>
      )}
      maskClosable
      onCancel={handleModalClose}
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

        {selectedImage ? (
          <SelectedImageInfo
            altText={altText}
            caption={caption}
            selectedImage={selectedImage}
            serverUrl={serverUrl}
            setAltText={setAltText}
            setCaption={setCaption}
          />
        ) : (
          <>
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
          </>
        )}

        <Files onClick={handleContainerClick}>
          {userFileManagerFiles.map((item, index) => (
            <Tile key={index}>
              <FileWrapper onClick={e => SelectImage(e, item)}>
                <StyledImage
                  alt={item.file.name}
                  isSelected={selectedImage?.file?.id === item.file.id}
                  src={`${serverUrl}/file/${item.file.id}`}
                />
                <IconWrapper className="icon-wrapper">
                  {deleteConfirmId !== item.file.id && (
                    <>
                      <SearchOutlinedStyled
                        className="search-icon"
                        onClick={e => handleShowLargeImage(e, item)}
                      />
                      <DeleteOutlinedStyled
                        className="delete-icon"
                        onClick={e => handleDeleteClick(e, item)}
                      />
                    </>
                  )}
                </IconWrapper>
                {deleteConfirmId === item.file.id && (
                  <DeleteConfirmationOverlay onClick={e => e.stopPropagation()}>
                    <ConfirmationText>Are you sure?</ConfirmationText>
                    <ConfirmationButtons>
                      <ConfirmationButton
                        isConfirm
                        onClick={() => handleConfirmDelete(item)}
                      >
                        OK
                      </ConfirmationButton>
                      <ConfirmationButton onClick={handleCancelDelete}>
                        Cancel
                      </ConfirmationButton>
                    </ConfirmationButtons>
                  </DeleteConfirmationOverlay>
                )}
              </FileWrapper>
              <TileName>{item.file.name}</TileName>
            </Tile>
          ))}
        </Files>

        {isUploading && (
          <UploadLoaderOverlay>
            <Spin size="large" />
            <LoaderText>Uploading images...</LoaderText>
          </UploadLoaderOverlay>
        )}
      </FileUploadContainer>

      {largeImageId && (
        <LargeImageModal onClick={handleCloseLargeImage}>
          <LargeImageContainer onClick={e => e.stopPropagation()}>
            <LargeImage
              alt="Large preview"
              src={`${serverUrl}/file/${largeImageId}`}
            />
            <CloseLargeImage onClick={handleCloseLargeImage}>×</CloseLargeImage>
          </LargeImageContainer>
        </LargeImageModal>
      )}
    </StyledModal>
  )
}

export default FileUpload
