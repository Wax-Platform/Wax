import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Form, Input, Page } from '../common'
import AuthenticationForm from './AuthenticationForm'
import AuthenticationWrapper from './AuthenticationWrapper'
import logoVertical from '../../../static/waxdesignerwhite.svg'

const CenteredLogo = styled.div`
  height: 200px;
  margin-bottom: 10px;
  width: 100%;

  img {
    height: auto;
    object-fit: contain;
    width: 100%;
  }
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
        <CenteredLogo>
          <img src={logoVertical} alt="wax.is logo" />
        </CenteredLogo>
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
