import React, { Suspense, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { grid } from '@coko/client'

import { useTranslation } from 'react-i18next'
import AuthenticationForm from './AuthenticationForm'
import AuthenticationHeader from './AuthenticationHeader'
import AuthenticationWrapper from './AuthenticationWrapper'

import {
  Form,
  Input,
  Link,
  Modal,
  Result,
  Checkbox,
  Paragraph,
  Page,
} from '../common'

const ModalContext = React.createContext(null)

const TCWrapper = styled.section`
  max-height: 500px;
  overflow: auto;
  padding-inline-end: ${grid(2)};
`

const Signup = props => {
  const {
    className,
    errorMessage,
    hasError,
    hasSuccess,
    loading,
    onSubmit,
    termsAndConditions,
    // userEmail,
  } = props

  const { t } = useTranslation(null, { keyPrefix: 'pages.signup' })

  const [modal, contextHolder] = Modal.useModal()
  const [error, setError] = useState()

  const [form] = Form.useForm()

  const handleTCAgree = () => {
    form.setFieldValue('agreedTc', true)
  }

  const showTermsAndConditions = e => {
    e.preventDefault()

    const termsAndConditionsModal = modal.info()
    termsAndConditionsModal.update({
      title: t('form.terms.modal.title'),
      content: (
        <TCWrapper dangerouslySetInnerHTML={{ __html: termsAndConditions }} />
      ),
      onOk() {
        handleTCAgree()
        termsAndConditionsModal.destroy()
      },
      okText: t('form.terms.modal.action'),
      maskClosable: true,
      width: 570,
      bodyStyle: {
        marginRight: 38,
        textAlign: 'justify',
      },
    })
  }

  useEffect(() => {
    if (errorMessage) {
      switch (errorMessage) {
        case 'Username already exists':
          setError(t('errors.usernameExists'))
          break
        case 'A user with this email already exists':
          setError(t('errors.emailExists'))
          break
        default:
          setError(t('errors.generic'))
          break
      }
    }
  }, [errorMessage])

  return (
    <Page maxWidth={600}>
      <Suspense fallback={<div>Loading...</div>}>
        <AuthenticationWrapper className={className}>
          <AuthenticationHeader>{t('title')}</AuthenticationHeader>

          {hasSuccess && (
            <div role="alert">
              <Result
                className={className}
                status="success"
                subTitle={<Paragraph>{t('success.details')}</Paragraph>}
                title={t('success')}
              />
            </div>
          )}

          {!hasSuccess && (
            <AuthenticationForm
              alternativeActionLabel={t('links.login')}
              alternativeActionLink="/login"
              errorMessage={error}
              form={form}
              hasError={hasError}
              loading={loading}
              onSubmit={onSubmit}
              showForgotPassword={false}
              submitButtonLabel={t('actions.signup')}
              title={t('title')}
            >
              <Form.Item
                label={t('form.givenName')}
                name="givenNames"
                rules={[
                  {
                    required: true,
                    message: () => t('form.givenName.errors.noValue'),
                  },
                ]}
              >
                <Input
                  data-test="signup-givenName-input"
                  placeholder={t('form.givenName.placeholder')}
                />
              </Form.Item>

              <Form.Item
                label={t('form.surname')}
                name="surname"
                rules={[
                  {
                    required: true,
                    message: () => t('form.surname.errors.noValue'),
                  },
                ]}
              >
                <Input
                  data-test="signup-surname-input"
                  placeholder={t('form.surname.placeholder')}
                />
              </Form.Item>

              <Form.Item
                label={t('email', { keyPrefix: 'pages.common.form' })}
                name="email"
                rules={[
                  {
                    required: true,
                    message: () =>
                      t('email.errors.noValue', {
                        keyPrefix: 'pages.common.form',
                      }),
                  },
                  {
                    type: 'email',
                    message: () =>
                      t('email.errors.invalidEmail', {
                        keyPrefix: 'pages.common.form',
                      }),
                  },
                ]}
              >
                <Input
                  data-test="signup-email-input"
                  placeholder={t('email.placeholder', {
                    keyPrefix: 'pages.common.form',
                  })}
                  type="email"
                />
              </Form.Item>

              <Form.Item
                label={t('password', {
                  keyPrefix: 'pages.common.form',
                })}
                name="password"
                rules={[
                  {
                    required: true,
                    message: () =>
                      t('password.errors.noValue', {
                        keyPrefix: 'pages.common.form',
                      }),
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value && value.length >= 8) {
                        return Promise.resolve()
                      }

                      return Promise.reject(
                        new Error(
                          t('password.errors.tooShort', {
                            keyPrefix: 'pages.common.form',
                          }),
                        ),
                      )
                    },
                  }),
                ]}
              >
                <Input
                  data-test="signup-password-input"
                  placeholder={t('password.placeholder', {
                    keyPrefix: 'pages.common.form',
                  })}
                  type="password"
                />
              </Form.Item>

              <Form.Item
                dependencies={['password']}
                label={t('confirmPassword', {
                  keyPrefix: 'pages.common.form',
                })}
                name="confirmPassword"
                rules={[
                  {
                    required: true,
                    message: () =>
                      t('confirmPassword.errors.noValue', {
                        keyPrefix: 'pages.common.form',
                      }),
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }

                      return Promise.reject(
                        new Error(
                          t('confirmPassword.errors.noMatch', {
                            keyPrefix: 'pages.common.form',
                          }),
                        ),
                      )
                    },
                  }),
                ]}
              >
                <Input
                  data-test="signup-confirmPassword-input"
                  placeholder={t('confirmPassword.placeholder', {
                    keyPrefix: 'pages.common.form',
                  })}
                  type="password"
                />
              </Form.Item>
              <ModalContext.Provider value={null}>
                <Link
                  as="a"
                  href="#termsAndCondition"
                  id="termsAndConditions"
                  onClick={showTermsAndConditions}
                >
                  {t('form.terms.link')}
                </Link>
                <Form.Item
                  name="agreedTc"
                  rules={[
                    {
                      validator: (_, value) =>
                        value
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error(t('form.terms.errors.noValue')),
                            ),
                    },
                  ]}
                  valuePropName="checked"
                >
                  <Checkbox
                    aria-label={t('terms')}
                    data-test="signup-agreedTc-checkbox"
                  >
                    {t('form.terms')}
                  </Checkbox>
                </Form.Item>
                {contextHolder}
              </ModalContext.Provider>
            </AuthenticationForm>
          )}
        </AuthenticationWrapper>
      </Suspense>
    </Page>
  )
}

Signup.propTypes = {
  onSubmit: PropTypes.func.isRequired,

  errorMessage: PropTypes.string,
  hasError: PropTypes.bool,
  hasSuccess: PropTypes.bool,
  loading: PropTypes.bool,
  termsAndConditions: PropTypes.string,
}

Signup.defaultProps = {
  errorMessage: null,
  hasError: false,
  hasSuccess: false,
  loading: false,
  termsAndConditions: '',
}

export default Signup
