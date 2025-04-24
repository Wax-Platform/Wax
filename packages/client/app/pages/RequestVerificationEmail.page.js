import React from 'react'
import { useMutation } from '@apollo/client'

import { RequestVerificationEmail } from '../ui'
import { REQUEST_VERIFICATION_EMAIL } from '../graphql'

const RequestVerificationEmailPage = () => {
  const [emailUsed, setEmailUsed] = React.useState(null)

  const [requestVerificationEmailMutation, { data, loading, error }] =
    useMutation(REQUEST_VERIFICATION_EMAIL)

  const requestVerificationEmail = ({ email }) => {
    requestVerificationEmailMutation({
      variables: { email },
    })

    setEmailUsed(email)
  }

  return (
    <RequestVerificationEmail
      hasError={!!error}
      hasSuccess={!!data}
      loading={loading}
      onSubmit={requestVerificationEmail}
      userEmail={emailUsed}
    />
  )
}

export default RequestVerificationEmailPage
