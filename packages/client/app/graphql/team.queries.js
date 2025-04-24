import { gql } from '@apollo/client'

const REMOVE_TEAM_MEMBER = gql`
  mutation RemoveTeamMember($teamId: ID!, $userId: ID!) {
    removeTeamMember(teamId: $teamId, userId: $userId) {
      id
      role
      displayName
      members {
        id
        user {
          id
          surname
          givenNames
        }
        status
      }
    }
  }
`

// const GET_BOOK_TEAMS = gql`
//   query GetBookTeams($bookId: ID!) {
//     getBookTeams(bookId: $bookId) {
//       id
//       role
//       name
//       objectId
//       members {
//         id
//         user {
//           id
//           username
//           surname
//           givenName
//           email
//           admin
//         }
//       }
//       global
//     }
//   }
// `

const ADD_TEAM_MEMBERS = gql`
  mutation AddTeamMembers(
    $teamId: ID!
    $members: [ID!]!
    $bookId: ID
    $bookComponentId: ID
    $status: String
  ) {
    addTeamMembers(
      teamId: $teamId
      members: $members
      bookId: $bookId
      bookComponentId: $bookComponentId
      status: $status
    ) {
      id
      role
      displayName
      members {
        id
        user {
          id
          surname
          givenNames
        }
        status
      }
    }
  }
`

const UPDATE_TEAM_MEMBER_STATUS = gql`
  mutation UpdateTeamMemberStatus($teamMemberId: ID!, $status: String!) {
    updateTeamMemberStatus(teamMemberId: $teamMemberId, status: $status) {
      id
      role
      displayName
      members {
        id
        user {
          id
          surname
          givenNames
        }
        status
      }
    }
  }
`

const GET_BOOK_TEAMS = gql`
  query GetObjectTeams($objectId: ID!, $objectType: String!) {
    getObjectTeams(objectId: $objectId, objectType: $objectType) {
      result {
        id
        role
        members {
          id
          status
          user {
            id
            givenNames
            displayName
            surname
          }
        }
      }
      totalCount
    }
  }
`
// const TEAM_MEMBERS_UPDATED_SUBSCRIPTION = gql`
//   subscription TeamMembersUpdated {
//     teamMembersUpdated {
//       objectId`
//     }
//   }
// `

export {
  REMOVE_TEAM_MEMBER,
  ADD_TEAM_MEMBERS,
  UPDATE_TEAM_MEMBER_STATUS,
  GET_BOOK_TEAMS,
  // TEAM_MEMBERS_UPDATED_SUBSCRIPTION,
}
