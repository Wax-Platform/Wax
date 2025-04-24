import React, { Suspense } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthenticationForm from './AuthenticationForm'
import AuthenticationHeader from './AuthenticationHeader'
import AuthenticationWrapper from './AuthenticationWrapper'
import SuccessSubTitle from './SuccessSubTitle'
import { Form, Input, Paragraph, Result, Page } from '../common'

const RequestPasswordResetForm = props => {
  // disable prop types that will be checked in the exported component anyway
  // eslint-disable-next-line react/prop-types
  const { hasError, loading, onSubmit } = props

  const { t } = useTranslation('translation', {
    keyPrefix: 'pages',
    useSuspense: false,
  })

  return (
    <AuthenticationForm
      alternativeActionLabel={t('passwordReset.links.login')}
      alternativeActionLink="/login"
      errorMessage={t(
        'Something went wrong! Please contact the administrator.'
          .toLowerCase()
          .replace(/ /g, '_'),
      )}
      hasError={hasError}
      loading={loading}
      onSubmit={onSubmit}
      submitButtonLabel={t('passwordReset.actions.send')}
    >
      <Paragraph>{t('passwordReset.description')}</Paragraph>

      <Form.Item
        label={t('common.form.email')}
        name="email"
        rules={[
          {
            required: true,
            message: () => t('common.form.email.errors.noValue'),
          },
          {
            type: 'email',
            message: () => t('common.form.email.errors.invalidEmail'),
          },
        ]}
      >
        <Input placeholder={t('common.form.email.placeholder')} />
      </Form.Item>
    </AuthenticationForm>
  )
}

const RequestPasswordReset = props => {
  const { className, hasError, hasSuccess, loading, onSubmit, userEmail } =
    props

  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.passwordReset',
    useSuspense: false,
  })

  return (
    <Page maxWidth={600}>
      <Suspense fallback={<div>Loading...</div>}>
        <AuthenticationWrapper className={className}>
          <AuthenticationHeader>{t('title')}</AuthenticationHeader>

          {hasSuccess && (
            <div role="alert">
              <Result
                data-testid="result-request-password-success"
                extra={[
                  <Link key={1} to="/login">
                    {t('links.login')}
                  </Link>,
                ]}
                status="success"
                subTitle={<SuccessSubTitle userEmail={userEmail} />}
                title={t('success')}
              />
            </div>
          )}

          {!hasSuccess && (
            <RequestPasswordResetForm
              hasError={hasError}
              loading={loading}
              onSubmit={onSubmit}
            />
          )}
        </AuthenticationWrapper>
      </Suspense>
    </Page>
  )
}

RequestPasswordReset.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  hasError: PropTypes.bool,
  hasSuccess: PropTypes.bool,
  loading: PropTypes.bool,
  userEmail: PropTypes.string,
}

RequestPasswordReset.defaultProps = {
  hasError: false,
  hasSuccess: false,
  loading: false,
  userEmail: null,
}

export default RequestPasswordReset
