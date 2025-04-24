/* eslint-disable import/prefer-default-export */
import { gql } from '@apollo/client'

const UPLOAD_FILES = gql`
  mutation ($files: [Upload!]!, $entityId: ID, $entityType: String) {
    uploadFiles(files: $files, entityId: $entityId, entityType: $entityType) {
      id
      url(size: medium)
    }
  }
`

export { UPLOAD_FILES }
