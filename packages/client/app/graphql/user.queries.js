import { gql } from '@apollo/client'

const SEARCH_USERS = gql`
  mutation SearchForUsers(
    $search: String!
    $exclude: [ID]!
    $exactMatch: Boolean
  ) {
    searchForUsers(
      search: $search
      exclude: $exclude
      exactMatch: $exactMatch
    ) {
      id
      displayName
      surname
    }
  }
`

/* eslint-disable import/prefer-default-export */
export { SEARCH_USERS }
