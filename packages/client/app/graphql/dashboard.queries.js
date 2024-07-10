import { gql } from '@apollo/client'

export const GET_TREE_MANAGER_AND_SHARED_DOCS = gql`
  query getDocTree($folderId: ID) {
    getDocTree(folderId: $folderId)
    getSharedDocTree {
      id
      key
      title
      identifier
      isFolder
      doc {
        id
        identifier
      }
      children {
        id
        key
        title
        identifier
        isFolder
        doc {
          id
          identifier
        }
      }
    }
  }
`

export const ADD_RESOURCE = gql`
  mutation addResource($id: ID, $isFolder: Boolean!) {
    addResource(id: $id, isFolder: $isFolder) {
      id
      title
    }
  }
`

export const RENAME_RESOURCE = gql`
  mutation renameResource($id: ID!, $title: String!) {
    renameResource(id: $id, title: $title) {
      id
      title
    }
  }
`

export const DELETE_RESOURCE = gql`
  mutation deleteResource($id: ID!) {
    deleteResource(id: $id) {
      id
      title
    }
  }
`

export const REORDER_RESOURCE = gql`
  mutation updateTreePosition($id: ID!, $newParentId: ID, $newPosition: Int!) {
    updateTreePosition(
      id: $id
      newParentId: $newParentId
      newPosition: $newPosition
    ) {
      id
      title
    }
  }
`
