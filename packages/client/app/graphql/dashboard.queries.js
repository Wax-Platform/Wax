import { gql } from '@apollo/client'
import { USER_FIELDS } from './user.queries'

export const GET_DOC = gql`
  query GetDocument($identifier: String!) {
    getDocument(identifier: $identifier) {
      id
      identifier
      title
      resourceId
      templateId
      path
      owner {
        ...UserFields
      }
      sharedWith {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`

export const UPDATE_DOCUMENT_TEMPLATE = gql`
  mutation UpdateDocumentTemplate($id: ID!, $templateId: ID!) {
    updateDocumentTemplate(id: $id, templateId: $templateId)
  }
`

export const OPEN_FOLDER = gql`
  query OpenFolder($id: ID, $resourceType: String, $sysFolder: String) {
    openFolder(id: $id, resourceType: $resourceType, sysFolder: $sysFolder) {
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
            owner {
              ...UserFields
            }
            resourceId
            identifier
            templateId
            path
            sharedWith {
              ...UserFields
            }
            title
          }
          img {
            alt
            key
            small
            medium
            full
            normal
          }
          extension
          templateId
          resourceType
        }
        resourceType
        extension
      }
      requestAccessTo
    }
  }
  ${USER_FIELDS}
`

export const ADD_RESOURCE = gql`
  mutation addResource(
    $id: ID
    $resourceType: String!
    $extension: String
    $templateProps: String
    $title: String
    $base64: String
  ) {
    addResource(
      id: $id
      resourceType: $resourceType
      extension: $extension
      templateProps: $templateProps
      title: $title
      base64: $base64
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
  mutation shareResource($resourceId: ID!, $inviteeEmail: String!) {
    shareResource(resourceId: $resourceId, inviteeEmail: $inviteeEmail)
  }
`

export const UNSHARE_RESOURCE = gql`
  mutation unshareResource($resourceId: ID!, $userId: ID!) {
    unshareResource(resourceId: $resourceId, userId: $userId)
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
    $action: String!
  ) {
    pasteResources(
      parentId: $parentId
      resourceIds: $resourceIds
      action: $action
    )
  }
`

export const REORDER_CHILDREN = gql`
  mutation reorderChildren($parentId: ID!, $newChildrenIds: [ID!]!) {
    reorderChildren(parentId: $parentId, newChildrenIds: $newChildrenIds)
  }
`
