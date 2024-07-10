import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import AuthenticationForm from './AuthenticationForm'
import AuthenticationHeader from './AuthenticationHeader'
import AuthenticationWrapper from './AuthenticationWrapper'

import {
  Form,
  Input,
  Result,

  Paragraph,
  Page,
} from '../common'

const StyledPage = styled(Page)`
  height: unset;
  left: 50%;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
`

const Signup = props => {
  const {
    className,
    errorMessage,
    hasError,
    hasSuccess,
    loading,
    onSubmit,
  } = props

  return (
    <StyledPage maxWidth={600}>
      <AuthenticationWrapper className={className}>
        <AuthenticationHeader>Sign up</AuthenticationHeader>

        {hasSuccess && (
          <div role="alert">
            <Result
              className={className}
              status="success"
              subTitle={
                <Paragraph>
                  We&apos;ve sent you a verification email. Click on the link in
                  the email to activate your account.
                </Paragraph>
              }
              title="Sign up successful!"
            />
          </div>
        )}

        {!hasSuccess && (
          <AuthenticationForm
            alternativeActionLabel="Do you want to login instead?"
            alternativeActionLink="/login"
            errorMessage={errorMessage}
            hasError={hasError}
            loading={loading}
            onSubmit={onSubmit}
            showForgotPassword={false}
            submitButtonLabel="Sign up"
            title="Sign up"
          >
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: 'First name is required' }]}
            >
              <Input
                autoComplete="given-name"
                placeholder="Fill in your first name"
              />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: 'Last name is required' }]}
            >
              <Input
                autoComplete="family-name"
                placeholder="Fill in your last name"
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Email is required',
                },
                {
                  type: 'email',
                  message: 'This is not a valid email address',
                },
              ]}
            >
              <Input
                autoComplete="email"
                placeholder="Fill in your email"
                type="email"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Password is required' },
                { min: 8, message: 'Should be at least 8 characters' }
              ]}
            >
              <Input
                autoComplete="new-password"
                placeholder="Fill in your password"
                type="password"
              />
            </Form.Item>

            <Form.Item
              dependencies={['password']}
              label="Confirm Password"
              name="confirmPassword"
              rules={[
                {
                  required: true,
                  message: 'Please confirm your password!',
                },
                { min: 8, message: 'Should be at least 8 characters' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }

                    return Promise.reject(
                      new Error(
                        'The two passwords that you entered do not match!',
                      ),
                    )
                  },
                }),
              ]}
            >
              <Input
                autoComplete="new-password"
                placeholder="Fill in your password again"
                type="password"
              />
            </Form.Item>
          </AuthenticationForm>
        )}
      </AuthenticationWrapper>
    </StyledPage>
  )
}

Signup.propTypes = {
  onSubmit: PropTypes.func.isRequired,

  errorMessage: PropTypes.string,
  hasError: PropTypes.bool,
  hasSuccess: PropTypes.bool,
  loading: PropTypes.bool,
}

Signup.defaultProps = {
  errorMessage: null,
  hasError: false,
  hasSuccess: false,
  loading: false,
}

export default Signup
