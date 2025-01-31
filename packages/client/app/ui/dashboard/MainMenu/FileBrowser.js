/* stylelint-disable string-quotes */
/* stylelint-disable no-descending-specificity */
/* stylelint-disable declaration-no-important */
import React, { Fragment, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useAiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
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
import { useBool, useString } from '../../../hooks/dataTypeHooks'
import { objIf, switchOn } from '../../../shared/generalUtils'
import { labelRender, typeFlags } from './utils/resourcesUtils'
import { TemplateManager } from '../../component-ai-assistant/components/CodeEditor'
import { SpinnerWrapper } from '../../wax/PmEditor'
import { Result, Spin } from '../../common'

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
  const { layout } = useAiDesignerContext()
  const {
    graphQL,
    resourcesInFolder = [],
    contextualMenu,
    createResource,
    resources = [],
    currentFolder,
    setResources,
  } = useDocumentContext()
  const draggedItemRef = useRef(null)
  const dragOverItemRef = useRef(null)
  const { moveResource, reorderChildren, deleteResource, loadingFolder } =
    graphQL ?? {}
  const [resourceToDelete, setResourceToDelete] = useState(null)
  const reorderMode = useBool({ start: false })
  const [dragging, setDragging] = useState(false)

  const fileExplorerView = useString({ start: 'grid' })
  const hasResources = resourcesInFolder.length > 0

  const FileDisplayView = fileExplorerView.is('grid') ? GridView : Fragment

  const onDragStart = (e, index) => {
    draggedItemRef.current = index
    setDragging(true)
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
    setDragging(false)
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
      view={fileExplorerView.state}
      reorderMode={reorderMode}
      onResourceDrop={onResourceDrop}
      resource={resource}
      confirmDelete={setResourceToDelete}
      isDragging={dragging && draggedItemRef.current === i}
      index={i}
      {...objIf(reorderMode.state, {
        onDragStart: e => onDragStart(e, i),
        onDragEnter: () => onDragEnter(i),
        onDragEnd,
      })}
    />
  )
  const isTemplatesFolder =
    currentFolder?.title === 'Templates' &&
    currentFolder?.resourceType === 'sys'

  return (
    <FilesWrapper
      expand={layout.userMenu}
      onClick={() => contextualMenu.update({ show: false })}
      onContextMenu={e => {
        if (isTemplatesFolder) return
        e.preventDefault()
        contextualMenu.update({
          show: true,
          x: e.clientX,
          y: e.clientY,
          items: generateContextMenuItems(
            createResource,
            fileExplorerView,
            reorderMode,
            currentFolder.resourceType,
          ),
        })
      }}
      $showRightBorder={layout.chat}
      onScroll={() => contextualMenu.update({ show: false })}
      {...props}
    >
      <SpinnerWrapper
        style={{ background: '#fff0' }}
        showSpinner={loadingFolder}
      >
        <Loader>Loading resource...</Loader>
      </SpinnerWrapper>
      <FileDisplayView>
        {!isTemplatesFolder ? (
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
        ) : (
          <TemplateManager />
        )}
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

function generateContextMenuItems(
  createResource,
  folderView,
  reorderMode,
  resourceType,
) {
  const { isRoot } = typeFlags(resourceType)
  const optionValidations = {
    newFolder: !isRoot,
    newFile: !isRoot,
    sort: !reorderMode.state,
    move: !!reorderMode.state,
    gridView: folderView.is('list'),
    listView: folderView.is('grid'),
    default: true,
  }

  const actions = {
    newFolder: createResource('dir'),
    newFile: createResource('doc'),
    gridView: () => folderView.set('grid'),
    listView: () => folderView.set('list'),
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
