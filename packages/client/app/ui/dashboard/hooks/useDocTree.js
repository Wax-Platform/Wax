import { useQuery, useMutation } from '@apollo/client'
import {
  GET_TREE_MANAGER_AND_SHARED_DOCS,
  ADD_RESOURCE,
  RENAME_RESOURCE,
  DELETE_RESOURCE,
  REORDER_RESOURCE,
} from '../../../graphql'
import { useDocumentContext } from './DocumentContext'
import { cloneDeep } from 'lodash'

export const useDocTree = () => {
  const { setDocTree, setSharedDocTree } = useDocumentContext()
  const { refetch: getDocTreeData } = useQuery(GET_TREE_MANAGER_AND_SHARED_DOCS)

  const onCompleted = async () => {
    const { data } = await getDocTreeData()
    const allData = JSON.parse(data.getDocTree)
    allData[0].isRoot = true
    setDocTree([...allData])

    const sharedData = cloneDeep(data.getSharedDocTree)
    sharedData[0].isRoot = true

    setSharedDocTree([...sharedData])
  }

  const [addResource] = useMutation(ADD_RESOURCE, { onCompleted })
  const [renameResource] = useMutation(RENAME_RESOURCE, { onCompleted })
  const [deleteResource] = useMutation(DELETE_RESOURCE, { onCompleted })
  const [reorderResource] = useMutation(REORDER_RESOURCE, { onCompleted })

  return {
    getDocTreeData,
    addResource,
    renameResource,
    deleteResource,
    reorderResource,
  }
}
