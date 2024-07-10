import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Form, Input, Page } from '../common'
import AuthenticationForm from './AuthenticationForm'
import AuthenticationWrapper from './AuthenticationWrapper'
import logoVertical from '../../../static/logoVertical.png'

const CenteredLogo = styled.div`
  background-image: ${`url(${logoVertical})`};
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 520px 142px;
  height: 200px;
  margin-bottom: 10px;
`

const StyledPage = styled(Page)`
  height: unset;
  left: 50%;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
`

const Login = props => {
  const { className, errorMessage, hasError, loading, onSubmit } = props

  return (
    <StyledPage maxWidth={600}>
      <AuthenticationWrapper className={className}>
        <CenteredLogo />
        <AuthenticationForm
          alternativeActionLabel="Do you want to signup instead?"
          alternativeActionLink="/signup"
          errorMessage={errorMessage}
          hasError={hasError}
          loading={loading}
          onSubmit={onSubmit}
          showForgotPassword
          submitButtonLabel="Log in"
          title="Login"
        >
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
              placeholder="Please enter your email"
              type="email"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input
              autoComplete="current-password"
              placeholder="Please enter your password"
              type="password"
            />
          </Form.Item>
        </AuthenticationForm>
      </AuthenticationWrapper>
    </StyledPage>
  )
}

Login.propTypes = {
  errorMessage: PropTypes.string,
  hasError: PropTypes.bool,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
}

Login.defaultProps = {
  errorMessage: null,
  hasError: false,
  loading: false,
}

export default Login
