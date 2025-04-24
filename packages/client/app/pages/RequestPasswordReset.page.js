import React from 'react'
import { useMutation } from '@apollo/client'

import { RequestPasswordReset } from '../ui'
import { REQUEST_PASSWORD_RESET } from '../graphql'

const RequestPasswordResetPage = () => {
  const [emailUsed, setEmailUsed] = React.useState(null)

  const [requestPasswordResetMutation, { data, loading, error }] = useMutation(
    REQUEST_PASSWORD_RESET,
  )

  const requestPasswordReset = ({ email }) => {
    requestPasswordResetMutation({
      variables: { email },
    })

    setEmailUsed(email)
  }

  return (
    <RequestPasswordReset
      hasError={!!error}
      hasSuccess={!!data}
      loading={loading}
      onSubmit={requestPasswordReset}
      userEmail={emailUsed}
    />
  )
}

export default RequestPasswordResetPage
