/* eslint-disable react/jsx-props-no-spreading */

import React from 'react'
import { RequestPasswordReset } from '../../app/ui'

const dummyArgs = {
  onSubmit: () => {},
}

const Template = args => <RequestPasswordReset {...args} {...dummyArgs} />

export const Base = Template.bind({})

export const InitialState = Template.bind({})

export const LoadingState = Template.bind({})
LoadingState.args = {
  loading: true,
}

export const ErrorState = Template.bind({})
ErrorState.args = {
  hasError: true,
}

export const SuccessfulState = Template.bind({})
SuccessfulState.args = {
  hasSuccess: true,
  userEmail: 'example@example.com',
}

export default {
  component: RequestPasswordReset,
  title: 'Authentication/Request Password Reset',
}
