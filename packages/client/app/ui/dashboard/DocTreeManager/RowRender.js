/* stylelint-disable no-descending-specificity */
/* stylelint-disable declaration-no-important */
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import {
  FolderAddFilled,
  FileAddFilled,
  DeleteFilled,
  EditFilled,
  CloseCircleFilled,
  FileOutlined,
  FolderFilled,
  CheckCircleOutlined,
  CheckCircleFilled,
} from '@ant-design/icons'
import Button from '../../common/Button'
import { debounce } from 'lodash'
import { AiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
import { DocumentContext } from '../hooks/DocumentContext'
import { CleanButton, FlexRow } from '../../_styleds/common'
import useAssistant from '../../component-ai-assistant/hooks/useAiDesigner'

const RowContainer = styled.div`
  border-bottom: 1px solid var(--color-trois-alpha);
  color: ${p => (p.$active ? 'var(--color-purple)' : 'inherit')};
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-weight: ${p => (p.$active ? '600' : 'normal')};
  padding: 2px 0;
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
const TitleToolsContainer = styled(FlexRow)`
  width: 100%;
`

const ToolsContainer = styled(FlexRow)`
  gap: 4px;

  padding: 4px 10px;
  transition: opacity 0.3s;
`

const StyledFolderFileBtn = styled(CleanButton)`
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
  }

  svg {
    fill: var(--color-trois-light);
    pointer-events: none;

    &:active,
    &:focus,
    &:hover {
      fill: var(--color-trois);
    }
  }
`
const StyledInput = styled.input`
  background-color: #fff0;
  border: none;
  border-bottom: 1px solid var(--color-trois);
  margin-right: 5px;

  &:focus {
    outline: none;
  }
`

const IconTitleContainer = styled.div`
  --svg-fill: var(--color-trois);
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
      fill: var(--svg-fill);
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
    isRoot,
    isSharedFolder,
  } = row
  const { docId } = useContext(AiDesignerContext)
  const { getAidMisc } = useAssistant()
  const history = useHistory()
  const { setCurrentDoc } = useContext(DocumentContext)
  const [updatedName, setUpdateName] = useState(title)
  const [rename, setRename] = useState(false)
  const [lock, setLock] = useState(false)

  const goToDocument = async e => {
    if (!lock) {
      setLock(true)

      debounce(() => {
        setLock(false)
      }, 1500)()

      if (e.target.type === 'text') {
        e.preventDefault()
        return false
      }
      !isFolder && history.push(`/${identifier}`, { replace: true })
      !isFolder && setCurrentDoc(row)
    }
  }

  useEffect(() => {
    console.log(row)
    docId === identifier && setCurrentDoc(row)
  }, [docId])

  return (
    <RowContainer
      $active={docId === identifier}
      onClick={goToDocument}
      $folder={isFolder}
      $sharedFolder={isSharedFolder}
    >
      <TitleToolsContainer>
        {rename ? (
          <FlexRow>
            <StyledInput
              type="text"
              autoFocus
              value={updatedName}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.keyCode === 13) {
                  renameResource({
                    variables: { id, title: updatedName },
                  })
                  setRename(false)
                }
              }}
              onChange={e => setUpdateName(e.target.value)}
            />
            <CleanButton
              onClick={() => {
                renameResource({ variables: { id, title: updatedName } })
                setRename(false)
              }}
            >
              <CheckCircleFilled
                style={{ fontSize: '16px', color: 'var(--color-primary)' }}
              />
            </CleanButton>
            <CleanButton
              onMouseDown={e => {
                e.preventDefault()
                setRename(false)
              }}
              title="Close"
            >
              <CloseCircleFilled style={{ fontSize: '16px' }} />
            </CleanButton>
          </FlexRow>
        ) : (
          <IconTitleContainer>
            {isFolder ? (
              <FolderFilled style={{ fontSize: '16px' }} />
            ) : (
              <FileOutlined style={{ fontSize: '12px' }} />
            )}
            <span>
              {!isRoot && title.length > 18
                ? `${title.substring(0, 18)}...`
                : title}
            </span>
          </IconTitleContainer>
        )}

        <ToolsContainer id="tools-container">
          {isFolder && addResource && (
            <>
              <StyledFolderFileBtn
                onClick={() =>
                  addResource({ variables: { id, isFolder: true } })
                }
                title="Add Folder"
              >
                <FolderAddFilled
                  style={{ fontSize: '16px', marginBottom: '-3px' }}
                />
              </StyledFolderFileBtn>
              <StyledFolderFileBtn
                onClick={() =>
                  addResource({ variables: { id, isFolder: false } })
                }
                title="Add File"
              >
                <FileAddFilled style={{ fontSize: '16px' }} />
              </StyledFolderFileBtn>
            </>
          )}

          {confirmDelete && !isRoot && row.id !== docId && (
            <StyledFolderFileBtn
              onMouseDown={e => {
                e.preventDefault()
                confirmDelete(row)
              }}
              title="Delete"
            >
              <DeleteFilled style={{ fontSize: '16px' }} />
            </StyledFolderFileBtn>
          )}

          {!rename && renameResource && (
            <StyledFolderFileBtn
              onMouseDown={e => {
                e.preventDefault()
                setRename(true)
              }}
              title="Rename"
            >
              <EditFilled style={{ fontSize: '16px' }} />
            </StyledFolderFileBtn>
          )}
        </ToolsContainer>
      </TitleToolsContainer>
    </RowContainer>
  )
}

export default RowRender
