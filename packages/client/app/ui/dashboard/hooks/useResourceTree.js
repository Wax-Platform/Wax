import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import {
  ADD_RESOURCE,
  RENAME_RESOURCE,
  DELETE_RESOURCE,
  OPEN_FOLDER,
  MOVE_RESOURCE,
  GET_DOC_PATH,
} from '../../../graphql'

import { useEffect, useState, useMemo } from 'react'
import { useCurrentUser } from '@coko/client'

export const useResourceTree = () => {
  const { currentUser } = useCurrentUser()
  const [path, setCurrentPath] = useState('')
  const [folder, setCurrentFolder] = useState({})

  const { data: openFolderData } = useQuery(OPEN_FOLDER, {
    variables: { id: null },
    fetchPolicy: 'cache-and-network',
    skip: !currentUser?.id,
  })

  const [openFolder, { data: lazyOpenFolderData, loading }] = useLazyQuery(
    OPEN_FOLDER,
    {
      fetchPolicy: 'cache-and-network',
    },
  )
  const [getCurrentDocPath, { data: currentDocPath }] = useLazyQuery(
    GET_DOC_PATH,
    {
      fetchPolicy: 'cache-and-network',
    },
  )

  const { currentFolder, path: currentPath } =
    lazyOpenFolderData?.openFolder || openFolderData?.openFolder || {}
  const { getDocPath: docPath = [] } = currentDocPath || {}

  const refetchQueries = useMemo(
    () => [
      {
        query: OPEN_FOLDER,
        variables: { id: currentFolder?.id },
      },
    ],
    [currentFolder?.id],
  )

  const [addResource] = useMutation(ADD_RESOURCE, { refetchQueries })
  const [renameResource] = useMutation(RENAME_RESOURCE, { refetchQueries })
  const [deleteResource] = useMutation(DELETE_RESOURCE, { refetchQueries })
  const [moveResource] = useMutation(MOVE_RESOURCE, { refetchQueries })

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
    getCurrentDocPath,
    docPath,
  }
}
