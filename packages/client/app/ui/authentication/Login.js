import React from 'react'
import PropTypes from 'prop-types'
import { LockOutlined, UserOutlined } from '@ant-design/icons'

import { useTranslation } from 'react-i18next'
import { Form, Input, Page } from '../common'
import AuthenticationForm from './AuthenticationForm'
import AuthenticationHeader from './AuthenticationHeader'
import AuthenticationWrapper from './AuthenticationWrapper'

const Login = props => {
  const { className, errorMessage, hasError, loading, onSubmit } = props

  const { t } = useTranslation(null, {
    keyPrefix: 'pages.login',
    useSuspense: false,
  })

  return (
    <Page maxWidth={600}>
      <AuthenticationWrapper className={className}>
        <AuthenticationHeader>{t('title')}</AuthenticationHeader>

        <AuthenticationForm
          alternativeActionLabel={t('links.signup')}
          alternativeActionLink="/signup"
          errorMessage={errorMessage}
          hasError={hasError}
          loading={loading}
          onSubmit={onSubmit}
          showForgotPassword
          submitButtonLabel={t('actions.login')}
        >
          <Form.Item
            label={t('form.email', { keyPrefix: 'pages.common' })}
            name="email"
            rules={[
              {
                required: true,
                message: () =>
                  t('form.email.errors.noValue', { keyPrefix: 'pages.common' }),
              },
              {
                type: 'email',
                message: () =>
                  t('form.email.errors.invalidEmail', {
                    keyPrefix: 'pages.common',
                  }),
              },
            ]}
          >
            <Input
              autoComplete="on"
              data-test="login-email-input"
              placeholder={t('form.email.placeholder', {
                keyPrefix: 'pages.common',
              })}
              prefix={<UserOutlined className="site-form-item-icon" />}
              type="email"
            />
          </Form.Item>

          <Form.Item
            label={t('form.password', { keyPrefix: 'pages.common' })}
            name="password"
            rules={[
              {
                required: true,
                message: () =>
                  t('form.password.errors.noValue', {
                    keyPrefix: 'pages.common',
                  }),
              },
            ]}
          >
            <Input
              autoComplete="on"
              data-test="login-password-input"
              placeholder={t('form.password.placeholder', {
                keyPrefix: 'pages.common',
              })}
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
            />
          </Form.Item>
        </AuthenticationForm>
      </AuthenticationWrapper>
    </Page>
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
