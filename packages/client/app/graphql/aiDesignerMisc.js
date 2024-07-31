import { gql } from '@apollo/client'

export const GET_AID_MISC_BY_ID = gql`
  query GetAidMiscById($id: ID) {
    getAidMiscById(id: $id) {
      templates {
        docId
        name
        css
      }
      snippets {
        className
        elementType
        description
        classBody
      }
    }
  }
`

export const GET_AID_MISC = gql`
  mutation GetOrCreateAidMisc($input: FindOrCreateAiDesignerMiscInput!) {
    getOrCreateAidMisc(input: $input) {
      id
      userId
      templates {
        docId
        name
        css
      }
      snippets {
        className
        elementType
        description
        classBody
      }
    }
  }
`
export const UPDATE_SNIPPETS = gql`
  mutation UpdateSnippets($snippets: [SnippetInput!]!) {
    updateSnippets(snippets: $snippets) {
      className
      elementType
      description
      classBody
    }
  }
`
export const GET_CSS = gql`
  query GetCssTemplate($name: String, $css: String, $docId: String) {
    getCssTemplate(name: $name, css: $css, docId: $docId) {
      docId
      name
      css
    }
  }
`
