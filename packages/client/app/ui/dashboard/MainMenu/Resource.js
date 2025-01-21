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
  BookFilled,
  FolderViewOutlined,
  FileImageFilled,
  FileTextFilled,
  PictureFilled,
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
  border-color: var(--color-trois-lightest);
  color: ${p => (p.$active ? 'var(--svg-fill)' : 'inherit')};
  display: flex;
  font-size: 14px;
  font-weight: ${p => (p.$active ? '600' : 'normal')};
  height: 35px;
  margin: ${props => (props.isDragging ? '2px 10px' : '0')};
  min-height: 35px;
  /* opacity: ${p => (p.$ghost ? '0.5' : '1')}; */
  opacity: ${props => (props.isDragging ? 0.7 : 1)};
  padding: 2px 18px;
  position: relative;
  transform: ${props => (props.isDragging ? 'scale(0.98)' : 'scale(1)')};
  transition: all 0.2s ease;
  transition: all 0.2s;
  user-select: none;
  width: 100%;

  &:hover {
    background-color: #00000005;
    color: var(--svg-fill);
  }
`

const GridContainer = styled.div`
  --grid-size: ${p => p.$gridSize || 6};
  --w-h: calc((var(--container-size, 26.5dvw) / var(--grid-size)));
  --icon-size: calc(var(--w-h) * 0.4);
  --icon-min-width: calc(var(--w-h) - 10px);
  --icon-title-direction: column;
  --icon-title-min-height: 30px;
  --label-white-space: nowrap;
  --label-height: 24px;
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
  opacity: ${p => (p.$ghost ? '0.5' : '1')};
  padding: 0;
  position: relative;
  transition: all 0.2s;
  user-select: none;
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

  .anticon {
    height: 100%;
  }

  span {
    line-height: 1;

    svg {
      fill: var(--svg-fill);
      font-size: var(--icon-size);
    }
  }
`

const FolderIcon = styled(FolderFilled)`
  font-size: var(--icon-size);
  min-width: 20px;
`

const FileIcon = styled(FileOutlined)`
  font-size: var(--icon-size);
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

const MENU_OPTIONS = [
  'open',
  'rename',
  '-',
  'copy',
  'cut',
  // 'paste',
  'delete',
  '-',
  'add to favorites',
  'share',
  'info',
  // '-',
]

const ICONSTMAP = {
  Documents: FolderViewOutlined,
  Favorites: StarFilled,
  Books: BookFilled,
  Images: PictureFilled,
  Shared: ShareAltOutlined,
  Trash: DeleteFilled,
  Templates: FileTextFilled,
  default: FolderFilled,
}

const PasteIcon = () => (
  <svg
    width="16px"
    height="16px"
    viewBox="0 0 36 36"
    version="1.1"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>clipboard-solid</title>
    <path
      d="M29.29,5H22.17a4.45,4.45,0,0,0-4.11-3A4.46,4.46,0,0,0,14,5H7A1.75,1.75,0,0,0,5,6.69V32.31A1.7,1.7,0,0,0,6.71,34H29.29A1.7,1.7,0,0,0,31,32.31V6.69A1.7,1.7,0,0,0,29.29,5Zm-18,3a1,1,0,0,1,1-1h3.44V6.31a2.31,2.31,0,1,1,4.63,0V7h3.44a1,1,0,0,1,1,1v2H11.31ZM25,28H11V26H25Zm0-4H11V22H25Zm0-4H11V18H25Zm0-4H11V14H25Z"
      class="clr-i-solid clr-i-solid-path-1"
    ></path>
    <rect x="0" y="0" width="36" height="36" fill-opacity="0" />
  </svg>
)

// const ITEMS_TOOLTIPS = {
//   open: 'Open resource',
//   rename: 'Rename resource',
//   copy: 'Copy resource',
//   cut: 'Cut resource',
//   delete: 'Delete resource',
//   'add to favorites': 'Add to favorites',
//   share: 'Share resource',
//   info: 'Resource info',
// }

const LABELS = {
  delete: labelRender(<DeleteFilled />, 'delete'),
  rename: labelRender(<EditFilled />, 'rename'),
  open: labelRender(<FolderOpenFilled />, 'open'),
  copy: labelRender(<CopyFilled />, 'copy'),
  cut: labelRender(<ScissorOutlined />, 'cut'),
  paste: labelRender(<PasteIcon />, 'paste'),
  info: labelRender(<InfoCircleOutlined />, 'info'),
  share: labelRender(<ShareAltOutlined />, 'share'),
  'add to favorites': labelRender(<StarFilled />, 'add to favorites'),
  '-': '-',
}

const typeFlags = type => ({
  isRoot: type === 'root',
  isFolder: type === 'dir',
  isSystem: type === 'sys',
  isDoc: type === 'doc',
})

const Resource = props => {
  const {
    view,
    reorderMode,
    resource,
    confirmDelete,
    onResourceDrop,
    ...rest
  } = props
  const { id, title, resourceType, doc = {} } = resource || {}
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
    // clipboard,
  } = useDocumentContext()

  const { isRoot, isFolder, isSystem } = typeFlags(resourceType)
  const isSelected = selectedDocs.includes(id)
  const isActive = docId === doc?.identifier
  const currentDocIsDescendant = docPath?.includes(id)
  const allowDnD = !isSystem && !isActive && !currentDocIsDescendant

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
  // const handleCutCopy = useCallback(
  //   action => {
  //     clipboard.update({
  //       [action]: { items: [id], parent: resource.parentId },
  //     })
  //   },
  //   [clipboard.state, id],
  // )

  const handleContextMenuOpen = useCallback(
    e => {
      e.preventDefault()
      e.stopPropagation()
      selectedDocs?.length <= 1 && setSelectedDocs([id])

      const optionValidations = {
        default: true,
        open: !isActive,
        rename: !isRoot && !isSystem,
        copy: !isRoot && !isSystem,
        // paste:
        //   isFolder &&
        //   clipboard.state.cut.items.length &&
        //   clipboard.state.copy.items.length,
        cut: !isRoot && !isSystem && !isActive && !currentDocIsDescendant,
        delete: !isRoot && !isActive && !currentDocIsDescendant && !isSystem,
        'add to favorites': !isRoot && !isSystem,
        share: !isRoot && !isSystem,
      }

      const actions = {
        open: () => openResource(resource),
        delete: () => confirmDelete(resource),
        rename: () => rename.update({ id, title }),
        // copy: () => handleCutCopy('copy'),
        // cut: () => handleCutCopy('cut'),
        // paste: clipboard.reset,
      }

      const buildOption = optionName => {
        const option = {
          label: LABELS[optionName] || optionName,
          action: actions[optionName] || (() => {}),
          // title: ITEMS_TOOLTIPS[optionName],
        }

        const includeOption = switchOn(optionName, optionValidations)
        return includeOption && option
      }

      const contextMenuItems = MENU_OPTIONS.map(buildOption).filter(Boolean)

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
      // clipboard.state,
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

  const ResourceIcon = isSystem
    ? switchOn(title, ICONSTMAP)
    : isFolder
    ? FolderIcon
    : FileIcon

  const iconColor = switchOn(resourceType, {
    doc: 'var(--color-trois-opaque)',
    dir: 'var(--color-trois-opaque)',
    root: 'var(--color-trois-opaque)',
    sys: 'var(--color-trois-opaque-2)',
  })

  const Container = switchOn(view, {
    list: ListContainer,
    default: GridContainer,
  })

  return (
    <Container
      $selected={isSelected}
      $reorder={reorderMode}
      // $ghost={clipboard.state.cut.items.includes(id)}
      $active={isActive || currentDocIsDescendant}
      $folder={isFolder}
      data-contextmenu
      style={{ '--svg-fill': iconColor }}
      onClick={handleSelection}
      onDoubleClick={handleOpen}
      onContextMenu={handleContextMenuOpen}
      draggable={allowDnD}
      onDragStart={handleDragStart}
      onDrop={isFolder && !reorderMode.state ? handleDrop : null}
      onDragOver={isFolder ? handleDragOver : null}
      title={title}
      {...rest}
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
