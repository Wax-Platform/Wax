import { gql } from '@apollo/client'

const GET_BOOK = gql`
  query GetBook($id: ID!) {
    getBook(id: $id) {
      id
      title
    }
  }
`

const GET_ENTIRE_BOOK = gql`
  query GetBook($id: ID!) {
    getBook(id: $id) {
      id
      title
      subtitle
      podMetadata {
        authors
        bottomPage
        copyrightLicense
        isbns {
          label
          isbn
        }
        licenseTypes {
          NC
          SA
          ND
        }
        ncCopyrightHolder
        ncCopyrightYear
        publicDomainType
        saCopyrightHolder
        saCopyrightYear
        topPage
      }
      divisions {
        id
        label
        bookComponents {
          id
          title
          divisionId
          content
          componentType
          trackChangesEnabled
          uploading
          status
          lock {
            userId
            created
            givenNames
            tabId
            foreignId
            isAdmin
            surname
            id
          }
          parentComponentId
        }
      }
      bookSettings {
        aiOn
        aiPdfDesignerOn
        customPrompts
        freeTextPromptsOn
        customPromptsOn
        knowledgeBaseOn
        customTags
        configurableEditorOn
        configurableEditorConfig
      }
      cover {
        coverUrl
        altText
      }
    }
  }
`

const GET_BOOKS = gql`
  query GetBooks($options: BookPageInput!) {
    getBooks(options: $options) {
      result {
        id
        archived
        title
        cover {
          coverUrl
        }
        # thumbnailURL
      }
      totalCount
    }
  }
`

const GET_BOOK_SETTINGS = gql`
  query GetBook($id: ID!) {
    getBook(id: $id) {
      id
      bookSettings {
        aiOn
        aiPdfDesignerOn
        id
        customPrompts
        freeTextPromptsOn
        customPromptsOn
        knowledgeBaseOn
        customTags
        configurableEditorOn
        configurableEditorConfig
      }
    }
  }
`

const GET_BOOK_WEB_PUBLISH_INFO = gql`
  query GetBook($id: ID!) {
    getBook(id: $id) {
      webPublishInfo {
        published
        # firstPublished
        lastUpdated
        publicUrl
        profileId
      }
    }
  }
`

const CREATE_BOOK = gql`
  mutation CreateBook($input: CreateBookInput!) {
    createBook(input: $input) {
      book {
        id
        title
        divisions {
          id
          bookComponents {
            id
          }
        }
      }
      newUserTeam {
        id
        objectId
        role
        global
        members {
          id
          user {
            id
          }
          status
        }
      }
    }
  }
`

const DELETE_BOOK = gql`
  mutation DeleteBook($id: ID!) {
    deleteBook(id: $id) {
      id
      collectionId
    }
  }
`

const RENAME_BOOK = gql`
  mutation RenameBook($id: ID!, $title: String!) {
    renameBook(id: $id, title: $title) {
      id
    }
  }
`

const UPDATE_SETTINGS = gql`
  mutation UpdateBookSettings(
    $bookId: ID!
    $aiOn: Boolean
    $aiPdfDesignerOn: Boolean
    $freeTextPromptsOn: Boolean
    $customPrompts: [String]
    $customPromptsOn: Boolean
    $knowledgeBaseOn: Boolean
    $customTags: [String]
    $configurableEditorOn: Boolean
    $configurableEditorConfig: [String]
  ) {
    updateBookSettings(
      bookId: $bookId
      settings: {
        aiOn: $aiOn
        aiPdfDesignerOn: $aiPdfDesignerOn
        freeTextPromptsOn: $freeTextPromptsOn
        customPrompts: $customPrompts
        customPromptsOn: $customPromptsOn
        knowledgeBaseOn: $knowledgeBaseOn
        customTags: $customTags
        configurableEditorOn: $configurableEditorOn
        configurableEditorConfig: $configurableEditorConfig
      }
    ) {
      aiOn
      aiPdfDesignerOn
      knowledgeBaseOn
      customTags
      configurableEditorOn
      configurableEditorConfig
      id
      customPrompts
      freeTextPromptsOn
      customPromptsOn
    }
  }
`

const UPDATE_SUBTITLE = gql`
  mutation UpdateSubtitle($id: ID!, $subtitle: String!) {
    updateSubtitle(id: $id, subtitle: $subtitle) {
      id
    }
  }
`

const ARCHIVE_BOOK = gql`
  mutation ArchiveBook($id: ID!, $archive: Boolean!) {
    archiveBook(id: $id, archive: $archive) {
      id
    }
  }
`

const INGEST_WORD_FILES = gql`
  mutation IngestWordFiles($bookComponentFiles: [IngestWordFiles!]) {
    ingestWordFile(bookComponentFiles: $bookComponentFiles) {
      id
      title
      divisionId
      content
      componentType
      trackChangesEnabled
      uploading
      status
      lock {
        userId
        created
        givenNames
        tabId
        foreignId
        isAdmin
        surname
        id
      }
    }
  }
`

const UPDATE_BOOK_POD_METADATA = gql`
  mutation UpdatePODMetadata($bookId: ID!, $metadata: PODMetadataInput!) {
    updatePODMetadata(bookId: $bookId, metadata: $metadata) {
      id
      title
      podMetadata {
        authors
        bottomPage
        copyrightLicense
        isbns {
          label
          isbn
        }
        licenseTypes {
          NC
          SA
          ND
        }
        ncCopyrightHolder
        ncCopyrightYear
        publicDomainType
        saCopyrightHolder
        saCopyrightYear
        topPage
      }
      divisions {
        id
        label
        bookComponents {
          id
          title
          divisionId
          content
          componentType
          trackChangesEnabled
          uploading
          status
          lock {
            userId
            created
            givenNames
            tabId
            foreignId
            isAdmin
            surname
            id
          }
        }
      }
    }
  }
`

const UPLOAD_BOOK_THUMBNAIL = gql`
  mutation UploadBookThumbnail($id: ID!, $file: Upload) {
    uploadBookThumbnail(bookId: $id, file: $file) {
      id
      thumbnailId
      thumbnailURL
    }
  }
`

const UPLOAD_BOOK_COVER = gql`
  mutation UploadBookCover($id: ID!, $file: Upload) {
    uploadBookCover(bookId: $id, file: $file) {
      id
      cover {
        fileId
        coverUrl
      }
    }
  }
`

const UPDATE_COVER_ALT = gql`
  mutation UpdateCoverAlt($id: ID!, $coverAlt: String) {
    updateCoverAlt(bookId: $id, coverAlt: $coverAlt) {
      id
      cover {
        altText
      }
    }
  }
`

const EXPORT_BOOK = gql`
  mutation ExportBook($input: ExportBookInput!) {
    exportBook(input: $input) {
      path
      validationResult
    }
  }
`

const PUBLISH_ONLINE = gql`
  mutation PublishOnline($input: ExportBookInput!, $profileId: ID!) {
    publishOnline(input: $input, profileId: $profileId) {
      path
    }
  }
`

const UNPUBLISH_ONLINE = gql`
  mutation UnpublishOnline($bookId: ID!) {
    unpublishOnline(bookId: $bookId)
  }
`

const LOCK_BOOK_COMPONENT_POD = gql`
  mutation LockBookComponentPOD($id: ID!, $tabId: ID!, $userAgent: String!) {
    podLockBookComponent(id: $id, tabId: $tabId, userAgent: $userAgent) {
      id
      title
      subtitle
      podMetadata {
        authors
        bottomPage
        copyrightLicense
        isbns {
          label
          isbn
        }
        licenseTypes {
          NC
          SA
          ND
        }
        ncCopyrightHolder
        ncCopyrightYear
        publicDomainType
        saCopyrightHolder
        saCopyrightYear
        topPage
      }
      divisions {
        id
        label
        bookComponents {
          id
          title
          divisionId
          content
          componentType
          trackChangesEnabled
          uploading
          status
          lock {
            userId
            created
            givenNames
            tabId
            foreignId
            isAdmin
            surname
            id
          }
        }
      }
    }
  }
`

const BOOK_UPDATED_SUBSCRIPTION = gql`
  subscription BookUpdated($id: ID!) {
    bookUpdated(id: $id)
  }
`

const BOOK_CREATED_SUBSCRIPTION = gql`
  subscription BookCreated {
    bookCreated
  }
`

const BOOK_DELETED_SUBSCRIPTION = gql`
  subscription BookDeleted {
    bookDeleted
  }
`

const BOOK_RENAMED_SUBSCRIPTION = gql`
  subscription BookRenamed {
    bookRenamed
  }
`

const BOOK_SETTINGS_UPDATED_SUBSCRIPTION = gql`
  subscription BookSettingsUpdated {
    bookSettingsUpdated
  }
`

export {
  GET_BOOK,
  GET_ENTIRE_BOOK,
  GET_BOOKS,
  GET_BOOK_SETTINGS,
  CREATE_BOOK,
  DELETE_BOOK,
  RENAME_BOOK,
  UPDATE_SETTINGS,
  UPDATE_SUBTITLE,
  ARCHIVE_BOOK,
  INGEST_WORD_FILES,
  UPDATE_BOOK_POD_METADATA,
  UPLOAD_BOOK_THUMBNAIL,
  EXPORT_BOOK,
  LOCK_BOOK_COMPONENT_POD,
  BOOK_UPDATED_SUBSCRIPTION,
  BOOK_CREATED_SUBSCRIPTION,
  BOOK_DELETED_SUBSCRIPTION,
  BOOK_RENAMED_SUBSCRIPTION,
  BOOK_SETTINGS_UPDATED_SUBSCRIPTION,
  PUBLISH_ONLINE,
  UNPUBLISH_ONLINE,
  GET_BOOK_WEB_PUBLISH_INFO,
  UPLOAD_BOOK_COVER,
  UPDATE_COVER_ALT,
}
