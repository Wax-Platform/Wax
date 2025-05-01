import { gql } from '@apollo/client'

export const GET_TREE_MANAGER_AND_SHARED_DOCS = gql`
  query getDocTree($folderId: ID) {
    getDocTree(folderId: $folderId)
    getSharedDocTree {
      id
      key
      title
      isFolder
      bookComponent {
        id
      }
      bookComponentId
      children {
        id
        key
        title
        isFolder
        bookComponent {
          id
        }
        bookComponentId
      }
    }
  }
`

export const ADD_RESOURCE = gql`
  mutation addResource(
    $id: ID
    $bookId: ID
    $divisionId: ID
    $isFolder: Boolean!
  ) {
    addResource(
      id: $id
      bookId: $bookId
      divisionId: $divisionId
      isFolder: $isFolder
    ) {
      id
      title
      bookComponentId
      bookComponent {
        id
      }
    }
  }
`

export const RENAME_RESOURCE = gql`
  mutation renameResource($id: ID!, $title: String!, $lockRename: Boolean) {
    renameResource(id: $id, title: $title, lockRename: $lockRename) {
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
