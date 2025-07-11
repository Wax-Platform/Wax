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
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  min-height: 300px;
  padding: 10px;
  position: relative;
  width: 100%;
`

const ImagePreviewSection = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
`

const ImagePreview = styled.img`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 280px;
  max-width: 100%;
  object-fit: contain;
`

const FormSection = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`

const InputContainer = styled.div`
  margin-top: 12px;
  text-align: left;
`

const InputLabel = styled.label`
  color: #333;
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
`

const StyledInput = styled(Input)`
  margin-bottom: 10px;
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
  margin-top: 10px;
  padding: 10px;
  text-align: left;
`

const MetadataTitle = styled.h4`
  color: #333;
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 8px;
`

const MetadataGrid = styled.div`
  display: grid;
  gap: 6px;
  grid-template-columns: 1fr 1fr;
`

const MetadataItem = styled.div`
  font-size: 11px;

  .label {
    color: #666;
    font-weight: 700;
  }

  .value {
    color: #333;
    margin-left: 4px;
  }
`

const UsedInDocumentsContainer = styled.div`
  background-color: #e3f2fd;
  border-radius: 6px;
  margin-top: 10px;
  padding: 10px;
  text-align: left;
`

const DocumentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
`

const DocumentItem = styled.div`
  background-color: #fff;
  border-radius: 4px;
  font-size: 11px;
  padding: 4px 8px;
  color: #333;
  font-weight: 500;
`

const InsertButton = styled.button`
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  transition: background-color 0.2s ease;
  width: 100%;

  &:hover {
    background-color: #0056b3;
  }
`

const SelectedImageInfo = ({
  selectedImage,
  altText,
  setAltText,
  caption,
  setCaption,
  imageName,
  setImageName,
  serverUrl,
  onInsert,
  updateFile,
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

  const updateImageValues = async () => {
    await updateFile({
      variables: {
        input: {
          id: selectedImage.file.id,
          name: imageName,
          alt: altText,
          caption,
        },
      },
    })
  }

  return (
    <SelectedImageContainer>
      <ImagePreviewSection>
        <ImagePreview
          alt={selectedImage.file.name}
          src={`${serverUrl}/file/${selectedImage.file.id}`}
        />
      </ImagePreviewSection>

      <FormSection>
        <InputContainer>
          <InputLabel htmlFor="image-name">Name</InputLabel>
          <StyledInput
            id="image-name"
            onChange={setImageName}
            placeholder="Enter image name"
            value={imageName}
          />
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
          <InsertButton
            onClick={updateImageValues}
            style={{ marginTop: '15px' }}
          >
            Update
          </InsertButton>
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
                      <span className="label">Name:</span>
                      <span className="value">{selectedImage.file.name}</span>
                    </MetadataItem>
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
                      <span className="label">Color space:</span>
                      <span className="value">
                        {originalObject.imageMetadata?.space}
                      </span>
                    </MetadataItem>
                    <MetadataItem>
                      <span className="label">Uploaded:</span>
                      <span className="value">
                        {formatDate(selectedImage.file.updated)}
                      </span>
                    </MetadataItem>
                    <MetadataItem
                      style={{
                        gridColumn: '1 / -1',
                        justifySelf: 'center',
                        marginTop: '10px',
                      }}
                    >
                      <InsertButton onClick={onInsert}>
                        Insert Into Text
                      </InsertButton>
                    </MetadataItem>
                  </>
                )
              })()}
            </MetadataGrid>
          </MetadataContainer>
        )}

        {selectedImage.metadata?.bookComponentId &&
          selectedImage.metadata.bookComponentId.length > 0 && (
            <UsedInDocumentsContainer>
              <MetadataTitle>Used in Documents</MetadataTitle>
              <DocumentList>
                {selectedImage.metadata.bookComponentId.map(
                  (component, index) => (
                    <DocumentItem key={index}>
                      {component?.title || `Document ${index + 1}`}
                    </DocumentItem>
                  ),
                )}
              </DocumentList>
            </UsedInDocumentsContainer>
          )}
      </FormSection>
    </SelectedImageContainer>
  )
}

export default SelectedImageInfo
