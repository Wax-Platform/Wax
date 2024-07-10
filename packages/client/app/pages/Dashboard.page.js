import React from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Dashboard } from '../ui'
import {
  GET_TREE_MANAGER_AND_SHARED_DOCS,
  ADD_RESOURCE,
  RENAME_RESOURCE,
  DELETE_RESOURCE,
  REORDER_RESOURCE,
} from '../graphql'

const DashboardPage = ({ showFilemanager }) => {
  const { refetch: getDocTreeData } = useQuery(
    GET_TREE_MANAGER_AND_SHARED_DOCS,
    { skip: true },
  )
  const [addResource] = useMutation(ADD_RESOURCE)
  const [renameResource] = useMutation(RENAME_RESOURCE)
  const [deleteResource] = useMutation(DELETE_RESOURCE)
  const [reorderResource] = useMutation(REORDER_RESOURCE)

  return (
    <Dashboard
      showFilemanager={showFilemanager}
      deleteResource={deleteResource}
      renameResource={renameResource}
      addResource={addResource}
      reorderResource={reorderResource}
      getDocTreeData={getDocTreeData}
    />
  )
}

export default DashboardPage
