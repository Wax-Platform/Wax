import { gql } from '@apollo/client'

export const CREATE_DOCUMENT = gql`
  mutation CreateDocument($file: Upload!) {
    createDocument(file: $file) {
      id
    }
  }
`
export const GET_DOCUMENTS = gql`
  query GetDocuments {
    getDocuments {
      id
      name
      extension
      sectionsKeys
    }
  }
`
export const DELETE_DOCUMENT = gql`
  mutation DeleteFolder($id: ID!) {
    deleteFolder(id: $id)
  }
`

export const GET_FILES_FROM_DOCUMENT = gql`
  query GetFilesFromDocument($id: ID!, $start: Int, $length: Int) {
    getFilesFromDocument(id: $id, start: $start, length: $length)
  }
`
