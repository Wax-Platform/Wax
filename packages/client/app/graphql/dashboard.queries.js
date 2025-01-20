import { gql } from '@apollo/client'

export const OPEN_FOLDER = gql`
  query OpenFolder($id: ID, $resourceType: String) {
    openFolder(id: $id, resourceType: $resourceType) {
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
          resourceType
        }
        resourceType
      }
      requestAccessTo
    }
  }
`

export const ADD_RESOURCE = gql`
  mutation addResource($id: ID, $resourceType: String!) {
    addResource(id: $id, resourceType: $resourceType) {
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

export const MOVE_RESOURCE = gql`
  mutation moveResource($id: ID!, $newParentId: ID!) {
    moveResource(id: $id, newParentId: $newParentId) {
      folderId
    }
  }
`

export const GET_DOC_PATH = gql`
  query GetDocPath($id: ID!) {
    getDocPath(id: $id)
  }
`
