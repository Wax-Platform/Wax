import { gql } from '@apollo/client'

export const GET_USER_TEMPLATES = gql`
  query GetUserTemplates {
    getUserTemplates {
      id
      userId
      docId
      fileId
      displayName
      category
      meta
      status
      rawCss
      isForked
      imageUrl
    }
  }
`

export const CREATE_TEMPLATE = gql`
  mutation CreateTemplate($input: CreateTemplateInput!) {
    createTemplate(input: $input)
  }
`

export const UPDATE_TEMPLATE_CSS = gql`
  mutation UpdateTemplateCss($id: ID!, $rawCss: String!, $displayName: String) {
    updateTemplateCss(id: $id, rawCss: $rawCss, displayName: $displayName)
  }
`

export const DELETE_TEMPLATE = gql`
  mutation DeleteTemplate($id: ID!) {
    deleteTemplate(id: $id)
  }
`

export const RENAME_TEMPLATE = gql`
  mutation RenameTemplate($id: ID!, $displayName: String!) {
    renameTemplate(id: $id, displayName: $displayName)
  }
`
