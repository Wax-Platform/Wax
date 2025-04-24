/* eslint-disable react/jsx-props-no-spreading, no-console */

import React from 'react'
// import { lorem } from 'faker'

import { ResetPassword } from '../../app/ui'

const redirect = () => {
  console.log('redirect')
}

const Template = args => <ResetPassword redirectToLogin={redirect} {...args} />

export const Base = Template.bind({})
Base.args = {
  onSubmit: () => {},
}

export default {
  component: ResetPassword,
  title: 'Authentication/Reset Password',
}
