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

export const GET_TEMPLATE = gql`
  query GetTemplate($id: ID!) {
    getTemplate(id: $id) {
      id
      userId
      displayName
      category
      meta
      status
      rawCss
    }
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

export const FETCH_AND_CREATE_TEMPLATE_FROM_URL = gql`
  mutation FetchAndCreateTemplateFromUrl($url: String!) {
    fetchAndCreateTemplateFromUrl(url: $url)
  }
`
export const GET_USER_SNIPPETS = gql`
  query GetUserSnippets {
    getUserSnippets {
      id
      classBody
      className
      displayName
      description
      meta
    }
  }
`

export const CHECK_IF_USER_TEMPLATES_EXIST = gql`
  mutation CheckIfUserTemplatesExist {
    checkIfUserTemplatesExist
  }
`
