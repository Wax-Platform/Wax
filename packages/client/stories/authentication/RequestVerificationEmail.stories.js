/* eslint-disable no-alert */
import React from 'react'

import { RequestVerificationEmail } from '../../app/ui'

const handleSubmit = () => {
  alert('Request verification email.')
}

export const Base = () => <RequestVerificationEmail onSubmit={handleSubmit} />
export const Resending = () => (
  <RequestVerificationEmail onSubmit={handleSubmit} resending />
)
export const Resent = () => (
  <RequestVerificationEmail onSubmit={handleSubmit} resent />
)

export default {
  component: RequestVerificationEmail,
  title: 'Authentication/VerifyCheck',
}
