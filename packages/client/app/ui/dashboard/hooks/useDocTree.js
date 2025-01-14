import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import {
  GET_TREE_MANAGER_AND_SHARED_DOCS,
  ADD_RESOURCE,
  RENAME_RESOURCE,
  DELETE_RESOURCE,
  OPEN_FOLDER,
  OPEN_ROOT_FOLDER,
  MOVE_RESOURCE,
} from '../../../graphql'
import { useHistory } from 'react-router-dom'
import { useEffect } from 'react'
import { useCurrentUser } from '@coko/client'

export const useDocTree = ({
  currentDoc,
  setRename,
  setCurrentDoc,
  setCurrentPath,
  setCurrentFolder,
}) => {
  const history = useHistory()
  const { currentUser } = useCurrentUser()
  const onCompleted = data => {
    const [dataValues] = Object.values(data) || []
    if (!dataValues) return

    const { currentFolder: folder, path, newResource } = dataValues || {}
    const { identifier, id, title } = newResource ?? {}
    id &&
      !title &&
      setRename({ id, title: `new ${identifier ? 'document' : 'folder'}` })

    setCurrentFolder(folder)
    setCurrentPath(path)

    title && setCurrentDoc({ ...currentDoc, title })
    if (!identifier) return
    history.push(`/${identifier}`, { replace: true })
    setCurrentDoc(newResource)
  }

  const { refetch: getDocTreeData } = useQuery(
    GET_TREE_MANAGER_AND_SHARED_DOCS,
    { skip: true },
  )
  const [openFolder] = useLazyQuery(OPEN_FOLDER, { onCompleted })
  const [openRootFolder] = useLazyQuery(OPEN_ROOT_FOLDER, { onCompleted })
  const [addResource] = useMutation(ADD_RESOURCE, { onCompleted })
  const [renameResource] = useMutation(RENAME_RESOURCE, { onCompleted })
  const [deleteResource] = useMutation(DELETE_RESOURCE, { onCompleted })
  const [moveResource] = useMutation(MOVE_RESOURCE, { onCompleted })

  useEffect(() => {
    currentUser?.id && openRootFolder()
    console.log({ currentUser })
  }, [currentUser])

  return {
    openFolder,
    openRootFolder,
    getDocTreeData,
    addResource,
    renameResource,
    deleteResource,
    reorderResource: moveResource,
    moveResource,
  }
}
