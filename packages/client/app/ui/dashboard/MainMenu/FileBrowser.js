/* stylelint-disable string-quotes */
/* stylelint-disable no-descending-specificity */
/* stylelint-disable declaration-no-important */
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import styled from 'styled-components'
import { useDocumentContext } from '../hooks/DocumentContext'
import Resource from './Resource'
import ConfirmDelete from '../../modals/ConfirmDelete'
import Each from '../../component-ai-assistant/utils/Each'
import {
  AppstoreFilled,
  FileAddFilled,
  FolderAddFilled,
  SwapOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { useBool, useNumber, useString } from '../../../hooks/dataTypeHooks'
import { objIf, switchOn } from '../../../shared/generalUtils'
import { labelRender, typeFlags } from './utils/resourcesUtils'
import { useCreateTemplate } from '../../component-ai-assistant/components/CodeEditor'
import { SpinnerWrapper } from '../../wax/PmEditor'
import {
  useCreateDoc,
  useCreateFolder,
  useCreateSnippet,
} from '../../component-ai-assistant/SnippetsManager'
import { useLayout } from '../../../hooks/LayoutContext'
import { FileSelectionBox } from './FileSelectionBox'

const FilesWrapper = styled.div`
  --container-size: 26.5dvw;

  align-items: center;
  background: #fff0;
  border-right: ${p =>
    p.$showRightBorder
      ? '1px solid var(--color-trois-alpha)'
      : '1px solid #fff0'};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 26.5dvw;
  overflow-x: clip;
  overflow-y: auto;
  padding: 0 0 50px;
  position: relative;
  transition: all 0.3s;
  width: calc(var(--container-size) + 6px);
  z-index: 999;

  &:focus {
    outline: none;
  }
`

const GridView = styled.div`
  background: #fff0;
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  height: fit-content;
  padding: 10px 0 50px;
  transition: all 0.3s;
  width: 100%;
  z-index: 999;
`

const NoResources = styled.div`
  align-items: center;
  background: #fff0;
  color: var(--color-trois-opaque);
  display: flex;
  font-size: 14px;
  justify-content: center;
  padding-top: 20px;
  text-align: center;
  user-select: none;
  width: 100%;
`
const Loader = styled.p`
  color: var(--color-trois-opaque);
  text-align: center;
  user-select: none;
`

const Files = props => {
  const {
    graphQL,
    resourcesInFolder = [],
    contextualMenu,
    resources = [],
    currentFolder,
    setResources,
  } = useDocumentContext()

  const { userMenuOpen } = useLayout()
  const containerRef = useRef(null)

  const { handleCreateTemplate } = useCreateTemplate()
  const handleCreateSnippet = useCreateSnippet()
  const handleCreateDoc = useCreateDoc()
  const handleCreateFolder = useCreateFolder()
  const draggedItemRef = useRef(null)
  const dragOverItemRef = useRef(null)
  const { moveResource, reorderChildren, deleteResource, loadingFolder } =
    graphQL ?? {}
  const [resourceToDelete, setResourceToDelete] = useState(null)
  const reorderMode = useBool({ start: false })
  const isDragging = useBool({ start: false })

  const fileExplorerView = useString({ start: 'grid' })
  const gridSize = useNumber({ start: 5 })
  const hasResources = resourcesInFolder.length > 0

  const FileDisplayView = fileExplorerView.is('grid') ? GridView : Fragment

  const onDragStart = (e, index) => {
    draggedItemRef.current = index
    isDragging.on()
    const img = new Image()
    img.src =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/axp9WkAAAAASUVORK5CYII='
    e.dataTransfer.setDragImage(img, 0, 0)
  }

  const onDragEnter = index => {
    dragOverItemRef.current = index
    const newItems = [...resources]
    const draggedItem = newItems[draggedItemRef.current]
    newItems.splice(draggedItemRef.current, 1)
    newItems.splice(dragOverItemRef.current, 0, draggedItem)
    draggedItemRef.current = dragOverItemRef.current
    dragOverItemRef.current = null
    setResources(newItems)
  }

  const onDragEnd = () => {
    isDragging.off()
    draggedItemRef.current = null
    dragOverItemRef.current = null
    reorderChildren({
      variables: {
        parentId: currentFolder.id,
        newChildrenIds: resources.map(r => r.id),
      },
    })
  }

  const onResourceDrop = async (draggedData, targetData) => {
    const newParentId = targetData.id
    const id = draggedData.id
    if (id === newParentId) return
    const variables = { variables: { id, newParentId } }
    moveResource(variables)
  }

  const resourceRender = (resource, i) => (
    <Resource
      gridSize={gridSize.state}
      view={fileExplorerView.state}
      reorderMode={reorderMode}
      onResourceDrop={onResourceDrop}
      resource={resource}
      confirmDelete={setResourceToDelete}
      isDragging={isDragging.state && draggedItemRef.current === i}
      index={i}
      {...objIf(reorderMode.state, {
        onDragStart: e => onDragStart(e, i),
        onDragEnter: () => onDragEnter(i),
        onDragEnd,
      })}
    />
  )

  const handleContextMenu = e => {
    e.preventDefault()
    contextualMenu.update({
      show: true,
      x: e.clientX,
      y: e.clientY,
      items: [
        ...generateContextMenuItems({
          fileExplorerView,
          reorderMode,
          currentFolder,
          handleCreateDoc,
          handleCreateFolder,
          handleCreateTemplate,
          handleCreateSnippet,
        }),
        {
          label: 'Grid size',
          items: Array.from({ length: 10 }, (_, i) => i + 1).map(i => ({
            label: `${i + 1}x`,
            action: () => gridSize.set(i + 1),
          })),
        },
      ],
    })
  }

  return (
    <FilesWrapper
      tabIndex={0}
      ref={containerRef}
      expand={userMenuOpen}
      onClick={e => {
        contextualMenu.state.show && contextualMenu.update({ show: false })
      }}
      onContextMenu={handleContextMenu}
      onScroll={() => contextualMenu.update({ show: false })}
      {...props}
    >
      <FileSelectionBox containerRef={containerRef} />
      <SpinnerWrapper
        style={{ background: '#fff0' }}
        showSpinner={loadingFolder}
      >
        <Loader>Loading resource...</Loader>
      </SpinnerWrapper>
      <FileDisplayView>
        <Each
          of={resources}
          as={resourceRender}
          if={hasResources}
          or={
            <NoResources>
              <span>-- Folder is empty --</span>
            </NoResources>
          }
        />
      </FileDisplayView>
      <ConfirmDelete
        deleteResourceFn={deleteResource}
        deleteResourceRow={resourceToDelete}
        setDeleteResourceRow={setResourceToDelete}
      />
    </FilesWrapper>
  )
}

export default Files

const CONTEXT_MENU_OPTIONS = [
  'newFolder',
  'newFile',
  '-',
  'gridView',
  'listView',
  'sort',
  'move',
]

const CONTEXT_MENU_RENDER = {
  newFolder: labelRender(<FolderAddFilled />, 'New Folder'),
  newFile: labelRender(<FileAddFilled />, 'New File'),
  '-': '-',
  gridView: labelRender(<AppstoreFilled />, 'Grid View'),
  listView: labelRender(<UnorderedListOutlined />, 'List View'),
  sort: labelRender(<SwapOutlined />, 'Sort resources'),
  move: labelRender(<SwapOutlined />, 'Move resources'),
}

function generateContextMenuItems({
  fileExplorerView,
  reorderMode,
  currentFolder,
  handleCreateDoc,
  handleCreateFolder,
  handleCreateTemplate,
  handleCreateSnippet,
}) {
  const { resourceType, extension } = currentFolder
  const { isRoot, isSystem } = typeFlags(resourceType)
  const notTemplatesDir =
    !isSystem || !['templates', 'snip'].includes(extension)

  const optionValidations = {
    newFolder: !isRoot && notTemplatesDir,
    newFile: !isRoot && notTemplatesDir,
    sort: !reorderMode.state,
    move: !!reorderMode.state,
    gridView: fileExplorerView.is('list'),
    listView: fileExplorerView.is('grid'),
    default: true,
  }

  const isTemplate = extension === 'template'
  const isSnippet = extension === 'snip'

  const newFile = isTemplate
    ? handleCreateTemplate
    : isSnippet
    ? handleCreateSnippet
    : handleCreateDoc

  const actions = {
    newFolder: handleCreateFolder,
    newFile,
    gridView: () => fileExplorerView.set('grid'),
    listView: () => fileExplorerView.set('list'),
    sort: reorderMode.toggle,
    move: reorderMode.toggle,
    default: () => {},
  }

  const buildOption = optionName => {
    const option = {
      label: CONTEXT_MENU_RENDER[optionName],
      action: actions[optionName],
    }

    const includeOption = switchOn(optionName, optionValidations)
    return includeOption && option
  }

  return CONTEXT_MENU_OPTIONS.map(buildOption).filter(Boolean)
}
