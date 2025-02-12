/* stylelint-disable declaration-no-important */

import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { grid, th } from '@coko/client'

import { Link } from 'react-router-dom'

import { Form, Button } from '../common'

const Wrapper = styled.div``

const SubmitButton = styled(Button)`
  background-color: ${th('colorAccept')};
  width: 100%;

  &:hover,
  &:focus,
  &:active {
    background-color: ${th('colorAccept')} !important;
  }
`

const Footer = styled.div`
  display: flex;
  justify-content: ${props =>
    props.showForgotPassword ? 'space-between' : 'flex-end'};
  margin-top: ${grid(4)};

  div:first-child {
    padding-right: 20px;
  }
`

const ForgotPassword = styled.div`
  > a {
    color: ${props => props.theme.colorText};
  }
`

const AlternativeAction = styled.div`
  font-weight: bold;

  > a {
    color: ${props => props.theme.colorText};
  }
`

const AuthenticationForm = props => {
  const {
    alternativeActionLabel,
    alternativeActionLink,
    className,
    children,
    errorMessage,
    forgotPasswordUrl,
    hasError,
    loading,
    onSubmit,
    showForgotPassword,
    submitButtonLabel,
  } = props

  return (
    <Wrapper className={className}>
      <Form
        layout="vertical"
        onFinish={onSubmit}
        ribbonMessage={errorMessage}
        submissionStatus={hasError ? 'error' : null}
      >
        {children}

        <SubmitButton htmlType="submit" loading={!!loading} type="primary">
          {submitButtonLabel}
        </SubmitButton>
      </Form>

      {!!alternativeActionLabel && (
        <Footer showForgotPassword={showForgotPassword}>
          {showForgotPassword && (
            <ForgotPassword>
              <Link to={forgotPasswordUrl}>Forgot your password?</Link>
            </ForgotPassword>
          )}

          <AlternativeAction>
            <Link to={alternativeActionLink}>{alternativeActionLabel}</Link>
          </AlternativeAction>
        </Footer>
      )}
    </Wrapper>
  )
}

AuthenticationForm.propTypes = {
  /** Function to run on form submit */
  onSubmit: PropTypes.func.isRequired,

  /** Text displayed at bottom right */
  alternativeActionLabel: PropTypes.string,
  /** Link to redirect to when clicking on alternative action */
  alternativeActionLink: PropTypes.string,
  /** Error message to display when `hasError` is true */
  errorMessage: PropTypes.string,
  /** Link to redirect to when clicking on "forgot password" */
  forgotPasswordUrl: PropTypes.string,
  /** Controls whether there is an incoming error from __outside__ the form. (eg. from a failed server response) */
  hasError: PropTypes.bool,
  /** Control waiting for response status */
  loading: PropTypes.bool,
  /** Show / hide "forgot password" */
  showForgotPassword: PropTypes.bool,
  /** Text displayed inside submit button */
  submitButtonLabel: PropTypes.string,
}

AuthenticationForm.defaultProps = {
  alternativeActionLabel: null,
  alternativeActionLink: null,
  errorMessage: null,
  forgotPasswordUrl: '/request-password-reset',
  hasError: false,
  loading: false,
  showForgotPassword: false,
  submitButtonLabel: 'Submit',
}

export default AuthenticationForm
