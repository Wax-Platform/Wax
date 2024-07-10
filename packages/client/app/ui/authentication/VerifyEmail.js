import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { Button, Spin, Result } from '../common'

const Wrapper = styled.div``

const VerifyEmail = props => {
  const {
    className,
    verifying,
    successfullyVerified,
    alreadyVerified,
    expired,
    resend,
    resending,
    resent,
    redirectToLogin,
    redirectDelay,
  } = props

  const redirect = () =>
    setTimeout(() => {
      redirectToLogin()
    }, redirectDelay)

  if (verifying)
    return (
      <Wrapper className={className}>
        <Result
          icon={<Spin size={18} spinning />}
          title="Verifying your email address..."
        />
      </Wrapper>
    )

  if (successfullyVerified) {
    redirect()

    return (
      <Wrapper className={className}>
        <Result
          status="success"
          subTitle="Redirecting you to login..."
          title="Email successfully verified!"
        />
      </Wrapper>
    )
  }

  if (alreadyVerified) {
    redirect()

    return (
      <Wrapper className={className}>
        <Result
          status="success"
          subTitle="Redirecting you to login..."
          title="This email has already been verified!"
        />
      </Wrapper>
    )
  }

  if (expired && !(resending || resent))
    return (
      <Wrapper className={className}>
        <Result
          extra={
            <Button onClick={resend} type="primary">
              Resend verification email
            </Button>
          }
          status="error"
          subTitle="Click the button below to get a new token"
          title="Your verification token has expired!"
        />
      </Wrapper>
    )

  if (resending)
    return (
      <Wrapper className={className}>
        <Result
          icon={<Spin size={18} spinning />}
          title="Sending verification email..."
        />
      </Wrapper>
    )

  if (resent)
    return (
      <Wrapper className={className}>
        <Result
          status="success"
          subTitle="Check your email for further instructions"
          title="New verification email has been sent!"
        />
      </Wrapper>
    )

  // if (hasError)
  return (
    <Wrapper className={className}>
      <Result
        status="error"
        subTitle="Try reloading the page or contact us"
        title="Something went wrong!"
      />
    </Wrapper>
  )

  // return null
}

VerifyEmail.propTypes = {
  verifying: PropTypes.bool,
  successfullyVerified: PropTypes.bool,
  alreadyVerified: PropTypes.bool,
  expired: PropTypes.bool,
  resend: PropTypes.func.isRequired,
  resending: PropTypes.bool,
  resent: PropTypes.bool,
  redirectToLogin: PropTypes.func.isRequired,
  redirectDelay: PropTypes.number,
}

VerifyEmail.defaultProps = {
  verifying: false,
  successfullyVerified: false,
  alreadyVerified: false,
  expired: false,
  resending: false,
  resent: false,
  redirectDelay: 3000,
}

export default VerifyEmail
