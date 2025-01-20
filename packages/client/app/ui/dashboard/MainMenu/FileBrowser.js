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
  AppstoreAddOutlined,
  FileAddOutlined,
  FolderAddOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'

const FilesWrapper = styled.div`
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
  min-width: 25dvw;
  overflow-x: clip;
  overflow-y: auto;
  padding: 0;
  transition: all 0.3s;
  z-index: 999;
`

const GridView = styled.div`
  background: #fff0;
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  height: fit-content;
  padding: 10px 0;
  transition: all 0.3s;
  width: 25dvw;
  z-index: 999;
`
const Loader = styled.div`
  align-items: center;
  background: #fff0;
  display: flex;
  filter: blur(5px);
  height: 100%;
  justify-content: center;
  position: absolute;
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
  text-align: center;
  width: 100%;
`

const Files = props => {
  const { layout } = useAiDesignerContext()
  const {
    graphQL,
    resourcesInFolder = [],
    loadingResource,
    contextualMenu,
    createResource,
  } = useDocumentContext()
  const { reorderResource, deleteResource } = graphQL ?? {}
  const [resourceToDelete, setResourceToDelete] = useState(null)
  const [view, setView] = useState('grid')
  const hasResources = resourcesInFolder.length > 0

  const View = view === 'grid' ? GridView : Fragment

  const onResourceDrop = async (draggedData, targetData) => {
    const newParentId = targetData.id
    const id = draggedData.id
    if (id === newParentId) return
    const variables = { variables: { id, newParentId } }
    reorderResource(variables)
  }

  useEffect(() => {
    loadingResource && console.log('loadingResource', loadingResource)
  }, [loadingResource])

  const resourceRender = resource => (
    <Resource
      view={view}
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
        {loadingResource && (
          <Loader>
            <p>Loading resource...</p>
          </Loader>
        )}
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
          <FolderAddOutlined />
          <span>New Folder</span>
        </Fragment>
      ),
      action: createResource('dir'),
    },
    {
      label: (
        <Fragment>
          <FileAddOutlined />
          <span>New File</span>
        </Fragment>
      ),
      action: createResource('doc'),
    },
    { label: '-' },
    {
      label: (
        <Fragment>
          <AppstoreAddOutlined />
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
