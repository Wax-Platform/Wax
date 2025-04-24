/* eslint-disable no-console */
import React from 'react'
import { VerifyEmail } from '../../app/ui'

const resend = () => console.log('resend')
const redirect = () => console.log('redirect')

export const Base = args => (
  <VerifyEmail redirectToLogin={redirect} resend={resend} verifying />
)

export const Success = args => (
  <VerifyEmail
    redirectToLogin={redirect}
    resend={resend}
    successfullyVerified
  />
)

export const AlreadyVerified = args => (
  <VerifyEmail alreadyVerified redirectToLogin={redirect} resend={resend} />
)

export const Expired = args => (
  <VerifyEmail expired redirectToLogin={redirect} resend={resend} />
)

export const Resending = args => (
  <VerifyEmail redirectToLogin={redirect} resend={resend} resending />
)

export const Resent = args => (
  <VerifyEmail redirectToLogin={redirect} resend={resend} resent />
)

export const Error = args => (
  <VerifyEmail redirectToLogin={redirect} resend={resend} />
)

export default {
  component: VerifyEmail,
  title: 'Authentication/VerifyEmail',
}
