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
  font-family: sans-serif;
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`

const DropArea = styled.div`
  border: 2px dashed ${props => (props.$isDragging ? '#0056b3' : '#007bff')};
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  position: relative;
  background-color: ${props => (props.$isDragging ? '#e6f7ff' : '#f9f9f9')};
  transition: background-color 0.3s ease, border-color 0.3s ease;
  margin-bottom: 20px;

  p {
    margin: 0;
    color: #555;
  }
`

const DropOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 123, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  color: #007bff;
  border-radius: 8px;
  animation: ${fadeIn} 0.2s ease-out; /* Apply animation */
`

const SelectButton = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
  margin-top: 10px;

  &:hover {
    background-color: #0056b3;
  }
`

const UploadedFilesPreview = styled.div`
  margin-top: 30px;
  border-top: 1px solid #eee;
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
  background-color: #e9e9e9;
  padding: 10px 15px;
  margin-bottom: 8px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95em;
  color: #555;
`
const Files = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`

const Tile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px;
`

const FileWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100px;

  &:hover .icon-wrapper {
    opacity: 1;
  }
`

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`

const IconWrapper = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
`

const DeleteOutlinedStyled = styled(DeleteOutlined)`
  font-size: 16px;
  color: white;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px;
  border-radius: 50%;
  cursor: pointer;
`

const TileName = styled.div`
  margin-top: 8px;
  font-size: 14px;
  text-align: center;
  word-break: break-word;
`

const DeleteButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  cursor: pointer;
  transition: background-color 0.3s ease;

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
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop])

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
      title="Delete Resource"
      width="420px"
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
          <p>Drag and drop files here or click to select files</p>
          {isDragging && <DropOverlay>Drop your files here</DropOverlay>}
        </DropArea>

        <SelectButton onClick={openFileSelection}>Select Files</SelectButton>

        {files.length > 0 && (
          <UploadedFilesPreview>
            <h3>Selected Files:</h3>
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
        {files.length > 0 && <button onClick={uploadFiles}>Upload</button>}

        <Files>
          {userFileManagerFiles.map((item, index) => (
            <Tile key={index}>
              <FileWrapper>
                <StyledImage
                  src={`${serverUrl}/file/${item.file.id}`}
                  alt={item.file.name}
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
