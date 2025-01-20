import React, { Fragment, useEffect, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import {
  FileOutlined,
  FolderFilled,
  ScissorOutlined,
  ShareAltOutlined,
  InfoCircleOutlined,
  DeleteFilled,
  EditFilled,
  FolderOpenFilled,
  CopyFilled,
  StarFilled,
} from '@ant-design/icons'
import { useAiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
import { useDocumentContext } from '../hooks/DocumentContext'
import { FlexRow } from '../../_styleds/common'
import { capitalize } from 'lodash'
import { callOn, safeParse, switchOn } from '../../../shared/generalUtils'

const resourceShow = keyframes`
  from {
    opacity: 0;
    transform: scale(0);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
`

const ListContainer = styled.div`
  --icon-size: 16px;
  --icon-title-direction: row;
  --w-h: 100%;
  --icon-title-min-height: 24px;
  --label-white-space: nowrap;
  --label-height: fit-content;
  align-items: center;
  /* animation: ${resourceShow} 0.3s; */
  background: ${p => (p.$selected ? 'var(--color-trois-lightest)' : '#fff0')};
  border: none;
  border-bottom: 1px solid;
  border-color: var(--color-trois-alpha);
  border-inline: 1px solid
    ${p => (p.$selected ? 'var(--color-trois-alpha)' : '#0000')};
  color: ${p => (p.$active ? 'var(--svg-fill)' : 'inherit')};
  display: flex;
  font-size: 14px;
  font-weight: ${p => (p.$active ? '600' : 'normal')};
  height: fit-content;
  padding: 2px 18px;
  position: relative;
  width: 100%;

  &:hover {
    background-color: #00000005;
    color: var(--svg-fill);
  }
`

const GridContainer = styled.div`
  --icon-size: 28px;
  --icon-title-direction: column;
  --icon-title-min-height: 30px;
  --label-white-space: nowrap;
  --label-height: 24px;
  --w-h: calc((25dvw / 6));
  align-items: center;
  /* animation: ${resourceShow} 0.3s; */
  background: ${p => (p.$selected ? 'var(--color-trois-lightest)' : '#fff0')};
  border-radius: 8px;
  color: ${p => (p.$active ? 'var(--svg-fill)' : 'inherit')};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-weight: ${p => (p.$active ? '600' : 'normal')};
  height: var(--w-h);
  justify-content: center;
  padding: 0;
  position: relative;
  width: var(--w-h);

  &:hover {
    background-color: #00000005;
    color: var(--svg-fill);
  }
`

const StyledInput = styled.input`
  background-color: #fff0;
  border: none;
  border-bottom: 1px solid var(--svg-fill);
  display: flex;
  margin-right: 5px;
  max-width: var(--w-h);

  &:focus {
    outline: none;
  }
`

const IconTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: var(--icon-title-direction);
  gap: 8px;
  min-height: var(--icon-title-min-height);

  span {
    line-height: 1;

    svg {
      fill: var(--svg-fill);
    }
  }
`

const FolderIcon = styled(FolderFilled)`
  font-size: var(--icon-size);
  height: 100%;
`

const FileIcon = styled(FileOutlined)`
  font-size: var(--icon-size);
  height: 100%;
`

const TitleLabel = styled.span`
  align-items: center;
  font-size: 12px;
  height: var(--label-height);
  max-height: var(--label-height);
  max-width: calc(var(--w-h) - 10px);
  overflow: hidden;
  pointer-events: none;
  text-align: center;
  text-overflow: ellipsis;
  user-select: none;
  white-space: var(--label-white-space);
`

const labelRender = (icon, text) => (
  <Fragment>
    {icon}
    <span>{capitalize(text)}</span>
  </Fragment>
)

const CONTEXT_MENU_ITEMS = [
  'open',
  'rename',
  '-',
  'copy',
  'cut',
  'delete',
  '-',
  'add to favorites',
  'share',
  'info',
  // '-',
]

const ITEMS_TOOLTIPS = {
  open: 'Open resource',
  rename: 'Rename resource',
  copy: 'Copy resource',
  cut: 'Cut resource',
  delete: 'Delete resource',
  'add to favorites': 'Add to favorites',
  share: 'Share resource',
  info: 'Resource info',
}

const LABELS = {
  delete: labelRender(<DeleteFilled />, 'delete'),
  rename: labelRender(<EditFilled />, 'rename'),
  open: labelRender(<FolderOpenFilled />, 'open'),
  copy: labelRender(<CopyFilled />, 'copy'),
  cut: labelRender(<ScissorOutlined />, 'cut'),
  info: labelRender(<InfoCircleOutlined />, 'info'),
  share: labelRender(<ShareAltOutlined />, 'share'),
  'add to favorites': labelRender(<StarFilled />, 'add to favorites'),
  '-': '-',
}

const typeFlags = type => ({
  isRoot: type === 'root',
  isFolder: type === 'dir',
  isSystem: type === 'system',
  isDoc: type === 'doc',
})

const Resource = props => {
  const { resource, confirmDelete, onResourceDrop, view } = props
  const { id, title, resourceType, doc = {} } = resource
  const { userInteractions } = useAiDesignerContext()

  const {
    openResource,
    rename,
    selectedDocs,
    setSelectedDocs,
    docId,
    renameResource,
    docPath,
    contextualMenu,
  } = useDocumentContext()

  const { isRoot, isFolder, isSystem } = typeFlags(resourceType)
  const isSelected = selectedDocs.includes(id)
  const isActive = docId === doc?.identifier
  const currentDocIsDescendant = docPath?.includes(id)

  useEffect(() => {
    const hideContextMenu = ({ target }) => {
      const { dataset } = target
      !dataset.contextmenu && contextualMenu.update({ show: false })
      !dataset.contextmenu && setSelectedDocs([])
    }

    window.addEventListener('click', hideContextMenu)

    return () => {
      window.removeEventListener('click', hideContextMenu)
    }
  }, [contextualMenu])

  const handleOpen = useCallback(
    e => {
      e.preventDefault()
      !contextualMenu.state?.show &&
        !userInteractions.ctrl &&
        openResource(resource)
    },
    [contextualMenu.state?.show, userInteractions.ctrl, openResource, resource],
  )

  const handleContextMenuOpen = useCallback(
    e => {
      e.preventDefault()
      e.stopPropagation()
      setSelectedDocs([id])

      const optionValidations = {
        default: true,
        open: !isActive,
        rename: !isRoot && !isSystem,
        copy: !isRoot && !isSystem,
        cut: !isRoot && !isSystem && !isActive,
        delete: !isRoot && !isActive && !currentDocIsDescendant && !isSystem,
        'add to favorites': !isRoot && !isSystem,
        share: !isRoot && !isSystem,
      }

      const actions = {
        open: () => openResource(resource),
        delete: () => confirmDelete(resource),
        rename: () => rename.update({ id, title }),
      }

      const buildOption = optionName => {
        const option = {
          label: LABELS[optionName] || optionName,
          action: actions[optionName] || (() => {}),
          title: ITEMS_TOOLTIPS[optionName],
        }

        const includeOption = switchOn(optionName, optionValidations)
        return includeOption && option
      }

      const contextMenuItems =
        CONTEXT_MENU_ITEMS.map(buildOption).filter(Boolean)

      contextualMenu.update({
        items: contextMenuItems,
        x: e.clientX,
        y: e.clientY,
        show: true,
      })
    },
    [
      id,
      title,
      rename,
      isRoot,
      isSystem,
      isActive,
      openResource,
      confirmDelete,
      contextualMenu,
      setSelectedDocs,
      currentDocIsDescendant,
    ],
  )

  const handleSelection = useCallback(
    e => {
      if (contextualMenu.state.show) contextualMenu.update({ show: false })
      rename.reset()
      if (!userInteractions.ctrl) {
        setSelectedDocs(isSelected ? [] : [id])
        return
      }
      const newSelectedDocs = isSelected
        ? selectedDocs.filter(d => d !== id)
        : [...selectedDocs, id]
      setSelectedDocs(newSelectedDocs)
    },
    [
      contextualMenu.state.show,
      rename,
      userInteractions.ctrl,
      isSelected,
      selectedDocs,
      setSelectedDocs,
      id,
    ],
  )

  const handleRenameOnEnter = useCallback(
    e => callOn(e.key, { Enter: renameResource, Escape: rename.reset }),
    [renameResource, rename],
  )

  const handleDragStart = useCallback(
    e => {
      e.dataTransfer.setData('text/plain', JSON.stringify(resource))
    },
    [resource],
  )

  const handleDrop = useCallback(
    e => {
      e.preventDefault()
      const draggedData = safeParse(e.dataTransfer.getData('text/plain'))
      onResourceDrop(draggedData, resource)
    },
    [onResourceDrop, resource],
  )

  const handleDragOver = useCallback(e => {
    e.preventDefault()
  }, [])

  const ResourceIcon = isSystem ? StarFilled : isFolder ? FolderIcon : FileIcon

  const iconColor = switchOn(resourceType, {
    doc: 'var(--color-trois-opaque)',
    dir: 'var(--color-trois-opaque)',
    root: 'var(--color-trois-opaque)',
    system: '#095',
  })

  const Container = switchOn(view, {
    list: ListContainer,
    default: GridContainer,
  })

  return (
    <Container
      $gridSize={view}
      $selected={isSelected}
      $active={isActive}
      data-contextmenu
      onClick={handleSelection}
      onDoubleClick={handleOpen}
      onContextMenu={handleContextMenuOpen}
      $folder={isFolder}
      style={{ '--svg-fill': iconColor }}
      draggable={!isSystem && !isActive}
      onDragStart={handleDragStart}
      onDrop={isFolder ? handleDrop : null}
      onDragOver={isFolder ? handleDragOver : null}
    >
      <IconTitleContainer data-contextmenu>
        <ResourceIcon data-contextmenu />
        {rename.state.id === id ? (
          <FlexRow>
            <StyledInput
              type="text"
              autoFocus
              value={rename.state.title}
              onKeyDown={handleRenameOnEnter}
              onChange={e => rename.update({ title: e.target.value })}
            />
          </FlexRow>
        ) : (
          <TitleLabel>{title}</TitleLabel>
        )}
      </IconTitleContainer>
    </Container>
  )
}

export default Resource
