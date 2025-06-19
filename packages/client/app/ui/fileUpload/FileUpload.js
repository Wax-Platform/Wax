import React, { useState, useRef, useCallback, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'

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

const FileUpload = () => {
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
    </FileUploadContainer>
  )
}

export default FileUpload
