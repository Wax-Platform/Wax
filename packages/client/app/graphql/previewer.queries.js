import { gql } from '@apollo/client'

const GET_PAGED_PREVIEWER_LINK = gql`
  query GetPagedPreviewerLink(
    $hash: String!
    $previewerOptions: PagedPreviewerOptions
  ) {
    getPagedPreviewerLink(hash: $hash, previewerOptions: $previewerOptions) {
      link
    }
  }
`

const UPDATE_PREVIEWER_PARAMETERS = gql`
  mutation UpdatePreviewerParameters($input: updateParametersInput!) {
    updatePreviewerParameters(input: $input) {
      id
    }
  }
`

const GET_EXPORT_PROFILES = gql`
  query GetExportProfiles($bookId: ID!) {
    getBookExportProfiles(bookId: $bookId) {
      result {
        id
        updated
        displayName
        format
        includedComponents {
          copyright
          titlePage
          toc
          cover
        }
        providerInfo {
          providerLabel
          externalProjectId
          inSync
          lastSync
        }
        templateId
        trimSize
        isbn
        downloadableAssets {
          pdf
          epub
          pdfProfileId
          epubProfileId
        }
        runningBlocks {
          customHeader
          customFooter
        }
      }
    }
  }
`

const CREATE_EXPORT_PROFILE = gql`
  mutation CreateExportProfile($input: CreateExportProfileInput!) {
    createExportProfile(input: $input) {
      id
      bookId
      displayName
      format
      includedComponents {
        copyright
        titlePage
        toc
        cover
      }
      providerInfo {
        providerLabel
        externalProjectId
        inSync
        lastSync
      }
      templateId
      trimSize
      isbn
      downloadableAssets {
        pdf
        epub
        pdfProfileId
        epubProfileId
      }
      runningBlocks {
        customHeader
        customFooter
      }
    }
  }
`

const DELETE_EXPORT_PROFILE = gql`
  mutation DeleteExportProfile($id: ID!) {
    deleteExportProfile(id: $id)
  }
`

const RENAME_EXPORT_PROFILE = gql`
  mutation RenameExportProfile($id: ID!, $displayName: String!) {
    updateExportProfile(id: $id, data: { displayName: $displayName }) {
      id
      displayName
    }
  }
`

const UPDATE_EXPORT_PROFILE_OPTIONS = gql`
  mutation UpdateExportProfileOptions(
    $id: ID!
    $input: UpdateExportProfileInput!
  ) {
    updateExportProfile(id: $id, data: $input) {
      id
      format
      includedComponents {
        copyright
        titlePage
        toc
        cover
      }
      providerInfo {
        providerLabel
        externalProjectId
        inSync
        lastSync
      }
      templateId
      trimSize
      isbn
    }
  }
`

const GET_BOOK_COMPONENT_IDS = gql`
  query GetBookComponentIds($bookId: ID!) {
    getBook(id: $bookId) {
      id
      divisions {
        id
        label
        bookComponents {
          id
        }
      }
      podMetadata {
        isbns {
          isbn
          label
        }
      }
      cover {
        coverUrl
      }
    }
  }
`

const UPLOAD_TO_LULU = gql`
  mutation UploadToLulu($id: ID!) {
    uploadToLulu(id: $id) {
      id
      providerInfo {
        providerLabel
        externalProjectId
        inSync
        lastSync
      }
    }
  }
`

export {
  CREATE_EXPORT_PROFILE,
  DELETE_EXPORT_PROFILE,
  GET_BOOK_COMPONENT_IDS,
  GET_EXPORT_PROFILES,
  GET_PAGED_PREVIEWER_LINK,
  RENAME_EXPORT_PROFILE,
  UPDATE_EXPORT_PROFILE_OPTIONS,
  UPDATE_PREVIEWER_PARAMETERS,
  UPLOAD_TO_LULU,
}
