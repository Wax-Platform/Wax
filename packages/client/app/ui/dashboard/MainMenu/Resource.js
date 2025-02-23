import React, { Fragment, useEffect, useCallback, useMemo } from 'react'
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
  PictureFilled,
  FontSizeOutlined,
  FileTextFilled,
} from '@ant-design/icons'
import { useAiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
import { useDocumentContext } from '../hooks/DocumentContext'
import { FlexRow } from '../../_styleds/common'
import {
  callOn,
  objIf,
  safeParse,
  switchOn,
} from '../../../shared/generalUtils'
import { labelRender, typeFlags } from './utils/resourcesUtils'
import templateIcon from '../../../../static/template-icon-2.svg'
import AiDesigner from '../../../AiDesigner/AiDesigner'

export const ListContainer = styled.div`
  --icon-size: 16px;
  --icon-title-direction: row;
  --icon-title-gap: 8px;
  --w-h: 100%;
  --icon-title-min-height: 24px;
  --label-white-space: normal;
  --label-height: fit-content;
  --label-width: 100%;

  align-items: center;
  background: ${p =>
    p.$selected || p.isDragging ? 'var(--color-trois-lightest)' : '#fff0'};
  border: none;
  border-bottom: 1px solid;
  border-color: var(--color-trois-lightest);
  color: ${p => (p.$active ? 'var(--svg-fill)' : 'inherit')};
  display: flex;
  filter: ${p => (p.isDragging ? 'brightness(0.97)' : 'unset')};
  font-size: 14px;
  font-weight: ${p => (p.$active ? '600' : 'normal')};
  gap: 8px;
  height: 35px;
  min-height: 35px;
  padding: 2px 18px;
  position: relative;
  transform: ${props => (props.isDragging ? 'scale(1.01)' : 'scale(1)')};
  transition: filter 0.2s, transform 0.2s;
  user-select: none;
  width: 100%;

  &:hover {
    background-color: #00000005;
    color: var(--svg-fill);
    cursor: ${p => (p.$reorder ? 'grabbing' : 'pointer')};
  }
`

export const GridContainer = styled.div`
  --grid-size: ${p => p.gridSize || 5};
  --w-h: calc((var(--container-size, 26.5dvw) / var(--grid-size)));
  --icon-size: calc(var(--w-h) * 0.4);
  --icon-min-width: calc(var(--w-h) - 10px);
  --icon-title-direction: column;
  --icon-title-min-height: 30px;
  --icon-title-gap: 0;
  --label-white-space: nowrap;
  --label-height: 24px;
  --label-width: calc(var(--w-h) - 10px);

  align-items: center;
  /* animation: ${resourceShow} 0.3s; */
  background: ${p =>
    p.$selected || p.isDragging ? 'var(--color-trois-lightest)' : '#fff0'};
  border-radius: 8px;
  color: ${p => (p.$active ? 'var(--svg-fill)' : 'inherit')};
  cursor: pointer;
  display: flex;
  filter: ${p => (p.isDragging ? 'brightness(0.97)' : 'brightness(1)')};
  flex-direction: column;
  font-size: 14px;
  font-weight: ${p => (p.$active ? '600' : 'normal')};
  height: var(--w-h);
  justify-content: center;
  padding: 0;
  position: relative;
  transform: ${props => (props.isDragging ? 'scale(1.02)' : 'scale(1)')};
  transition: filter 0.2s, transform 0.2s;
  user-select: none;
  width: var(--w-h);

  &:hover {
    background-color: #00000005;
    color: var(--svg-fill);
    cursor: ${p => (p.$reorder ? 'grabbing' : 'pointer')};
  }

  z-index: ${p => (p.$selected ? '999' : 'auto')};
`

export const StyledInput = styled.input`
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

export const IconTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: var(--icon-title-direction);
  gap: var(--icon-title-gap);
  justify-content: space-between;
  min-height: var(--icon-title-min-height);
  opacity: ${p => (p.$ghost ? '0.5' : '1')};

  .anticon {
    height: 100%;
    pointer-events: none;
  }

  button {
    height: 100%;
  }

  span {
    line-height: 1;

    svg {
      fill: var(--svg-fill);
      font-size: var(--icon-size);
      pointer-events: none;
      stroke-width: 0;
    }
  }
`

export const FolderIcon = styled(FolderFilled)`
  font-size: var(--icon-size);
  min-width: 20px;
`

export const FileIcon = styled(FileOutlined)`
  font-size: var(--icon-size);
`

export const TitleLabel = styled.span`
  align-items: center;
  height: ${p => !p.$selected && `var(--label-height)`};
  max-height: var(--label-height);

  pointer-events: none;
  text-align: center;
  user-select: none;
  width: var(--label-width);

  p {
    background: ${p => (p.$selected ? 'var(--color-trois-opaque-3)' : '#fff0')};
    border-radius: 4px;
    font-size: 12px;
    overflow: ${p => (p.$selected ? 'visible' : `hidden`)};
    padding: 4px;
    text-overflow: ellipsis;
    white-space: ${p => !p.$selected && 'var(--label-white-space)'};
    word-break: break-word;
  }
`

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

const NORMAL_MENU_OPTIONS = [
  'open',
  'rename',
  '-',
  'copy',
  'cut',
  'paste',
  'delete',
  '-',
  'add to favorites',
  'share',
  'info',
  // '-',
]

const TEMPLATE_MENU_OPTIONS = [
  'open',
  'rename',
  '-',
  'copy',
  'cut',
  'paste',
  'delete',
  '-',
  'info',
]

const StyledImage = styled.img`
  height: var(--icon-size);
  object-fit: cover;
  width: var(--icon-size);
`

const TemplateIcon = styled(StyledImage).attrs({ src: templateIcon })`
  width: calc(var(--icon-size) * 1.2);
`

const SYSTEM_FOLDER_ICONS_MAP = {
  Documents: FileTextFilled,
  Favorites: StarFilled,
  Books: BookFilled,
  Images: PictureFilled,
  Shared: ShareAltOutlined,
  Trash: DeleteFilled,
  Templates: TemplateIcon,
  Fonts: FontSizeOutlined,
  'My Templates': TemplateIcon,
  'My Snippets': ScissorOutlined,
  default: FolderFilled,
}

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

const ICON_COLORS = {
  doc: 'var(--color-trois-opaque)',
  dir: 'var(--color-trois-opaque)',
  root: 'var(--color-trois)',
  sys: 'var(--color-trois-opaque)',
  template: 'var(--color-blue)',
  snippet: '#c8617d',
}

const VIEW_BASED_CONTAINERS = {
  list: ListContainer,
  default: GridContainer,
}

const Resource = props => {
  const {
    view,
    reorderMode,
    resource,
    confirmDelete,
    onResourceDrop,
    ...rest
  } = props
  const { id, title, resourceType, doc = {}, templateId, img } = resource || {}
  const { userInteractions, selectedCtx } = useAiDesignerContext()

  const {
    openResource: open,
    rename,
    selectedDocs,
    setSelectedDocs,
    docId,
    renameResource,
    currentDoc,
    contextualMenu,
    addToFavs,
    clipboard,
    graphQL: { pasteResources },
  } = useDocumentContext()

  const { isRoot, isFolder, isSystem } = typeFlags(resourceType)
  const isSelected = selectedDocs.includes(id)
  const isActive =
    docId === doc?.identifier || templateId === currentDoc?.templateId
  const currentDocIsDescendant = currentDoc?.path?.includes(id)
  const allowDnD =
    (!isSystem && !isActive && !currentDocIsDescendant) || reorderMode.state
  const canPaste =
    isFolder &&
    (clipboard.state.cut?.items?.length || clipboard.state.copy?.items?.length)

  const openResource = useCallback(open, [open])
  const handleOpen = useCallback(
    e => {
      e.preventDefault()
      !isActive && !contextualMenu.state?.show && openResource(resource)
    },
    [contextualMenu.state?.show, userInteractions.ctrl, openResource, resource],
  )
  const handleCutCopy = useCallback(
    action => {
      clipboard.clear()
      console.log({ selectedDocs })
      clipboard.update({
        [action]: {
          items: [id, ...selectedDocs.filter(dId => dId !== id)],
          parent: resource.parentId,
        },
      })
    },
    [clipboard.state, id, resource, selectedDocs],
  )

  const handleContextMenuOpen = useCallback(
    e => {
      e.preventDefault()
      e.stopPropagation()
      !selectedDocs.includes(id) && setSelectedDocs(p => [...p, id])

      const avaiableActions = {
        default: true,
        open: !isActive,
        rename: !isRoot && !isSystem,
        copy: !isRoot && !isSystem,
        cut: !isRoot && !isSystem && !isActive && !currentDocIsDescendant,
        delete: !isRoot && !isActive && !currentDocIsDescendant && !isSystem,
        paste: canPaste,
        'add to favorites': !isRoot && !isSystem,
        share: !isRoot && !isSystem,
      }

      const actions = {
        open: () => openResource(resource),
        delete: () => confirmDelete(resource),
        rename: () => rename.update({ id, title }),
        'add to favorites': () => addToFavs(id),
        copy: () => handleCutCopy('copy'),
        cut: () => handleCutCopy('cut'),
        paste: () => {
          const [action] = Object.keys(clipboard.state)
          console.log({ action })
          pasteResources({
            variables: {
              parentId: id,
              resourceIds: clipboard.state[action].items,
              action,
            },
          })
          clipboard.reset()
        },
        default: () => {},
      }

      const buildOption = optionName => {
        const option = {
          label: LABELS[optionName] || optionName,
          action: actions[optionName] || (() => {}),
        }

        const includeOption = switchOn(optionName, avaiableActions)
        return includeOption && option
      }

      const options = resource.templateId
        ? TEMPLATE_MENU_OPTIONS
        : NORMAL_MENU_OPTIONS

      const items = options.map(buildOption).filter(Boolean)
      const { clientX: x, clientY: y } = e

      contextualMenu.update({ items, x, y, show: true })
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
      canPaste,
      pasteResources,
      selectedDocs,
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
      if (img?.medium) {
        const figure = document.createElement('figure')
        figure.innerHTML = `<img src="${img.medium}" alt="${img.alt}"/><figcaption>${img?.alt}</figcaption>`
        e.dataTransfer.setDragImage(figure, 0, 0)
        e.dataTransfer.setData('text/html', figure.outerHTML)
      } else e.dataTransfer.setData('text/plain', JSON.stringify(resource))
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

  const iconSearch = isSystem ? title : resourceType

  const ResourceIcon = useMemo(
    () =>
      switchOn(iconSearch, {
        ...objIf(isSystem, SYSTEM_FOLDER_ICONS_MAP),
        image: StyledImage,
        default: isFolder ? FolderIcon : FileIcon,
      }),
    [iconSearch],
  )

  const svgFill = switchOn(resourceType, ICON_COLORS)
  const Container = switchOn(view, VIEW_BASED_CONTAINERS)

  const onCutClipboard = clipboard.state.cut?.items?.includes(id)

  useEffect(() => {
    console.log(selectedCtx?.conversation)
    const clip = clipboard.state.cut?.items?.includes(id)

    console.log({ onCutClipboard: clip })
  }, [clipboard.state])

  return (
    <Container
      $selected={isSelected}
      $reorder={reorderMode.state}
      $active={isActive || currentDocIsDescendant}
      $folder={isFolder}
      data-contextmenu
      style={{
        '--svg-fill': svgFill,
        opacity: isActive && templateId ? 0.5 : 1,
      }}
      onClick={handleSelection}
      onDoubleClick={handleOpen}
      onContextMenu={handleContextMenuOpen}
      draggable={allowDnD}
      onDragStart={handleDragStart}
      onDrop={isFolder && !reorderMode.state ? handleDrop : null}
      onDragOver={isFolder ? handleDragOver : null}
      title={
        isActive && templateId
          ? 'Current document template:\n Edit in template editor from the left menu'
          : title
      }
      {...rest}
    >
      <IconTitleContainer data-contextmenu $ghost={onCutClipboard}>
        <FlexRow>
          <ResourceIcon
            src={img?.small ?? null}
            data-contextmenu
            style={{ pointerEvents: 'none' }}
          />
        </FlexRow>
        <TitleLabel $selected={isSelected}>
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
            <p>{title}</p>
          )}
        </TitleLabel>
      </IconTitleContainer>
    </Container>
  )
}

export default Resource
