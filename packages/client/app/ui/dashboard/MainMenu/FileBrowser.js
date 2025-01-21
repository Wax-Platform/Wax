/* stylelint-disable string-quotes */
/* stylelint-disable no-descending-specificity */
/* stylelint-disable declaration-no-important */
import React, { Fragment, useEffect, useState } from 'react'
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
  UnorderedListOutlined,
} from '@ant-design/icons'

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
  } = useDocumentContext()
  const { moveResource, deleteResource } = graphQL ?? {}
  const [resourceToDelete, setResourceToDelete] = useState(null)
  const [gridSize, setGridSize] = useState(8)
  const [view, setView] = useState('grid')
  const hasResources = resourcesInFolder.length > 0

  const View = view === 'grid' ? GridView : Fragment

  const onResourceDrop = async (draggedData, targetData) => {
    const newParentId = targetData.id
    const id = draggedData.id
    if (id === newParentId) return
    const variables = { variables: { id, newParentId } }
    moveResource(variables)
  }

  const resourceRender = resource => (
    <Resource
      view={view}
      gridSize={gridSize}
      onResourceDrop={onResourceDrop}
      resource={resource}
      confirmDelete={setResourceToDelete}
      isFolder={resource?.resourceType !== 'doc'}
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
          items: generateContextMenuItems(createResource, setView),
        })
      }}
      $showRightBorder={layout.chat}
      onScroll={() => contextualMenu.update({ show: false })}
      {...props}
    >
      <View>
        <Each
          of={resourcesInFolder}
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

function generateContextMenuItems(createResource, setView) {
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
  ]
}
// import React, { useState, useRef } from 'react'
// import styled from 'styled-components'

// const List = styled.ul`
//   list-style-type: none;
//   margin: 0;
//   padding: 0;
// `

// const ListItem = styled.li`
//   background-color: #f0f0f0;
//   border: 1px solid #ccc;
//   cursor: move;
//   margin: ${props => (props.isDragging ? '2px 10px' : '0')};
//   opacity: ${props => (props.isDragging ? 0.7 : 1)};
//   padding: 8px;
//   transform: ${props => (props.isDragging ? 'scale(0.98)' : 'scale(1)')};
//   transition: all 0.2s ease;
// `

// const DraggableList = () => {
//   const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3', 'Item 4'])
//   const [dragging, setDragging] = useState(false)
//   const draggedItemRef = useRef(null)
//   const dragOverItemRef = useRef(null)

//   const handleDragStart = (e, index) => {
//     draggedItemRef.current = index
//     setDragging(true)

//     // Create a transparent image and set it as the drag image
//     const img = new Image()
//     img.src =
//       'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/axp9WkAAAAASUVORK5CYII='
//     e.dataTransfer.setDragImage(img, 0, 0)
//   }

//   const handleDragEnter = index => {
//     dragOverItemRef.current = index
//     const newItems = [...items]
//     const draggedItem = newItems[draggedItemRef.current]
//     newItems.splice(draggedItemRef.current, 1)
//     newItems.splice(dragOverItemRef.current, 0, draggedItem)
//     draggedItemRef.current = dragOverItemRef.current
//     dragOverItemRef.current = null
//     setItems(newItems)
//   }

//   const handleDragEnd = () => {
//     setDragging(false)
//     draggedItemRef.current = null
//     dragOverItemRef.current = null
//   }

//   return (
//     <List>
//       {items.map((item, index) => (
//         <ListItem
//           key={index}
//           draggable
//           onDragStart={e => handleDragStart(e, index)}
//           onDragEnter={() => handleDragEnter(index)}
//           onDragEnd={handleDragEnd}
//           isDragging={dragging && draggedItemRef.current === index}
//         >
//           {item}
//         </ListItem>
//       ))}
//     </List>
//   )
// }

// export default DraggableList
