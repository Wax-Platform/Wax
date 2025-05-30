/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-param-reassign */

/* stylelint-disable no-descending-specificity, declaration-no-important */

import React, { useState, useContext, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import {
  FolderAddOutlined,
  FileAddOutlined,
  DeleteOutlined,
  EditOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'

import DocumentContext from '../documentProvider/DocumentProvider'

import Button from '../common/Button'

const RowContainer = styled.div`
  color: ${props => (props.isActive ? 'black' : 'inherit')};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-weight: ${props => (props.isActive ? '600' : 'normal')};
  margin-bottom: 5px;
  margin-top: 10px;
  padding: 5px;
`

const TitleToolsContainer = styled.div`
  display: flex;
  flex-direction: row;
`

const ToolsContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: auto;
`

const StyledFolderFileBtn = styled(Button)`
  background-color: transparent;
  border: none;
  margin-left: 10px;
  outline: 0 !important;
  padding: 0;
  text-decoration: none;
  width: fit-content;

  &:active,
  &:focus,
  &:hover {
    background: transparent !important;
  }

  svg {
    fill: #4c4949;

    &:active,
    &:focus,
    &:hover {
      fill: #000;
    }
  }
`

const StyledInput = styled.input`
  background-color: #f4f2f2;
  border: 2px solid #4c4949;
  margin-right: 5px;

  :focus {
    outline: none;
  }
`

const StyledApplyButton = styled(Button)`
  background-color: #4c4949;
  color: #fff;

  &:hover {
    background-color: #4c4949 !important;
    color: #fff !important;
  }
`

const IconTitleContainer = styled.div`
  display: flex;
  flex-direction: row;

  span {
    margin-bottom: 10px;
    margin-right: 5px;

    svg {
      fill: #4c4949;
    }
  }
`

const RowRender = row => {
  const {
    id,
    title,
    renameResource,
    addResource,
    isFolder,
    identifier,
    confirmDelete,
    isActive,
    bookId,
    bodyDivisionId,
    bookComponentId,
    setSelectedChapterId,
    setIsCurrentDocumentMine,
    myFiles,
  } = row

  const { title: providerTitle, setTitle } = useContext(DocumentContext)
  const history = useHistory()
  const [updatedName, setUpdateName] = useState(title)
  const [isRename, setRename] = useState(false)

  useEffect(() => {
    setUpdateName(providerTitle)
  }, [providerTitle])

  const setActive = () => {
    Array.from(document.getElementsByClassName('rowContainer')).forEach(
      element => {
        const elementId = element.getAttribute('id')

        if (elementId === identifier) {
          element.style.color = 'black'
          element.style.fontWeight = '600'
        } else {
          element.style.color = 'inherit'
          element.style.fontWeight = 'normal'
        }
      },
    )
  }

  /* eslint-disable-next-line consistent-return */
  const goToDocument = e => {
    if (e.target.type === 'text') {
      e.preventDefault()
      return false
    }

    if (!isFolder) {
      setSelectedChapterId(bookComponentId)
      setIsCurrentDocumentMine(myFiles)
      setTitle(title)

      history.push(`/document/${bookComponentId}`, { replace: true })
      setActive()
    }
  }

  return (
    <RowContainer
      className="rowContainer"
      id={identifier}
      isActive={isActive}
      onClick={e => goToDocument(e)}
    >
      <TitleToolsContainer>
        {isRename ? (
          <>
            <StyledInput
              autoFocus
              onChange={e => setUpdateName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.keyCode === 13) {
                  renameResource({
                    variables: { id, title: updatedName, lockRename: true },
                  })
                  setTitle(updatedName)
                  setRename(false)
                }
              }}
              type="text"
              value={updatedName}
            />
            <StyledApplyButton
              onClick={() => {
                renameResource({
                  variables: { id, title: updatedName, lockRename: true },
                })
                setTitle(updatedName)
                setRename(false)
              }}
              onMouseDown={e => {
                e.preventDefault()
                renameResource({
                  variables: { id, title: updatedName, lockRename: true },
                })
                setTitle(updatedName)
                setRename(false)
              }}
            >
              Apply
            </StyledApplyButton>
          </>
        ) : (
          <IconTitleContainer>
            {isFolder && <FolderAddOutlined style={{ fontSize: '19px' }} />}
            <span>
              {!row.isRoot && title.length > 18
                ? `${title.substring(0, 18)}...`
                : title}
            </span>
          </IconTitleContainer>
        )}
        {!row.isRoot && (
          <ToolsContainer>
            {isFolder && addResource && (
              <>
                <StyledFolderFileBtn
                  onClick={() =>
                    addResource({ variables: { id, isFolder: true } })
                  }
                  title="Add Folder"
                >
                  <FolderAddOutlined style={{ fontSize: '19px' }} />
                </StyledFolderFileBtn>
                <StyledFolderFileBtn
                  onClick={() =>
                    addResource({
                      variables: {
                        id,
                        bookId,
                        divisionId: bodyDivisionId,
                        isFolder: false,
                      },
                    })
                  }
                  title="Add File"
                >
                  <FileAddOutlined style={{ fontSize: '19px' }} />
                </StyledFolderFileBtn>
              </>
            )}

            {confirmDelete && !row.isRoot && (
              <StyledFolderFileBtn
                onMouseDown={e => {
                  e.preventDefault()
                  confirmDelete(row)
                }}
                title="Delete"
              >
                <DeleteOutlined style={{ fontSize: '19px' }} />
              </StyledFolderFileBtn>
            )}

            {isRename ? (
              <StyledFolderFileBtn
                onMouseDown={e => {
                  e.preventDefault()
                  setRename(false)
                }}
                title="Close"
              >
                <CloseCircleOutlined style={{ fontSize: '22px' }} />
              </StyledFolderFileBtn>
            ) : (
              renameResource && (
                <StyledFolderFileBtn
                  onMouseDown={e => {
                    e.preventDefault()
                    setRename(true)
                  }}
                  title="Rename"
                >
                  <EditOutlined style={{ fontSize: '22px' }} />
                </StyledFolderFileBtn>
              )
            )}
          </ToolsContainer>
        )}
      </TitleToolsContainer>
    </RowContainer>
  )
}

export default RowRender
