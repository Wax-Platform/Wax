import { gql } from '@apollo/client'

export const GET_SETTINGS = gql`
  query GetSettings {
    getSettings {
      gui {
        showChatBubble
        advancedTools
      }
      editor {
        displayStyles
        contentEditable
        enablePaste
        selectionColor {
          bg
          border
        }
      }
      snippetsManager {
        enableSnippets
        showCssByDefault
        createNewSnippetVersions
        markNewSnippet
        snippets {
          className
          elementType
          description
          classBody
        }
      }
      chat {
        historyMax
      }
      preview {
        livePreview
      }
    }
  }
`

export const UPDATE_SETTINGS = gql`
  mutation UpdateSettings($settings: SettingsInput!) {
    updateSettings(settings: $settings) {
      gui {
        showChatBubble
        advancedTools
      }
      editor {
        displayStyles
        contentEditable
        enablePaste
        selectionColor {
          bg
          border
        }
      }
      snippetsManager {
        enableSnippets
        showCssByDefault
        createNewSnippetVersions
        markNewSnippet
        snippets {
          className
          elementType
          description
          classBody
        }
      }
      chat {
        historyMax
      }
      preview {
        livePreview
      }
    }
  }
`
export const GET_SESSION = gql`
  query GetSessionById($id: ID!) {
    getSessionById(id: $id) {
      id
      name
      editorContent
      css
      snippets {
        className
        elementType
        description
        classBody
      }
      created
    }
  }
`
export const CREATE_SESSION = gql`
  mutation CreateSession($input: SessionInput!) {
    createSession(input: $input) {
      id
      name
      editorContent
      css
      snippets {
        className
        elementType
        description
        classBody
      }
      created
    }
  }
`
export const UPDATE_SESSION = gql`
  mutation UpdateSession($id: ID!, $input: SessionInput!) {
    updateSession(id: $id, input: $input) {
      id
      name
      editorContent
      css
      snippets {
        className
        elementType
        description
        classBody
      }
      created
    }
  }
`
export const DELETE_SESSION = gql`
  mutation DeleteSession($id: ID!) {
    deleteSession(id: $id)
  }
`
