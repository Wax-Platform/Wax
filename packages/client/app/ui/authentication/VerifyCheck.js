import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import {
  Page,
  Result,
  Button,
  Spin,
  // Paragraph,
  // Text
} from '../common'

const Wrapper = styled.div``

const ExtraWrapper = styled.div``

const VerifyCheck = props => {
  const { className, resend, resending, resent } = props

  const initial = !(resending || resent)

  return (
    <Page maxWidth={600}>
      <Wrapper className={className}>
        {initial && (
          <Result
            extra={
              <ExtraWrapper>
                {/* <Paragraph>
                  <Text type="secondary">
                    If you have not received an email, click on the button below
                    to receive a new one.
                  </Text>
                </Paragraph> */}
                <Button onClick={resend} type="primary">
                  Send me a new verification email
                </Button>
              </ExtraWrapper>
            }
            status="warning"
            subTitle="It appears you haven't verified your email address yet. Please check your inbox for an email containing instructions. "
            title="Email not verified"
          />
        )}

        {resending && (
          <Result
            icon={<Spin size={18} spinning />}
            title="Sending verification email..."
          />
        )}

        {resent && (
          <Result
            status="success"
            subTitle="Check your email for further instructions"
            title="New verification email has been sent!"
          />
        )}
      </Wrapper>
    </Page>
  )
}

VerifyCheck.propTypes = {
  resend: PropTypes.func.isRequired,
  resending: PropTypes.bool,
  resent: PropTypes.bool,
}

VerifyCheck.defaultProps = {
  resending: false,
  resent: false,
}

export default VerifyCheck
