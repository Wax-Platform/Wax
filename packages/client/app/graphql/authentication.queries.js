import { gql } from '@apollo/client'

export const LOGIN = gql`
  mutation KetidaLogin($input: LoginInput!) {
    ketidaLogin(input: $input) {
      user {
        id
        displayName
        username
        teams {
          id
          role
          objectId
          global
          members {
            id
            user {
              id
            }
            status
          }
        }
        isActive
        defaultIdentity {
          id
          isVerified
        }
        identities {
          id
          provider
          hasValidRefreshToken
        }
      }
      token
      code
    }
  }
`

export const SIGNUP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input)
  }
`

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token)
  }
`

export const REQUEST_VERIFICATION_EMAIL = gql`
  mutation KetidaRequestVerificationEmail($email: String!) {
    ketidaRequestVerificationEmail(email: $email)
  }
`

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    sendPasswordResetEmail(email: $email)
  }
`

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password)
  }
`
