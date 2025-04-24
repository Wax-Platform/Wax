import { gql } from '@apollo/client'

const SEND_INVITATIONS = gql`
  mutation SendInvitations(
    $teamId: ID!
    $bookComponentId: ID!
    $members: [String]!
    $status: String!
  ) {
    sendInvitations(
      teamId: $teamId
      bookComponentId: $bookComponentId
      members: $members
      status: $status
    ) {
      role
      members {
        status
        user {
          displayName
          email
        }
      }
    }
  }
`

const HANDLE_INVITATION = gql`
  mutation HandleInvitation($token: String!) {
    handleInvitation(token: $token)
  }
`

const GET_INVITATIONS = gql`
  query GetInvitations($bookComponentId: ID!) {
    getInvitations(bookComponentId: $bookComponentId) {
      role
      members {
        status
        user {
          displayName
          email
        }
      }
    }
  }
`

const DELETE_INVITATION = gql`
  mutation DeleteInvitation($bookComponentId: ID!, $email: String!) {
    deleteInvitation(bookComponentId: $bookComponentId, email: $email) {
      role
      members {
        status
        user {
          displayName
          email
        }
      }
    }
  }
`

const UPDATE_INVITATION = gql`
  mutation UpdateInvitation(
    $bookComponentId: ID!
    $email: String!
    $status: String!
  ) {
    updateInvitation(
      bookComponentId: $bookComponentId
      status: $status
      email: $email
    ) {
      role
      members {
        status
        user {
          displayName
          email
        }
      }
    }
  }
`

export {
  SEND_INVITATIONS,
  HANDLE_INVITATION,
  GET_INVITATIONS,
  DELETE_INVITATION,
  UPDATE_INVITATION,
}
