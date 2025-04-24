/* eslint-disable react/jsx-props-no-spreading */

import React, { useState } from 'react'
// import { lorem } from 'faker'

import { Login } from '../../app/ui'

export const Base = args => <Login {...args} />

export const FailingLogin = () => {
  const [hasError, setHasError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    setHasError(false)
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      setHasError(true)
    }, 2000)
  }

  return (
    <Login
      errorMessage="Invalid credentials"
      hasError={hasError}
      loading={loading}
      onSubmit={handleSubmit}
    />
  )
}

export default {
  component: Login,
  title: 'Authentication/Login',
  parameters: { actions: { argTypesRegex: '^on.*' } },
}
