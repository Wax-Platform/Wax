/* eslint-disable import/prefer-default-export */
import { gql } from '@apollo/client'

const GET_USER_FILEMANAGER = gql`
  query GetUserFileManager($parentId: ID) {
    getUserFileManager(parentId: $parentId)
  }
`

const UPLOAD_TO_FILEMANAGER = gql`
  mutation UploadToFileManager(
    $files: [Upload!]!
    $entityId: ID
    $entityType: String
  ) {
    uploadToFileManager(
      files: $files
      entityId: $entityId
      entityType: $entityType
    ) {
      id
      url(size: medium)
    }
  }
`

const DELETE_FROM_FILEMANAGER = gql`
  mutation DeleteFromFileManager($ids: [ID!]!) {
    deleteFromFileManager(ids: $ids)
  }
`

const UPDATE_FILE_IN_FILEMANAGER = gql`
  mutation UpdateMetadataFileManager(
    $fileId: ID
    $input: FileManagerMetaDataInput
  ) {
    updateMetadataFileManager(fileId: $fileId, input: $input)
  }
`

export {
  GET_USER_FILEMANAGER,
  UPLOAD_TO_FILEMANAGER,
  DELETE_FROM_FILEMANAGER,
  UPDATE_FILE_IN_FILEMANAGER,
}
