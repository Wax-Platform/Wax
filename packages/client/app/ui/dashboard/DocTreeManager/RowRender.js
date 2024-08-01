/* stylelint-disable no-descending-specificity */
/* stylelint-disable declaration-no-important */
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
  border-bottom: 1px solid var(--color-trois-alpha);
  color: ${props => (props.isActive ? 'black' : 'inherit')};
  display: flex;
  flex-direction: column;
  font-weight: ${props => (props.isActive ? '600' : 'normal')};
  padding: 10px;
  width: 100%;

  #tools-container {
    opacity: 0;
    pointer-events: none;
  }

  &:hover {
    #tools-container {
      opacity: 1;
      pointer-events: all;
    }
  }
`
const TitleToolsContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`

const ToolsContainer = styled.div`
  display: flex;
  gap: 4px;
  transition: opacity 0.3s;
`

const StyledFolderFileBtn = styled(Button)`
  background-color: transparent;
  border: none;
  outline: 0 !important;
  padding: 0;
  text-decoration: none;
  width: fit-content;

  svg {
    fill: var(--color-primary);

    &:active,
    &:focus,
    &:hover {
      fill: var(--color-primary-dark);
    }
  }
`
const StyledInput = styled.input`
  background-color: #f6edf6;
  border: 2px solid #a34ba1;
  margin-right: 5px;

  &:focus {
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
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 8px;
  min-height: 30px;

  span {
    line-height: 1;
    /* margin-bottom: 10px;
    margin-right: 5px; */

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
            {isFolder && <FolderAddFilled style={{ fontSize: '18px' }} />}
            <span>
              {!row.isRoot && title.length > 18
                ? `${title.substring(0, 18)}...`
                : title}
            </span>
          </IconTitleContainer>
        )}
        {!row.isRoot && (
          <ToolsContainer id="tools-container">
            {isFolder && addResource && (
              <>
                <StyledFolderFileBtn
                  onClick={() =>
                    addResource({ variables: { id, isFolder: true } })
                  }
                  title="Add Folder"
                >
                  <FolderAddFilled style={{ fontSize: '18px' }} />
                </StyledFolderFileBtn>
                <StyledFolderFileBtn
                  onClick={() =>
                    addResource({ variables: { id, isFolder: false } })
                  }
                  title="Add File"
                >
                  <FileAddFilled style={{ fontSize: '18px' }} />
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
                <DeleteFilled style={{ fontSize: '18px' }} />
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
                <CloseCircleFilled style={{ fontSize: '18px' }} />
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
                  <EditFilled style={{ fontSize: '18px' }} />
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
