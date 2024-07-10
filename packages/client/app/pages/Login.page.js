import React from 'react'
import { useLocation, Redirect } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { useCurrentUser } from '@coko/client'

import { Login } from 'ui'
import { EMAIL_LOGIN } from '../graphql'

const LoginPage = () => {
  const { search } = useLocation()

  const { currentUser, setCurrentUser } = useCurrentUser()

  const [emailLoginMutation, { data, loading, error }] =
    useMutation(EMAIL_LOGIN)

  const redirectUrl = new URLSearchParams(search).get('next') || '/'

  localStorage.setItem('nextDocument', redirectUrl)

  const login = formData => {
    const mutationData = {
      variables: {
        input: { ...formData, email: formData.email.toLowerCase() },
      },
    }

    emailLoginMutation(mutationData).catch(e => console.error(e))
  }

  if (currentUser) return <Redirect to={redirectUrl} />

  let errorMessage = 'Something went wrong!'

  if (error?.message.includes('username or password'))
    errorMessage = 'Invalid credentials'

  if (data) {
    const token = data.login?.token

    setCurrentUser(data.login?.user)

    if (token) {
      localStorage.setItem('token', token)
      return <Redirect to={redirectUrl} />
    }

    console.error('No token returned from mutation!')
  }

  return (
    <Login
      errorMessage={errorMessage}
      hasError={!!error}
      loading={loading}
      onSubmit={login}
      showEmailOption
    />
  )
}

LoginPage.propTypes = {}

LoginPage.defaultProps = {}

export default LoginPage
