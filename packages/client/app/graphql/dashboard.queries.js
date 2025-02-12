import { gql } from '@apollo/client'

export const GET_DOC = gql`
  query GetDocument($identifier: String!) {
    getDocument(identifier: $identifier) {
      id
      identifier
      title
      resourceId
      templateId
      path
    }
  }
`

export const UPDATE_DOCUMENT_TEMPLATE = gql`
  mutation UpdateDocumentTemplate($id: ID!, $templateId: ID!) {
    updateDocumentTemplate(id: $id, templateId: $templateId)
  }
`

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
            templateId
            path
            title
          }
          extension
          templateId
          resourceType
        }
        resourceType
        extension
        templateId
      }
      requestAccessTo
    }
  }
`

export const ADD_RESOURCE = gql`
  mutation addResource(
    $id: ID
    $resourceType: String!
    $extension: String
    $templateProps: String
    $title: String
  ) {
    addResource(
      id: $id
      resourceType: $resourceType
      extension: $extension
      templateProps: $templateProps
      title: $title
    ) {
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

export const SHARE_RESOURCE = gql`
  mutation shareResource($resourceId: ID!, $userId: ID!) {
    shareResource(resourceId: $resourceId, userId: $userId) {
      id
      title
      key
      parentId
      resourceType
    }
  }
`

export const UNSHARE_RESOURCE = gql`
  mutation unshareResource($resourceId: ID!, $userId: ID!) {
    unshareResource(resourceId: $resourceId, userId: $userId) {
      id
      title
      key
      parentId
      resourceType
    }
  }
`

export const ADD_TO_FAVORITES = gql`
  mutation addToFavorites($resourceId: ID!) {
    addToFavorites(resourceId: $resourceId) {
      id
    }
  }
`

export const PASTE_RESOURCES = gql`
  mutation pasteResources(
    $parentId: ID!
    $resourceIds: [ID!]!
    $copy: Boolean!
  ) {
    pasteResources(
      parentId: $parentId
      resourceIds: $resourceIds
      copy: $copy
    ) {
      id
    }
  }
`

export const REORDER_CHILDREN = gql`
  mutation reorderChildren($parentId: ID!, $newChildrenIds: [ID!]!) {
    reorderChildren(parentId: $parentId, newChildrenIds: $newChildrenIds)
  }
`
