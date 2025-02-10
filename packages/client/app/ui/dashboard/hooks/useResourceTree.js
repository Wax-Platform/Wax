import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import {
  ADD_RESOURCE,
  RENAME_RESOURCE,
  DELETE_RESOURCE,
  OPEN_FOLDER,
  MOVE_RESOURCE,
  GET_DOC_PATH,
  SHARE_RESOURCE,
  UNSHARE_RESOURCE,
  ADD_TO_FAVORITES,
  PASTE_RESOURCES,
  REORDER_CHILDREN,
} from '../../../graphql'

import { useEffect, useState, useMemo } from 'react'
import { useCurrentUser } from '@coko/client'

export const useResourceTree = () => {
  const { currentUser } = useCurrentUser()
  const [path, setCurrentPath] = useState('')
  const [folder, setCurrentFolder] = useState({})

  const { data: openFolderData } = useQuery(OPEN_FOLDER, {
    variables: { id: null },
    fetchPolicy: 'cache-first',
    skip: !currentUser?.id,
  })

  const [openFolder, { data: lazyOpenFolderData, loading }] = useLazyQuery(
    OPEN_FOLDER,
    {
      fetchPolicy: 'cache-first',
      skip: !currentUser?.id || loading,
    },
  )

  const { currentFolder, path: currentPath } =
    lazyOpenFolderData?.openFolder || openFolderData?.openFolder || {}

  const refetchQueries = useMemo(
    () => [
      {
        query: OPEN_FOLDER,
        variables: { id: currentFolder?.id },
        fetchPolicy: 'cache-and-network',
      },
    ],
    [currentFolder?.id],
  )

  const [addResource] = useMutation(ADD_RESOURCE, { refetchQueries })
  const [renameResource] = useMutation(RENAME_RESOURCE, { refetchQueries })
  const [deleteResource] = useMutation(DELETE_RESOURCE, { refetchQueries })
  const [moveResource] = useMutation(MOVE_RESOURCE, { refetchQueries })
  const [shareResource] = useMutation(SHARE_RESOURCE, { refetchQueries })
  const [unshareResource] = useMutation(UNSHARE_RESOURCE, { refetchQueries })
  const [addToFavorites] = useMutation(ADD_TO_FAVORITES, { refetchQueries })
  const [pasteResources] = useMutation(PASTE_RESOURCES, { refetchQueries })
  const [reorderChildren] = useMutation(REORDER_CHILDREN, { refetchQueries })

  useEffect(() => {
    if (!loading && currentFolder?.id) {
      setCurrentFolder(currentFolder)
      setCurrentPath(currentPath)
    }
  }, [JSON.stringify(currentFolder?.children), loading])

  return {
    currentFolder: folder,
    setCurrentFolder,
    currentPath: path,
    openFolder,
    addResource,
    renameResource,
    deleteResource,
    moveResource,
    shareResource,
    unshareResource,
    addToFavorites,
    pasteResources,
    reorderChildren,
    loadingFolder: loading,
  }
}
