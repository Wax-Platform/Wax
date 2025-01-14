/* stylelint-disable no-descending-specificity */
/* stylelint-disable declaration-no-important */
import React, { useContext, useEffect, useState } from 'react'
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
  CheckCircleFilled,
} from '@ant-design/icons'
import { debounce } from 'lodash'
import { AiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
import { DocumentContext } from '../hooks/DocumentContext'
import { CleanButton, FlexRow } from '../../_styleds/common'
import ContextMenu from '../../common/ContextMenu'
import { useBool } from '../../../hooks/dataTypeHooks'
import { arrIf, objIf } from '../../../shared/generalUtils'

const RowContainer = styled.div`
  background: ${p => (p.$selected ? 'var(--color-trois-lightest-3)' : '#fff0')};
  border-bottom: 1px solid var(--color-trois-alpha);
  color: ${p => (p.$active ? 'var(--color-purple)' : 'inherit')};
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-weight: ${p => (p.$active ? '600' : 'normal')};
  padding: 2px 0;
  position: relative;
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

    svg {
      fill: var(--svg-fill);
    }
  }
`

const StyledContextMenu = styled(ContextMenu)`
  color: var(--color-trois-opaque);
  position: absolute;
  top: 50%;

  li > button {
    gap: 8px;

    svg {
      fill: var(--color-trois-opaque);
    }
  }
`

const DeleteResourceLabel = (
  <>
    <DeleteFilled style={{ fontSize: '16px' }} />
    <span>Delete</span>
  </>
)

const RenameResourceLabel = (
  <>
    <EditFilled style={{ fontSize: '16px' }} />
    <span>Rename</span>
  </>
)

const RowRender = row => {
  const {
    id,
    title,
    renameResource,
    isFolder,
    doc = {},
    confirmDelete,
    isRoot,
    isSharedFolder,
    isSelected,
    selectedDocs,
    setSelectedDocs,
  } = row
  const { docId, userInteractions } = useContext(AiDesignerContext)
  const { handleResourceClick, rename, setRename } = useContext(DocumentContext)
  const contextMenu = useBool({ start: false })

  useEffect(() => {
    const hideContextMenuOnClickOutside = e => {
      !e.target.dataset.contextmenu && contextMenu.off()
    }
    window.addEventListener('click', hideContextMenuOnClickOutside)
    return () => {
      window.removeEventListener('click', hideContextMenuOnClickOutside)
    }
  }, [])

  const allow = {
    delete: !isRoot && row.id !== docId,
    rename: true,
  }

  const contextMenuItems = [
    ...arrIf(allow.delete, {
      label: DeleteResourceLabel,
      action: () => {
        confirmDelete(row)
        contextMenu.off()
      },
    }),
    ...arrIf(allow.rename, {
      label: RenameResourceLabel,
      action: () => {
        setRename({ id, title })
        contextMenu.off()
      },
    }),
  ]

  return (
    <RowContainer
      $selected={isSelected}
      $active={docId === doc?.identifier}
      onClick={e => {
        if (!userInteractions.ctrl) setSelectedDocs([])
        else {
          const newSelectedDocs = isSelected
            ? selectedDocs.filter(d => d !== id)
            : [...selectedDocs, id]
          setSelectedDocs(newSelectedDocs)
        }
      }}
      onDoubleClick={e => {
        e.preventDefault()
        !userInteractions.ctrl && handleResourceClick({ ...row, doc })
      }}
      onContextMenu={e => {
        e.preventDefault()
        contextMenu.on()
      }}
      onMouseLeave={contextMenu.off}
      $folder={isFolder}
      $sharedFolder={isSharedFolder}
    >
      <TitleToolsContainer>
        {rename.id === id ? (
          <FlexRow>
            <StyledInput
              type="text"
              autoFocus
              onMouseDown={e => (e.target.style.position = 'absolute')}
              value={rename.title}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  renameResource({
                    variables: { ...rename },
                  })
                  setRename({ id: null, title: '' })
                }
              }}
              onChange={e => setRename({ ...rename, title: e.target.value })}
            />
            <FlexRow style={{ gap: '5px' }}>
              <CleanButton
                onClick={e => {
                  e.preventDefault()
                  renameResource({ variables: { ...rename } })
                  setRename({ id: null, title: '' })
                }}
              >
                <CheckCircleFilled
                  style={{ fontSize: '18px', color: 'var(--color-primary)' }}
                />
              </CleanButton>
              <CleanButton
                onMouseDown={e => {
                  e.preventDefault()
                  renameResource({ variables: { id, title } })
                  setRename({ id: null, title: '' })
                }}
                title="Close"
              >
                <CloseCircleFilled style={{ fontSize: '18px' }} />
              </CleanButton>
            </FlexRow>
          </FlexRow>
        ) : (
          <IconTitleContainer>
            {isFolder ? (
              <FolderFilled style={{ fontSize: '16px' }} />
            ) : (
              <FileOutlined style={{ fontSize: '12px' }} />
            )}
            <span>
              {!isRoot && title.length > 30
                ? `${title.substring(0, 18)}...`
                : title}
            </span>
          </IconTitleContainer>
        )}
        <StyledContextMenu show={contextMenu.state} items={contextMenuItems} />
      </TitleToolsContainer>
    </RowContainer>
  )
}

export default RowRender
