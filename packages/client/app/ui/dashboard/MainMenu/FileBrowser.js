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
import { useBool } from '../../../hooks/dataTypeHooks'
import { objIf } from '../../../shared/generalUtils'

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
  left: 50px;
  min-width: 26.5dvw;
  overflow-x: clip;
  overflow-y: auto;
  padding: 0 0 50px;
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

const Files = props => {
  const { layout } = useAiDesignerContext()
  const {
    graphQL,
    resourcesInFolder = [],
    contextualMenu,
    createResource,
    resources = [],
    setResources,
  } = useDocumentContext()
  const draggedItemRef = useRef(null)
  const dragOverItemRef = useRef(null)
  const { moveResource, deleteResource } = graphQL ?? {}
  const [resourceToDelete, setResourceToDelete] = useState(null)
  const reorderMode = useBool({ start: false })
  const [dragging, setDragging] = useState(false)

  const [view, setView] = useState('grid')
  const hasResources = resourcesInFolder.length > 0

  const View = view === 'grid' ? GridView : Fragment

  const onDragStart = (e, index) => {
    draggedItemRef.current = index
    setDragging(true)

    // // Create a transparent image and set it as the drag image
    // const img = new Image()
    // img.src =
    //   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/axp9WkAAAAASUVORK5CYII='
    // e.dataTransfer.setDragImage(img, 0, 0)
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
      view={view}
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

  return (
    <FilesWrapper
      expand={layout.userMenu}
      onClick={() => contextualMenu.update({ show: false })}
      onContextMenu={e => {
        e.preventDefault()
        contextualMenu.update({
          show: true,
          x: e.clientX,
          y: e.clientY,
          items: generateContextMenuItems(createResource, setView, reorderMode),
        })
      }}
      $showRightBorder={layout.chat}
      onScroll={() => contextualMenu.update({ show: false })}
      {...props}
    >
      <View>
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
      </View>
      <ConfirmDelete
        deleteResourceFn={deleteResource}
        deleteResourceRow={resourceToDelete}
        setDeleteResourceRow={setResourceToDelete}
      />
    </FilesWrapper>
  )
}

export default Files

function generateContextMenuItems(createResource, setView, reorderMode) {
  return [
    {
      label: (
        <Fragment>
          <FolderAddFilled />
          <span>New Folder</span>
        </Fragment>
      ),
      action: createResource('dir'),
    },
    {
      label: (
        <Fragment>
          <FileAddFilled />
          <span>New File</span>
        </Fragment>
      ),
      action: createResource('doc'),
    },
    { label: '-' },
    {
      label: (
        <Fragment>
          <AppstoreFilled />
          <span>Grid View</span>
        </Fragment>
      ),
      action: () => setView('grid'),
    },
    {
      label: (
        <Fragment>
          <UnorderedListOutlined />
          <span>List View</span>
        </Fragment>
      ),
      action: () => setView('list'),
    },
    {
      label: (
        <Fragment>
          <SwapOutlined />
          <span>{!reorderMode.state ? 'Sort' : 'Move'} resources</span>
        </Fragment>
      ),
      action: reorderMode.toggle,
    },
  ]
}
