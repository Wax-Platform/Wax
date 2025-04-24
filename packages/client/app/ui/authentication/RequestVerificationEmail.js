import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthenticationForm from './AuthenticationForm'
import AuthenticationHeader from './AuthenticationHeader'
import AuthenticationWrapper from './AuthenticationWrapper'
import SuccessSubTitle from './SuccessSubTitle'
import { Form, Input, Paragraph, Result, Page } from '../common'

const RequestVerificationEmailForm = props => {
  // disable prop types that will be checked in the exported component anyway
  // eslint-disable-next-line react/prop-types
  const { hasError, loading, onSubmit } = props
  const { t } = useTranslation()

  return (
    <AuthenticationForm
      errorMessage="Something went wrong! Please contact the administrator."
      hasError={hasError}
      loading={loading}
      onSubmit={onSubmit}
      submitButtonLabel="Send"
    >
      <Paragraph>
        {t(
          'Please enter the email address connected to your account.'
            .toLowerCase()
            .replace(/ /g, '_'),
        )}
      </Paragraph>

      <Form.Item
        label={t('Email'.toLowerCase().replace(/ /g, '_'))}
        name="email"
        rules={[
          {
            required: true,
            message: () => t('Email is required'.toLowerCase().replace('_')),
          },
          {
            type: 'email',
            message: () =>
              t(
                "Doesn't look like a valid email"
                  .toLowerCase()
                  .replace(/ /g, '_'),
              ),
          },
        ]}
      >
        <Input
          placeholder={t('Enter your email'.toLowerCase().replace(/ /g, '_'))}
        />
      </Form.Item>
    </AuthenticationForm>
  )
}

const RequestVerificationEmail = props => {
  const { className, hasError, hasSuccess, loading, onSubmit, userEmail } =
    props

  const { t } = useTranslation()
  return (
    <Page maxWidth={600}>
      <AuthenticationWrapper className={className}>
        <AuthenticationHeader>
          {t('Request verification email'.toLowerCase().replace(/ /g, '_'))}
        </AuthenticationHeader>

        {hasSuccess && (
          <div role="alert">
            <Result
              data-testid="result-request-verification-email-success"
              extra={[
                <Link key={1} to="/login">
                  {t(
                    'Return to the login form'.toLowerCase().replace(/ /g, '_'),
                  )}
                </Link>,
              ]}
              status="success"
              subTitle={<SuccessSubTitle userEmail={userEmail} />}
              title={t('Request successful!'.lowerCase().replace(/ /g, '_'))}
            />
          </div>
        )}

        {!hasSuccess && (
          <RequestVerificationEmailForm
            hasError={hasError}
            loading={loading}
            onSubmit={onSubmit}
          />
        )}
      </AuthenticationWrapper>
    </Page>
  )
}

RequestVerificationEmail.propTypes = {
  onSubmit: PropTypes.func.isRequired,

  hasError: PropTypes.bool,
  hasSuccess: PropTypes.bool,
  loading: PropTypes.bool,
  userEmail: PropTypes.string,
}

RequestVerificationEmail.defaultProps = {
  hasError: false,
  hasSuccess: false,
  loading: false,
  userEmail: null,
}

export default RequestVerificationEmail
