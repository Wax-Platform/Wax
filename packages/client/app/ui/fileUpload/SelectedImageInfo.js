/* eslint-disable react/prop-types */
/* stylelint-disable color-function-notation */
/* stylelint-disable alpha-value-notation */
import React from 'react'
import styled from 'styled-components'
import Input from '../common/Input'

const SelectedImageContainer = styled.div`
  background-color: #f5f5f5;
  border: 2px dashed #007bff;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 0 20px;
  position: relative;
  text-align: center;
  width: 100%;
`

const InputContainer = styled.div`
  margin-top: 20px;
  text-align: left;
`

const InputLabel = styled.label`
  color: #333;
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
`

const StyledInput = styled(Input)`
  margin-bottom: 16px;
  width: 100%;

  input {
    border: 1px solid #d9d9d9;
    outline: none;

    &:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
      outline: none;
    }
  }
`

const MetadataContainer = styled.div`
  background-color: #f8f9fa;
  border-radius: 6px;
  margin-top: 16px;
  padding: 16px;
  text-align: left;
`

const MetadataTitle = styled.h4`
  color: #333;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px;
`

const MetadataGrid = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
`

const MetadataItem = styled.div`
  font-size: 12px;

  .label {
    color: #666;
    font-weight: 500;
  }

  .value {
    color: #333;
    margin-left: 4px;
  }
`

const SelectedImageInfo = ({
  selectedImage,
  altText,
  setAltText,
  caption,
  setCaption,
  serverUrl,
}) => {
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <SelectedImageContainer>
      <InputContainer>
        <InputLabel htmlFor="alt-text">Alt Text</InputLabel>
        <StyledInput
          id="alt-text"
          onChange={setAltText}
          placeholder="Enter alt text"
          value={altText}
        />
        <InputLabel htmlFor="caption">Caption</InputLabel>
        <StyledInput
          id="caption"
          onChange={setCaption}
          placeholder="Enter image caption"
          value={caption}
        />
      </InputContainer>

      {selectedImage.file.storedObjects && (
        <MetadataContainer>
          <MetadataTitle>Image Information</MetadataTitle>
          <MetadataGrid>
            {(() => {
              const originalObject = selectedImage.file.storedObjects.find(
                obj => obj.type === 'original',
              )

              if (!originalObject) return null

              return (
                <>
                  <MetadataItem>
                    <span className="label">Extension:</span>
                    <span className="value">
                      {originalObject.extension?.toUpperCase()}
                    </span>
                  </MetadataItem>
                  <MetadataItem>
                    <span className="label">Size:</span>
                    <span className="value">
                      {formatFileSize(originalObject.size)}
                    </span>
                  </MetadataItem>
                  <MetadataItem>
                    <span className="label">Dimensions:</span>
                    <span className="value">
                      {originalObject.imageMetadata?.width} ×{' '}
                      {originalObject.imageMetadata?.height}
                    </span>
                  </MetadataItem>
                  <MetadataItem>
                    <span className="label">Density:</span>
                    <span className="value">
                      {originalObject.imageMetadata?.density} DPI
                    </span>
                  </MetadataItem>
                  <MetadataItem>
                    <span className="label">Uploaded:</span>
                    <span className="value">
                      {formatDate(selectedImage.file.updated)}
                    </span>
                  </MetadataItem>
                </>
              )
            })()}
          </MetadataGrid>
        </MetadataContainer>
      )}
    </SelectedImageContainer>
  )
}

export default SelectedImageInfo
