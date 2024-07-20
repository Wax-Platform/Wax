import React, { useLayoutEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import {
  FolderAddFilled,
  FileAddFilled,
  DeleteFilled,
  EditFilled,
  CloseCircleFilled,
} from '@ant-design/icons'
import Button from '../../common/Button'

const RowContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  margin-bottom: 5px;
  color: ${props => (props.isActive ? 'black' : 'inherit')};
  font-weight: ${props => (props.isActive ? '600' : 'normal')};
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
  text-decoration: none;
  border: none;
  outline: 0 !important;
  width: fit-content;
  padding: 0;
  margin-left: 10px;

  svg {
    fill: #6db6d6;
    &:active,
    &:focus,
    &:hover {
      fill: #49a4cc;
    }
  }
`
const StyledInput = styled.input`
  margin-right: 5px;

  border: 2px solid #a34ba1;
  background-color: #f6edf6;
  :focus {
    outline: none;
  }
`

const StyledApplyButton = styled(Button)`
  background-color: #a34ba1;
  color: #fff;
  &:hover {
    background-color: #a34ba1 !important;
    color: #fff !important;
  }
`

const IconTitleContainer = styled.div`
  display: flex;
  flex-direction: row;

  span {
    margin-right: 5px;
    margin-bottom: 10px;

    svg {
      fill: #a34ba1;
    }
  }
`

let lock = false

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
  } = row

  const history = useHistory()
  const [updatedName, setUpdateName] = useState(title)
  const [isRename, setRename] = useState(false)

  const setActive = () => {
    Array.from(document.getElementsByClassName('rowContainer')).forEach(
      element => {
        const id = element.getAttribute('id')
        if (id === identifier) {
          element.style.color = 'black'
          element.style.fontWeight = '600'
        } else {
          element.style.color = 'inherit'
          element.style.fontWeight = 'normal'
        }
      },
    )
  }

  const goToDocument = e => {
    if (!lock) {
      lock = true
      setTimeout(() => {
        lock = false
      }, 1500)

      if (e.target.type === 'text') {
        e.preventDefault()
        return false
      }

      if (!isFolder) {
        history.push(`/${identifier}`, { replace: true })
        setActive()
      }
    }
  }

  return (
    <RowContainer
      id={identifier}
      className="rowContainer"
      isActive={isActive}
      onClick={e => goToDocument(e)}
    >
      <TitleToolsContainer>
        {isRename ? (
          <>
            <StyledInput
              type="text"
              autoFocus
              value={updatedName}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.keyCode === 13) {
                  renameResource({ variables: { id, title: updatedName } })
                  setRename(false)
                }
              }}
              onChange={e => setUpdateName(e.target.value)}
            />
            <StyledApplyButton
              onMouseDown={e => {
                e.preventDefault()
                renameResource({ variables: { id, title: updatedName } })
                setRename(false)
              }}
              onClick={() => {
                renameResource({ variables: { id, title: updatedName } })
                setRename(false)
              }}
            >
              Apply
            </StyledApplyButton>
          </>
        ) : (
          <IconTitleContainer>
            {isFolder && <FolderAddFilled style={{ fontSize: '19px' }} />}
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
                  <FolderAddFilled style={{ fontSize: '19px' }} />
                </StyledFolderFileBtn>
                <StyledFolderFileBtn
                  onClick={() =>
                    addResource({ variables: { id, isFolder: false } })
                  }
                  title="Add File"
                >
                  <FileAddFilled style={{ fontSize: '19px' }} />
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
                <DeleteFilled style={{ fontSize: '19px' }} />
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
                <CloseCircleFilled style={{ fontSize: '22px' }} />
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
                  <EditFilled style={{ fontSize: '22px' }} />
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
