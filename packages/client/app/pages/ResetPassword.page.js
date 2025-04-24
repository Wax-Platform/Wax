import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useMutation } from '@apollo/client'

import { ResetPassword } from '../ui'
import { RESET_PASSWORD } from '../graphql'

const ResetPasswordPage = () => {
  const history = useHistory()
  const { token } = useParams()

  const [resetPasswordMutation, { data, loading, error }] =
    useMutation(RESET_PASSWORD)

  const resetPassword = formData => {
    const { password } = formData

    const mutationVariables = {
      variables: {
        token,
        password,
      },
    }

    resetPasswordMutation(mutationVariables).catch(msg => console.error(msg))
  }

  const redirectToLogin = () => {
    history.push('/login')
  }

  return (
    <ResetPassword
      hasError={!!error}
      hasSuccess={!!data}
      onSubmit={resetPassword}
      redirectToLogin={redirectToLogin}
      verifying={loading}
    />
  )
}

export default ResetPasswordPage
