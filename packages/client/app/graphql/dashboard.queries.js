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

export const GET_RESOURCE = gql`
  query GetResource($id: ID!) {
    getResource(id: $id) {
      id
      title
      parentId
      identifier
      children
      isFolder
    }
  }
`

export const GET_PARENT_FOLDER_BY_IDENTIFIER_QUERY = gql`
  query GetParentFolderByIdentifier($identifier: String!) {
    getParentFolderByIdentifier(identifier: $identifier) {
      id
      title
      parentId
      children {
        id
        title
        parentId
        children
        isFolder
      }
      isFolder
    }
  }
`

export const OPEN_FOLDER = gql`
  query OpenFolder($id: ID, $idType: String) {
    openFolder(id: $id, idType: $idType) {
      path {
        title
        id
      }
      currentFolder {
        id
        title
        key
        parentId
        children {
          id
          title
          key
          parentId
          doc {
            id
            identifier
          }
          isFolder
        }
        isFolder
      }
    }
  }
`

export const OPEN_ROOT_FOLDER = gql`
  query OpenRootFolder {
    openRootFolder {
      path {
        title
        id
      }
      currentFolder {
        id
        title
        key
        parentId
        children {
          id
          title
          key
          parentId
          doc {
            id
            identifier
          }
          isFolder
        }
        isFolder
      }
    }
  }
`

export const ADD_RESOURCE = gql`
  mutation addResource($id: ID, $isFolder: Boolean!) {
    addResource(id: $id, isFolder: $isFolder) {
      id
      identifier
      title
      parentId
    }
  }
`

export const RENAME_RESOURCE = gql`
  mutation renameResource($id: ID!, $title: String!) {
    renameResource(id: $id, title: $title) {
      folderId
    }
  }
`

export const DELETE_RESOURCE = gql`
  mutation deleteResource($id: ID!) {
    deleteResource(id: $id) {
      folderId
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
      folderId
    }
  }
`

export const MOVE_RESOURCE = gql`
  mutation moveResource($id: ID!, $newParentId: ID!) {
    moveResource(id: $id, newParentId: $newParentId) {
      folderId
    }
  }
`
