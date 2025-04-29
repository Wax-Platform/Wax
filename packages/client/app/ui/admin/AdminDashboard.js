/* stylelint-disable indentation */
/* stylelint-disable selector-combinator-space-before */
/* stylelint-disable declaration-no-important */
/* stylelint-disable string-quotes */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { Form, Upload, Collapse } from 'antd'
import { grid, serverUrl, th, uuid } from '@coko/client'
import { Wax } from 'wax-prosemirror-core'
import { useTranslation, Trans } from 'react-i18next'

import {
  Button,
  Divider,
  Switch,
  Input,
  Center,
  Stack,
  ButtonGroup,
} from '../common'

import { SimpleLayout } from '../wax/layout'
import simpleConfig from '../wax/config/simpleConfig'

const AdminWrapper = styled.div`
  background-color: #e8e8e8;
  min-height: 100vh;
  padding-block: 1rem 3rem;
`

const StyledCenter = styled(Center)`
  --max-width: 80ch;
  --s1: 32px;
  background-color: ${th('colorBackground')};
  margin-bottom: 3rem;
  padding-block: calc(var(--s1) / 2) var(--s1);
`

const StyledControlWrapper = styled.div`
  align-items: center;
  column-gap: ${grid(4)};
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  max-width: 450px;
  row-gap: ${grid(1)};

  > .ant-form-item {
    margin-bottom: 0 !important;
  }

  button[type='submit'] {
    padding-inline: 2ch;
  }
`

const StyledFormItem = styled(Form.Item)`
  .ant-form-item-row {
    justify-content: space-between;
  }

  .ant-form-item-control {
    flex: 0 1 50px;
  }
`

const LanguageWrapper = styled(Stack)`
  :has([role='switch'][aria-checked='false']) > :nth-child(2) {
    display: none;
  }
`

const DescriptionParagraph = styled.p`
  font-size: ${th('fontSizeBaseSmall')};
  margin-block: 0;
  width: 100%;
`

const TCWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${grid(5)};

  > div:last-child {
    align-items: center;
    display: flex;
    gap: calc(16px);
  }
`

const TCHeader = styled.h2`
  &::first-letter {
    text-transform: capitalize;
  }
`

const ChatGPTAPIKeyWrapper = styled.div`
  flex-grow: 1;
  height: ${props => (props.$hidden ? 0 : '100%')};
  overflow: visible clip;
  padding-block: ${props => (props.$hidden ? 0 : grid(2))};
  transition: height 0.1s ease, padding-block 0.1s ease 0.1s;
  width: 100%;

  form > div:last-child {
    align-items: center;
    display: flex;
    gap: ${grid(4)};
  }
`

const UpdateResult = styled.span`
  color: ${props => (props.$success ? th('colorSuccess') : th('colorError'))};
  display: inline-flex;
  gap: ${grid(1)};
`

const StyledUpload = styled(Upload)`
  &:has(.ant-upload-list-item) {
    .ant-upload-select {
      display: none;
    }
  }

  .ant-upload-list-item {
    margin-block-start: 0 !important;
  }
`

const UploadBtn = styled.span`
  align-items: center;
  border: 1px solid gainsboro;
  border-radius: 2px;
  cursor: pointer;
  display: inline-flex;
  height: 20px;
  justify-content: center;
  transition: border-color 0.2s ease;
  width: 20px;

  &:hover {
    border-color: ${th('colorText')};
  }
`

const StyledLanguageStack = styled(Stack)`
  --space: 1em;
  padding-inline-start: 3ch;

  > #std-wrapper:has([role='switch'][aria-checked='true'])
    ~ div:not(#lang-form-submit) {
    display: none;
  }
`

const StyledButtonGroup = styled(ButtonGroup)`
  align-items: flex-start;
`

const StyledCollapse = styled(Collapse)`
  width: 100%;

  .ant-collapse-content-box > ${Stack} {
    --space: 1em;
    padding-inline-start: 3ch;
  }
`

const normFile = e => {
  if (Array.isArray(e)) {
    return e
  }

  return e?.fileList
}

const AdminDashboard = props => {
  const {
    aiEnabled,
    chatGptApiKey,
    // luluToggleConfig,
    // luluUpdateConfig,
    luluConfig,
    paramsLoading,
    termsAndConditions,
    onTCUpdate,
    onChatGPTKeyUpdate,
    onLanguagesUpdate,
    exportOptions,
    exportConfigUpdate,
    languages,
    onTranslationsUpload,
  } = props

  const waxRef = useRef()
  const { t } = useTranslation(null, { keyPrefix: 'pages.admin' })

  const [apiKeyForm] = Form.useForm()
  const [newLanguageForm] = Form.useForm()
  const [luluConfigForm] = Form.useForm()
  const [enableAI, setEnableAI] = useState(aiEnabled)
  // const [luluConfigUpdateResult, setLuluConfigUpdateResult] = useState()
  const [keyUpdateResult, setKeyUpdateResult] = useState()
  const [tcUpdateResult, setTCUpdateResult] = useState()
  const [newLanguage, setNewLanguage] = useState()
  const [translationFile, setTranslationFile] = useState()

  useEffect(() => {
    apiKeyForm.setFieldsValue({ apiKey: chatGptApiKey })
  }, [chatGptApiKey])

  useEffect(() => {
    luluConfig &&
      luluConfigForm.setFieldsValue({
        ...luluConfig,
        redirectUri: new URL(luluConfig.redirectUri).pathname,
      })
  }, [luluConfig])

  const udpateTermsAndConditions = () => {
    setTCUpdateResult({ loading: true })
    onTCUpdate(waxRef.current.getContent())
      .then(() => {
        setTCUpdateResult({
          success: true,
          message: t('termsAndConditions.update.success'),
        })
        setTimeout(() => {
          setTCUpdateResult(null)
        }, 5000)
      })
      .catch(() => {
        setTCUpdateResult({
          success: false,
          message: t('termsAndConditions.update.error'),
        })
        setTimeout(() => {
          setTCUpdateResult(null)
        }, 5000)
      })
  }

  const handleChatGPTKeyUpdate = val => {
    setKeyUpdateResult({ loading: true })

    onChatGPTKeyUpdate(val)
      .then(() => {
        setKeyUpdateResult({
          success: true,
          message: t('aiIntegration.updateKey.success'),
        })
        setTimeout(() => {
          setKeyUpdateResult(null)
        }, 5000)
      })
      .catch(() => {
        setKeyUpdateResult({
          success: false,
          message: t('aiIntegration.updateKey.error'),
        })
        setTimeout(() => {
          setKeyUpdateResult(null)
        }, 5000)
      })
  }

  // const updateLuluConfig = () => {
  //   const { location } = window
  //   luluConfigForm.validateFields().then(vals => {
  //     const data = {
  //       ...vals,
  //       redirectUri: `${location.protocol}//${location.host}${vals.redirectUri}`,
  //     }

  //     luluUpdateConfig(data)
  //       .then(() => {
  //         setLuluConfigUpdateResult({
  //           success: true,
  //           message: t('integrations.lulu.updateConfig.success'),
  //         })
  //         setTimeout(() => {
  //           setLuluConfigUpdateResult(null)
  //         }, 5000)
  //       })
  //       .catch(() => {
  //         setLuluConfigUpdateResult({
  //           success: false,
  //           message: t('integrations.lulu.updateConfig.error'),
  //         })
  //         setTimeout(() => {
  //           setLuluConfigUpdateResult(null)
  //         }, 5000)
  //       })
  //   })
  // }

  const addLanguage = () => {
    newLanguageForm
      .validateFields()
      .then(async vals => {
        if (translationFile) {
          const code = uuid().substring(0, 7)
          await onTranslationsUpload(translationFile, code)
          setTranslationFile(null)

          onLanguagesUpdate([...languages, { ...vals, code, enabled: true }])
        }

        setNewLanguage(false)
      })
      .catch(err => console.error(err))
  }

  const updateLanguage = async values => {
    const { language, ...rest } = values

    if (!rest.standardised && translationFile) {
      await onTranslationsUpload(translationFile, JSON.parse(language).code)

      setTranslationFile(null)

      const languageConfig = languages.map(l => {
        if (JSON.stringify(l) === language) {
          return { ...l, ...rest }
        }

        return l
      })

      onLanguagesUpdate(languageConfig)
    } else {
      const languageConfig = languages.map(l => {
        if (JSON.stringify(l) === language) {
          if (rest.standardised) {
            return {
              ...l,
              ...rest,
              name: l.standard.name,
              flagCode: l.standard.flagCode,
            }
          }

          return { ...l, ...rest }
        }

        return l
      })

      onLanguagesUpdate(languageConfig)
    }
  }

  const removeLanguage = async code => {
    const languageConfig = languages.filter(l => l.code !== code)
    onLanguagesUpdate(languageConfig)
  }

  const languageItems = languages.map(l => {
    return {
      key: l.code,
      label: (
        <StyledControlWrapper>
          <span>{l.name}</span>
          <span>
            (
            {l.enabled
              ? t('availableLanguages.state.enabled')
              : t('availableLanguages.state.disabled')}
            )
          </span>
        </StyledControlWrapper>
      ),
      children: (
        <Form name={l.name} onFinish={updateLanguage}>
          <StyledLanguageStack>
            <StyledControlWrapper>
              <span style={{ textTransform: 'capitalize' }}>
                {t('availableLanguages.enabled')}
              </span>
              <Form.Item
                initialValue={l.enabled}
                name="enabled"
                valuePropName="checked"
              >
                <Switch
                  data-test="admindb-en-switch"
                  disabled={
                    l.enabled &&
                    languages.filter(lng => lng.enabled).length === 1
                  }
                />
              </Form.Item>
              <DescriptionParagraph id={`desc-name-${l.name}`}>
                {t('availableLanguages.enabled.explanation')}
              </DescriptionParagraph>
            </StyledControlWrapper>
            {!!l.standard && (
              <StyledControlWrapper id="std-wrapper">
                <span style={{ textTransform: 'capitalize' }}>
                  {t('availableLanguages.standardised')}
                </span>
                <Form.Item
                  initialValue={l.standardised}
                  name="standardised"
                  valuePropName="checked"
                >
                  <Switch
                    aria-describedby={`desc-standard-${l.standard.name}`}
                    data-modified={!l.standardised}
                    data-test="admindb-standartized-switch"
                  />
                </Form.Item>
                <DescriptionParagraph id={`desc-standard-${l.standard.name}`}>
                  {t('availableLanguages.standardised.explanation')}
                </DescriptionParagraph>
              </StyledControlWrapper>
            )}

            <StyledControlWrapper>
              <label htmlFor={`name-${l.name}`}>
                {t('availableLanguages.customised.languageLabel')}
              </label>
              <Form.Item
                initialValue={l.name}
                name="name"
                rules={[
                  {
                    required: true,
                    message: t(
                      'availableLanguages.customised.languageLabel.error.noValue',
                    ),
                  },
                ]}
              >
                <Input
                  aria-describedby={`desc-name-${l.name}`}
                  data-test="admindb-engName-input"
                  id={`name-${l.name}`}
                  type="text"
                />
              </Form.Item>
              <DescriptionParagraph id={`desc-name-${l.name}`}>
                {t('availableLanguages.customised.languageLabel.explanation')}
              </DescriptionParagraph>
            </StyledControlWrapper>
            <StyledControlWrapper>
              <label htmlFor={`flag-code-${l.flagCode}`}>
                {t('availableLanguages.customised.flagCode')}
              </label>
              <Form.Item
                initialValue={l.flagCode}
                name="flagCode"
                rules={[
                  {
                    required: true,
                    message: t(
                      'availableLanguages.customised.flagCode.error.noValue',
                    ),
                  },
                ]}
              >
                <Input
                  aria-describedby={`desc-flag-code-${l.flagCode}`}
                  data-test="admindb-engFlag-input"
                  id={`flag-code-${l.flagCode}`}
                  type="text"
                />
              </Form.Item>
              <DescriptionParagraph id={`desc-flag-code-${l.flagCode}`}>
                <Trans
                  components={{
                    ref: (
                      <a
                        href="https://www.iso.org/obp/ui/#search/code/"
                        rel="noreferrer"
                        target="_blank"
                      />
                    ),
                  }}
                  i18nKey="pages.admin.availableLanguages.customised.flagCode.explanation"
                />
              </DescriptionParagraph>
            </StyledControlWrapper>
            <StyledControlWrapper>
              <Form.Item
                getValueFromEvent={normFile}
                label={t('availableLanguages.customised.uploadInstructions')}
                valuePropName="fileList"
              >
                <StyledUpload
                  accept=".json"
                  beforeUpload={() => false}
                  data-test="admindb-engStringsUpload-btn"
                  maxCount={1}
                  onChange={({ file }) => setTranslationFile(file)}
                >
                  <UploadBtn>+</UploadBtn>
                </StyledUpload>
              </Form.Item>
            </StyledControlWrapper>
            <a
              href={`${serverUrl}/languages/${l.code}.json`}
              rel="noreferrer"
              target="_blank"
            >
              {t('availableLanguages.actions.downloadStrings')}
            </a>
            <StyledControlWrapper id="lang-form-submit">
              <StyledButtonGroup>
                {!l.standard ? (
                  <Button
                    data-test="admindb-removeLang-btn"
                    onClick={() => removeLanguage(l.code)}
                    status="danger"
                  >
                    {t('availableLanguages.actions.remove')}
                  </Button>
                ) : null}
                <Form.Item>
                  <Button data-test="admindb-update-btn" htmlType="submit">
                    {t('availableLanguages.actions.update')}
                  </Button>
                </Form.Item>
              </StyledButtonGroup>
            </StyledControlWrapper>
            <Form.Item hidden initialValue={JSON.stringify(l)} name="language">
              <Input type="text" />
            </Form.Item>
          </StyledLanguageStack>
        </Form>
      ),
    }
  })

  return (
    <AdminWrapper>
      <StyledCenter>
        <h1>{t('title')}</h1>
        <Divider />
        {/* ai integration */}
        <h2>{t('aiIntegration.heading')}</h2>
        <StyledControlWrapper>
          <ChatGPTAPIKeyWrapper>
            <Form
              form={apiKeyForm}
              layout="vertical"
              onFinish={handleChatGPTKeyUpdate}
              requiredMark={false}
            >
              <StyledFormItem
                label={t('aiIntegration.supplier')}
                layout="horizontal"
                name="aiOn"
              >
                <Switch
                  data-test="admindb-ai-switch"
                  defaultChecked={aiEnabled}
                  loading={paramsLoading}
                  onChange={setEnableAI}
                />
              </StyledFormItem>
              <Form.Item
                label={t('aiIntegration.apiKey')}
                name="apiKey"
                rules={[
                  {
                    required: enableAI && true,
                    message: t('aiIntegration.apiKey.error.noValue'),
                  },
                ]}
              >
                <Input
                  data-test="admindb-aikey-input"
                  disabled={!enableAI}
                  placeholder={t('aiIntegration.apiKey.placeholder')}
                />
              </Form.Item>
              <div>
                <Button
                  data-test="admindb-updateKey-btn"
                  htmlType="submit"
                  loading={keyUpdateResult?.loading}
                >
                  {t('aiIntegration.updateKey')}
                </Button>
                <UpdateResult $success={keyUpdateResult?.success} role="status">
                  {keyUpdateResult?.message && (
                    <>
                      {keyUpdateResult?.success ? (
                        <CheckOutlined />
                      ) : (
                        <CloseOutlined />
                      )}

                      {keyUpdateResult?.message}
                    </>
                  )}
                </UpdateResult>
              </div>
            </Form>
          </ChatGPTAPIKeyWrapper>
        </StyledControlWrapper>
        <Divider />
        {/* downloads, flax and lulu integrations */}
        <h2>{t('publishing.heading')}</h2>
        <Stack style={{ '--space': '2rem' }}>
          <h3>{t('downloads.heading')}</h3>
          <Stack style={{ '--space': '1rem' }}>
            <StyledControlWrapper>
              <span>{t('downloads.pdf')}</span>
              <Switch
                checked={exportOptions?.pdfDownload?.enabled}
                data-test="admindb-dwPDF-switch"
                loading={paramsLoading}
                onChange={val => exportConfigUpdate(val, 'pdfDownload')}
              />
            </StyledControlWrapper>
            <StyledControlWrapper>
              <span>{t('downloads.epub')}</span>
              <Switch
                checked={exportOptions?.epubDownload?.enabled}
                data-test="admindb-dwEPUB-switch"
                loading={paramsLoading}
                onChange={val => exportConfigUpdate(val, 'epubDownload')}
              />
            </StyledControlWrapper>
          </Stack>
          <h3>{t('integrations.heading')}</h3>
          <StyledControlWrapper>
            <span>{t('integrations.flax')}</span>
            <Switch
              checked={exportOptions?.webPublish?.enabled}
              data-test="admindb-pubWeb-switch"
              loading={paramsLoading}
              onChange={val => exportConfigUpdate(val, 'webPublish')}
            />
            {exportOptions?.webPublish?.enabled && (
              <StyledCollapse
                ghost
                items={[
                  {
                    key: '1',
                    label: 'Flax settings',
                    children: (
                      <Stack>
                        <p style={{ gridColumn: 'span 2' }}>
                          {t('integrations.flax.explanation')}
                        </p>
                        <StyledControlWrapper>
                          <span>
                            {t('integrations.flax.downloadOptions.pdf')}
                          </span>
                          <Switch
                            checked={exportOptions?.webPdfDownload?.enabled}
                            data-test="admindb-pubPDF-switch"
                            loading={paramsLoading}
                            onChange={val =>
                              exportConfigUpdate(val, 'webPdfDownload')
                            }
                          />
                        </StyledControlWrapper>
                        <StyledControlWrapper>
                          <span>
                            {t('integrations.flax.downloadOptions.epub')}
                          </span>
                          <Switch
                            checked={exportOptions?.webEpubDownload?.enabled}
                            data-test="admindb-pubEPUB-switch"
                            loading={paramsLoading}
                            onChange={val =>
                              exportConfigUpdate(val, 'webEpubDownload')
                            }
                          />
                        </StyledControlWrapper>
                        <p style={{ gridColumn: 'span 2' }}>
                          {t('integrations.flax.customize.info')}
                        </p>
                        <StyledControlWrapper>
                          <span>{t('integrations.flax.customize.label')}</span>
                          <Switch
                            checked={exportOptions?.webCustomHTML?.enabled}
                            data-test="admindb-pubEPUB-switch"
                            loading={paramsLoading}
                            onChange={val =>
                              exportConfigUpdate(val, 'webCustomHTML')
                            }
                          />
                        </StyledControlWrapper>
                      </Stack>
                    ),
                  },
                ]}
              />
            )}
          </StyledControlWrapper>
        </Stack>
        <Divider />
        {/* translations */}
        <h2>{t('availableLanguages.heading')}</h2>
        <Stack style={{ '--space': '1rem' }}>
          <StyledCollapse
            accordion
            destroyInactivePanel
            ghost
            items={languageItems}
            key={JSON.stringify(languages)}
          />

          {newLanguage ? (
            <LanguageWrapper id="new">
              <Form form={newLanguageForm}>
                <StyledLanguageStack>
                  <StyledControlWrapper>
                    <label htmlFor="name-new">
                      {t('availableLanguages.customised.languageLabel')}:
                    </label>
                    <Form.Item
                      name="name"
                      rules={[
                        {
                          required: true,
                          message: t(
                            'availableLanguages.customised.languageLabel.error.noValue',
                          ),
                        },
                      ]}
                    >
                      <Input
                        aria-describedby="desc-name-new"
                        data-test="admindb-newLangName-input"
                        id="name-new"
                        type="text"
                      />
                    </Form.Item>
                    <DescriptionParagraph id="desc-name-new">
                      {t(
                        'availableLanguages.customised.languageLabel.explanation',
                      )}
                    </DescriptionParagraph>
                  </StyledControlWrapper>
                  <StyledControlWrapper>
                    <label htmlFor="flag-code-new">
                      {t('availableLanguages.customised.flagCode')}:
                    </label>
                    <Form.Item
                      name="flagCode"
                      rules={[
                        {
                          required: true,
                          message: t(
                            'availableLanguages.customised.flagCode.error.noValue',
                          ),
                        },
                      ]}
                    >
                      <Input
                        aria-describedby="desc-flag-code-new"
                        data-test="admindb-newLangFlag-input"
                        id="flag-code-new"
                        type="text"
                      />
                    </Form.Item>
                    <DescriptionParagraph id="desc-flag-code-new">
                      <Trans
                        components={{
                          ref: (
                            <a
                              href="https://www.iso.org/obp/ui/#search/code/"
                              rel="noreferrer"
                              target="_blank"
                            />
                          ),
                        }}
                        i18nKey="pages.admin.availableLanguages.customised.flagCode.explanation"
                      />
                    </DescriptionParagraph>
                  </StyledControlWrapper>
                  <StyledControlWrapper>
                    <Form.Item
                      getValueFromEvent={normFile}
                      label={t(
                        'availableLanguages.customised.uploadInstructions',
                      )}
                      valuePropName="fileList"
                    >
                      <StyledUpload
                        accept=".json"
                        beforeUpload={() => false}
                        data-test="admindb-uploadStrings-btn"
                        maxCount={1}
                        onChange={({ file }) => setTranslationFile(file)}
                      >
                        <UploadBtn>+</UploadBtn>
                      </StyledUpload>
                    </Form.Item>
                  </StyledControlWrapper>
                </StyledLanguageStack>
              </Form>
            </LanguageWrapper>
          ) : null}
          <div>
            {!newLanguage ? (
              <Button
                data-test="admindb-addNewLang-btn"
                onClick={() => setNewLanguage(true)}
              >
                {t('availableLanguages.actions.addNew')}
              </Button>
            ) : (
              <>
                <Button
                  data-test="admindb-cancelNewLang-btn"
                  onClick={() => setNewLanguage(false)}
                >
                  {t('cancel', { keyPrefix: 'pages.common.actions' })}
                </Button>{' '}
                <Button
                  data-test="admindb-saveNewLang-btn"
                  onClick={addLanguage}
                >
                  {' '}
                  {t('availableLanguages.actions.save')}
                </Button>
              </>
            )}
          </div>
        </Stack>
        <Divider />
        {/* terms and conditions */}
        <TCHeader>{t('termsAndConditions.heading')}</TCHeader>
        <p>{t('termsAndConditions.explanation')}</p>
        <TCWrapper>
          <Wax
            autoFocus={false}
            config={simpleConfig}
            id="termsAndConditionsEditor"
            key={termsAndConditions}
            layout={SimpleLayout}
            ref={waxRef}
            value={termsAndConditions}
          />
          <div>
            <Button
              data-test="admindb-updateTC-btn"
              onClick={udpateTermsAndConditions}
            >
              {t('termsAndConditions.update')}
            </Button>
            <UpdateResult $success={tcUpdateResult?.success} role="status">
              {tcUpdateResult?.message && (
                <>
                  {tcUpdateResult?.success ? (
                    <CheckOutlined />
                  ) : (
                    <CloseOutlined />
                  )}

                  {tcUpdateResult?.message}
                </>
              )}
            </UpdateResult>
          </div>
        </TCWrapper>
      </StyledCenter>
    </AdminWrapper>
  )
}

AdminDashboard.propTypes = {
  aiEnabled: PropTypes.bool,
  // luluToggleConfig: PropTypes.func,
  // luluUpdateConfig: PropTypes.func,
  luluConfig: PropTypes.shape(),
  paramsLoading: PropTypes.bool,
  termsAndConditions: PropTypes.string,
  onTCUpdate: PropTypes.func,
  chatGptApiKey: PropTypes.string,
  onChatGPTKeyUpdate: PropTypes.func,
  exportOptions: PropTypes.shape(),
  exportConfigUpdate: PropTypes.func,
  onLanguagesUpdate: PropTypes.func,
  onTranslationsUpload: PropTypes.func,
  languages: PropTypes.arrayOf(PropTypes.shape()),
}

AdminDashboard.defaultProps = {
  aiEnabled: false,
  // luluToggleConfig: null,
  // luluUpdateConfig: null,
  luluConfig: null,
  paramsLoading: false,
  termsAndConditions: '',
  onTCUpdate: null,
  chatGptApiKey: '',
  onChatGPTKeyUpdate: null,
  exportOptions: {},
  exportConfigUpdate: null,
  onLanguagesUpdate: null,
  onTranslationsUpload: null,
  languages: [],
}

export default AdminDashboard
