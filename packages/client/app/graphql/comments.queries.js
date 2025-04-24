import { gql } from '@apollo/client'

const GET_COMMENTS = gql`
  query getComments($bookId: ID!, $chapterId: ID!) {
    getChapterComments(bookId: $bookId, chapterId: $chapterId) {
      id
      bookId
      chapterId
      content
    }
  }
`

const ADD_COMMENTS = gql`
  mutation AddComments($commentData: CommentInput!) {
    addComments(commentData: $commentData) {
      id
    }
  }
`

const NOTIFY_MENTIONS = gql`
  mutation NotifyMentions($mentionsData: MentionInput!) {
    notifyMentions(mentionsData: $mentionsData)
  }
`

export { GET_COMMENTS, ADD_COMMENTS, NOTIFY_MENTIONS }
