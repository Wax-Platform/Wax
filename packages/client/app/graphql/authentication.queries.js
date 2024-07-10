import { gql } from '@apollo/client'
import { USER_FIELDS } from './user.queries'

export const EMAIL_LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        ...UserFields
      }
      token
    }
  }
  ${USER_FIELDS}
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

export const RESEND_VERIFICATION_EMAIL = gql`
  mutation ResendVerificationEmail($token: String!) {
    resendVerificationEmail(token: $token)
  }
`

export const RESEND_VERIFICATION_EMAIL_AFTER_LOGIN = gql`
  mutation ResendVerificationEmailAfterLogin {
    resendVerificationEmailAfterLogin
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
