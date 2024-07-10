import React from 'react'
import { useMutation } from '@apollo/client'

import { Signup } from 'ui'
import { SIGNUP } from '../graphql'

const SignupPage = props => {
  const [signupMutation, { data, loading, error }] = useMutation(SIGNUP)

  const signup = formData => {
    const { email, firstName, lastName, password } = formData

    const mutationData = {
      variables: {
        input: {
          agreedTc: true,
          email,
          givenNames: firstName,
          surname: lastName,
          password,
        },
      },
    }

    signupMutation(mutationData).catch(e => console.error(e))
  }

  return (
    <Signup
      errorMessage={error?.message}
      hasError={!!error}
      hasSuccess={!!data}
      loading={loading}
      onSubmit={signup}
      // userEmail
    />
  )
}

SignupPage.propTypes = {}

SignupPage.defaultProps = {}

export default SignupPage
