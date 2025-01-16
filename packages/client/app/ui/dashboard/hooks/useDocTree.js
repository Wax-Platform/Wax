import {
  useQuery,
  useMutation,
  useLazyQuery,
  useApolloClient,
} from '@apollo/client'
import {
  GET_TREE_MANAGER_AND_SHARED_DOCS,
  ADD_RESOURCE,
  RENAME_RESOURCE,
  DELETE_RESOURCE,
  OPEN_FOLDER,
  MOVE_RESOURCE,
} from '../../../graphql'

import { useEffect, useState } from 'react'
import { useCurrentUser } from '@coko/client'

export const useDocTree = () => {
  const client = useApolloClient()
  const { currentUser } = useCurrentUser()
  const [path, setCurrentPath] = useState('')
  const [folder, setCurrentFolder] = useState({})
  const [pendingResources, setPendingResources] = useState([])

  const { refetch: getDocTreeData } = useQuery(
    GET_TREE_MANAGER_AND_SHARED_DOCS,
    { skip: true },
  )
  const [openFolder, { data: openFolderData }] = useLazyQuery(OPEN_FOLDER)
  const { currentFolder, path: currentPath } = openFolderData?.openFolder || {}
  const currentFolderNeedsRefetch = pendingResources.includes(currentFolder?.id)

  const refetchQueries = [
    {
      query: OPEN_FOLDER,
      variables: { id: currentFolder?.id },
    },
  ]

  const [addResource] = useMutation(ADD_RESOURCE, { refetchQueries })
  const [renameResource] = useMutation(RENAME_RESOURCE, { refetchQueries })
  const [deleteResource] = useMutation(DELETE_RESOURCE, { refetchQueries })
  const [moveResource] = useMutation(MOVE_RESOURCE, { refetchQueries })

  useEffect(() => {
    if (currentUser?.id) {
      openFolder()
    }
  }, [currentUser])

  useEffect(() => {
    if (currentFolder) {
      if (currentFolderNeedsRefetch) {
        client.query({
          query: OPEN_FOLDER,
          variables: { id: currentFolder.id },
          fetchPolicy: 'no-cache',
        })
        setPendingResources(
          pendingResources.filter(id => id !== currentFolder.id),
        )
      } else {
        setCurrentFolder(currentFolder)
        setCurrentPath(currentPath)
      }
    }
  }, [currentFolder])

  return {
    currentFolder: folder,
    currentPath: path,
    openFolder,
    getDocTreeData,
    addResource,
    renameResource,
    deleteResource,
    reorderResource: moveResource,
    moveResource,
    setPendingResources,
  }
}
