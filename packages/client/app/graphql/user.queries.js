/* eslint-disable import/prefer-default-export */

import { gql } from '@apollo/client'

export const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    isActive

    givenNames
    surname
    username
    displayName
    color

    defaultIdentity {
      id
      email
      isVerified
    }

    documents {
      id
      identifier
    }
  }
`

export const CURRENT_USER = gql`
  query CurrentUser {
    currentUser {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`

export const UPDATE_PROFILE = gql`
  mutation UpdateUserProfile($input: UserProfileInput!) {
    updateUserProfile(input: $input) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`

export const GET_USERS = gql`
  query GetUsers($queryParams: UsersQueryParams, $options: PageInput) {
    users(queryParams: $queryParams, options: $options) {
      result {
        id
        displayName
        created
      }
      totalCount
    }
  }
`

export const FILTER_USERS = gql`
  query FilterUsers($params: UsersQueryParams, $options: PageInput) {
    filterUsers(params: $params, options: $options) {
      result {
        id
        displayName
        created

        teams {
          role
        }
      }
      totalCount
    }
  }
`

export const FILTER_USERS_OPTIONS = gql`
  query FilterUsers($params: UsersQueryParams) {
    filterUsers(params: $params) {
      result {
        value: id
        label: displayName
      }
    }
  }
`

export const DELETE_USERS = gql`
  mutation DeleteUsers($ids: [ID!]!) {
    deleteUsers(ids: $ids)
  }
`

export const DEACTIVATE_USERS = gql`
  mutation DeactivateUsers($ids: [ID!]!) {
    deactivateUsers(ids: $ids) {
      id
    }
  }
`

export const ACTIVATE_USERS = gql`
  mutation ActivateUsers($ids: [ID!]!) {
    activateUsers(ids: $ids) {
      id
    }
  }
`

export const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($input: UpdatePasswordInput!) {
    updatePassword(input: $input)
  }
`
