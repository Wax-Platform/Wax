/* eslint-disable react/jsx-props-no-spreading */

import React, { useState } from 'react'

import { Signup } from '../../app/ui'

export const Base = args => <Signup {...args} />

Base.args = {
  onSubmit: () => {},
}

export const SuccessfulSignup = () => {
  const [hasSuccess, setHasSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    setHasSuccess(false)
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      setHasSuccess(true)
    }, 2000)
  }

  return (
    <Signup hasSuccess={hasSuccess} loading={loading} onSubmit={handleSubmit} />
  )
}

export default {
  component: Signup,
  title: 'Authentication/Signup',
  parameters: { actions: { argTypesRegex: '^on.*' } },
}
