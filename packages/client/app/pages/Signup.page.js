import React from 'react'
import { useMutation, useQuery } from '@apollo/client'

import { Signup } from '../ui'
import { SIGNUP, APPLICATION_PARAMETERS } from '../graphql'

const SignupPage = () => {
  const { data: { getApplicationParameters } = {} } = useQuery(
    APPLICATION_PARAMETERS,
    {
      variables: {
        context: 'bookBuilder',
        area: 'termsAndConditions',
      },
    },
  )

  const [signupMutation, { data, loading, error }] = useMutation(SIGNUP)

  const signup = formData => {
    const { agreedTc, email, givenNames, surname, password } = formData

    const mutationData = {
      variables: {
        input: {
          agreedTc,
          email,
          givenNames,
          surname,
          password,
        },
      },
    }

    signupMutation(mutationData).catch(e => console.error(e))
  }

  const termsAndConditions = getApplicationParameters?.find(
    p => p.area === 'termsAndConditions',
  )?.config

  return (
    <Signup
      errorMessage={error?.message}
      hasError={!!error}
      hasSuccess={!!data}
      loading={loading}
      onSubmit={signup}
      termsAndConditions={termsAndConditions}
    />
  )
}

export default SignupPage
