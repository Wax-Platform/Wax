/* eslint-disable react/prop-types */
import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Switch, Form } from 'antd'
import { useMutation, useSubscription } from '@apollo/client'
import { useCurrentUser, grid } from '@coko/client'
import { DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

import {
  BOOK_SETTINGS_UPDATED_SUBSCRIPTION,
  UPDATE_SETTINGS,
} from '../../../graphql'
import { isAdmin, isOwner } from '../../../helpers/permissions'
import { Button, Center, Input, Stack, Box } from '../../common'
import ConfigurableEditorSettings from './ConfigurableEditorSettings'
import configWithAI from '../../wax/config/configWithAI'

const Indented = styled.div`
  padding-inline-start: ${grid(3)};
`

const SettingsWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
`

const SettingTitle = styled.strong``

const SettingInfo = styled.div`
  display: flex;
  justify-content: space-between;
`

const ButtonsContainer = styled.div`
  display: flex;
  gap: ${grid(4)};
  justify-content: right;
  margin-top: 36px;
`

const StyledButton = styled(Button)`
  box-shadow: none;
  padding: 0 2%;
`

const StyledForm = styled(Form)`
  display: flex;
  gap: ${grid(4)};
  margin-top: 24px;
`

const StyledFormCustomTag = styled(Form)`
  align-items: end;
  display: flex;
  gap: ${grid(4)};
`

const StyledFormItem = styled(Form.Item)`
  margin-block-end: 0;
  width: 100%;

  label {
    font-weight: bold;

    &::before {
      /* stylelint-disable-next-line declaration-no-important */
      display: none !important;
    }
  }
`

const StyledFormButton = styled(Button)`
  height: fit-content;
`

const StyledList = styled.ul`
  list-style-type: none;
  padding-inline-start: 0;
`

const StyledListItem = styled.li`
  display: flex;
  justify-content: space-between;
  margin: 0 0 0 ${grid(1)};
`

const StyledListButton = styled(Button)`
  background-color: unset;
  border: none;
  color: red;
`

const CustomTagTypeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const CustomTagList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  margin-block-start: 8px;
  row-gap: 8px;
`

const CustomTagItemWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-flow: row;
  margin-right: 10px;
`

const CustomTagItemLabel = styled.span`
  margin-right: 5px;
`

const SettingsForm = ({
  aiEnabled,
  bookId,
  bookSettings,
  refetchBookSettings,
  className,
  toggleInformation,
  toggleName,
}) => {
  const { t } = useTranslation(null, {
    keyPrefix: 'pages.common.header.bookSettingsModal',
  })

  const [form] = Form.useForm()
  const [blockForm] = Form.useForm()
  const [inlineForm] = Form.useForm()

  form.validateTrigger = ['onSubmit']

  const { currentUser } = useCurrentUser()

  const [isAiOn, setIsAiOn] = useState(bookSettings.aiOn)
  const [isAiPdfOn, setIsAiPdfOn] = useState(!!bookSettings.aiPdfDesignerOn)

  const [isCustomPromptsOn, setIsCustomPromptsOn] = useState(
    bookSettings.customPromptsOn,
  )

  const [isFreeTextPromptsOn, setIsFreeTextPromptsOn] = useState(
    !!bookSettings.freeTextPromptsOn,
  )

  const [prompts, setPrompts] = useState(bookSettings.customPrompts || [])

  const [isKnowledgeBaseOn, setIsKnowledgeBaseOn] = useState(
    !!bookSettings.knowledgeBaseOn,
  )

  const [isConfigurableEditorOn, setIsConfigurableEditorOn] = useState(
    !!bookSettings.configurableEditorOn,
  )

  const [waxConfig, setWaxConfig] = useState(
    bookSettings.configurableEditorConfig?.length > 0
      ? JSON.parse(bookSettings.configurableEditorConfig)
      : configWithAI,
  )

  const [customTags, setCustomTags] = useState(
    bookSettings.customTags?.length > 0
      ? JSON.parse(bookSettings.customTags)
      : [],
  )

  const blockInput = useRef(null)
  const inlineInput = useRef(null)

  // MUTATIONS SECTION START
  const [updateBookSettings, { loading: updateLoading }] = useMutation(
    UPDATE_SETTINGS,
    {
      onCompleted: () => {},
    },
  )

  useSubscription(BOOK_SETTINGS_UPDATED_SUBSCRIPTION, {
    variables: { id: bookId },
    fetchPolicy: 'network-only',
    onData: () => refetchBookSettings({ id: bookId }),
  })

  const handleUpdateBookSettings = async () => {
    // Both Free text and Custom prompts cannot be off
    // This check will throw a validation error to nudge user to add a prompt
    const inputPrompt = form.getFieldValue('prompt')

    const isPromptAdded = prompts.includes(inputPrompt?.trim())

    if (inputPrompt?.trim() && !isPromptAdded) {
      form.setFields([
        {
          name: 'prompt',
          errors: [t('add_prompt_missing')],
        },
      ])
      return
    }

    if (isAiOn && !isFreeTextPromptsOn && !prompts.length) {
      form.validateFields(['prompt'])
      return
    }

    await updateBookSettings({
      variables: {
        bookId,
        aiOn: isAiOn,
        aiPdfDesignerOn: isAiPdfOn,
        freeTextPromptsOn: isFreeTextPromptsOn,
        customPrompts: prompts,
        customPromptsOn: isCustomPromptsOn,
        knowledgeBaseOn: isKnowledgeBaseOn,
        customTags: JSON.stringify(customTags),
        configurableEditorOn: isConfigurableEditorOn,
        configurableEditorConfig: JSON.stringify(waxConfig),
      },
    })

    // setTimeout(() => {
      toggleInformation(toggleName)
    // }, 500)
  }

  const saveWaxConfig = config => {
    setWaxConfig(config)
  }

  const toggleAiOn = toggle => {
    setIsAiOn(toggle)

    if (isKnowledgeBaseOn && !toggle) {
      setIsKnowledgeBaseOn(false)
    }
  }

  const handleDeletePrompt = prompt => {
    // Remove the prompt from the list
    const customPrompts = prompts.filter(item => item !== prompt)
    setPrompts(customPrompts)
  }

  const handleAddPrompt = values => {
    const { prompt } = values

    if (prompts.includes(prompt.trim())) {
      form.setFields([
        {
          name: 'prompt',
          errors: [t('add_prompt_duplicate')],
        },
      ])
      return
    }

    // Avoid adding duplicate prompts
    const customPrompts = [...new Set([...prompts, prompt.trim()])]

    setPrompts(customPrompts)
    form.setFieldsValue({ prompt: '' })
  }

  const handleAddCustomTagBlock = values => {
    const { block } = values
    setCustomTags([...customTags, { label: block, tagType: 'block' }])
    blockForm.setFieldsValue({ block: '' })
    blockInput?.current?.focus()
  }

  const handleAddCustomTagInline = values => {
    const { inline } = values
    setCustomTags([...customTags, { label: inline, tagType: 'inline' }])
    inlineForm.setFieldsValue({ inline: '' })
    inlineInput?.current?.focus()
  }

  const handleDeleteCustomTag = (tag, type) => {
    setCustomTags(
      customTags.filter(customTag => {
        return !(customTag.label === tag.label && customTag.tagType === type)
      }),
    )
  }

  const toggleFreePromptSwitch = toggle => {
    setIsFreeTextPromptsOn(toggle)

    // We can have both free-text and custom prompts off
    if (!isCustomPromptsOn && toggle === false) {
      setIsCustomPromptsOn(true)
    }

    if (isKnowledgeBaseOn && !toggle) {
      setIsKnowledgeBaseOn(false)
    }
  }

  const toggleCustomPromptsSwitch = toggle => {
    setIsCustomPromptsOn(toggle)

    // We can have both free-text and custom prompts off
    if (!isFreeTextPromptsOn && !toggle) {
      setIsFreeTextPromptsOn(true)
    }
  }

  const toggleKnowledgeBase = value => {
    setIsKnowledgeBaseOn(value)

    if (value === true && !isAiOn) {
      setIsAiOn(true)
    }

    if (value === true && !isFreeTextPromptsOn) {
      setIsFreeTextPromptsOn(true)
    }
  }

  const toggleConfigurableEditor = value => {
    setIsConfigurableEditorOn(!isConfigurableEditorOn)
  }

  const canChangeSettings = isAdmin(currentUser) || isOwner(bookId, currentUser)

  const blockTags = customTags.filter(tag => {
    return tag.tagType === 'block'
  })

  const inlineTags = customTags.filter(tag => {
    return tag.tagType === 'inline'
  })

  return (
    <Box className={className}>
      <Center style={{ 'margin-block-end': '5em' }}>
        <h1>Editor Settings</h1>
        <Stack>
          <SettingsWrapper style={{ marginTop: '24px' }}>
            <div>
              <SettingTitle>{t('aiWriting.promptUse')}</SettingTitle>
              <SettingInfo>{t('aiWriting.promptUse.detail')}</SettingInfo>
            </div>
            <Switch
              checked={aiEnabled && isAiOn}
              data-test="settings-toggleAI-switch"
              disabled={updateLoading || !canChangeSettings || !aiEnabled}
              onChange={toggleAiOn}
            />
          </SettingsWrapper>

          {isAiOn && aiEnabled && (
            <Indented>
              <Stack>
                <SettingsWrapper>
                  <SettingInfo>
                    <SettingTitle>{t('aiWriting.freeText')}</SettingTitle>
                  </SettingInfo>
                  <Switch
                    checked={aiEnabled && isFreeTextPromptsOn}
                    data-test="settings-freeTextPrompt-switch"
                    disabled={updateLoading || !canChangeSettings || !aiEnabled}
                    onChange={e => toggleFreePromptSwitch(e)}
                  />
                </SettingsWrapper>

                <SettingsWrapper>
                  <SettingInfo>
                    <SettingTitle>{t('aiWriting.customPrompts')}</SettingTitle>
                  </SettingInfo>
                  <Switch
                    checked={aiEnabled && isCustomPromptsOn}
                    data-test="settings-customPrompt-switch"
                    disabled={updateLoading || !canChangeSettings || !aiEnabled}
                    onChange={e => toggleCustomPromptsSwitch(e)}
                  />

                  {isCustomPromptsOn && (
                    <Stack style={{ width: '100%' }}>
                      {canChangeSettings && (
                        <StyledForm form={form} onFinish={handleAddPrompt}>
                          <StyledFormItem
                            name="prompt"
                            rules={[
                              {
                                required: true,
                                message: t(
                                  'aiWriting.customPrompts.input.errors.noValue',
                                ),
                                validator: (_, value) => {
                                  if (!value.trim().length) {
                                    return Promise.reject()
                                  }

                                  return Promise.resolve()
                                },
                              },
                            ]}
                          >
                            <Input
                              placeholder={t('aiWriting.customPrompts.input')}
                            />
                          </StyledFormItem>
                          <StyledFormButton
                            disabled={updateLoading || !canChangeSettings}
                            htmlType="submit"
                          >
                            {t('aiWriting.customPrompts.actions.add')}
                          </StyledFormButton>
                        </StyledForm>
                      )}

                      <StyledList>
                        {prompts.map(prompt => (
                          <StyledListItem key={prompt}>
                            {prompt}
                            <StyledListButton
                              disabled={updateLoading || !canChangeSettings}
                              htmlType="submit"
                              onClick={() => handleDeletePrompt(prompt)}
                            >
                              <DeleteOutlined />
                            </StyledListButton>
                          </StyledListItem>
                        ))}
                      </StyledList>
                    </Stack>
                  )}
                </SettingsWrapper>
              </Stack>
            </Indented>
          )}

          <SettingsWrapper>
            <div>
              <SettingTitle>{t('aiDesigner')}</SettingTitle>
              <SettingInfo>{t('aiDesigner.detail')}.</SettingInfo>
            </div>
            <Switch
              checked={aiEnabled && isAiPdfOn}
              data-test="settings-AIDesigner-switch"
              disabled={updateLoading || !canChangeSettings || !aiEnabled}
              onChange={e => setIsAiPdfOn(e)}
            />
          </SettingsWrapper>

          <SettingsWrapper style={{ flexWrap: 'nowrap' }}>
            <div>
              <SettingTitle>{t('knowledgeBase')}</SettingTitle>
              <SettingInfo>{t('knowledgeBase.detail')}</SettingInfo>
            </div>
            <Switch
              checked={aiEnabled && isKnowledgeBaseOn}
              data-test="settings-kb-switch"
              disabled={updateLoading || !canChangeSettings || !aiEnabled}
              onChange={e => toggleKnowledgeBase(e)}
            />
          </SettingsWrapper>

          <SettingsWrapper>
            <Stack style={{ '--space': '16px', width: '100%' }}>
              <SettingTitle>Custom Tags</SettingTitle>
              <CustomTagTypeWrapper>
                <Stack style={{ '--space': '8px' }}>
                  <StyledFormCustomTag
                    form={blockForm}
                    layout="vertical"
                    onFinish={handleAddCustomTagBlock}
                  >
                    <StyledFormItem
                      label="Custom Tag Block"
                      name="block"
                      rules={[
                        {
                          required: true,
                          message: t('customTagsBlock.input.errors.noValue'),
                          validator: (_, value) => {
                            if (!value.trim().length) {
                              return Promise.reject()
                            }

                            return Promise.resolve()
                          },
                        },
                      ]}
                    >
                      <Input
                        placeholder={t('customTagsBlock.input')}
                        ref={blockInput}
                      />
                    </StyledFormItem>
                    <StyledFormButton
                      disabled={updateLoading || !canChangeSettings}
                      htmlType="submit"
                    >
                      {t('customTagsBlock.actions.add')}
                    </StyledFormButton>
                  </StyledFormCustomTag>
                  <CustomTagList>
                    {blockTags.map(tag => {
                      return (
                        <CustomTagItemWrapper key={tag.label}>
                          <CustomTagItemLabel>{tag.label}</CustomTagItemLabel>
                          <StyledListButton
                            disabled={updateLoading || !canChangeSettings}
                            htmlType="submit"
                            onClick={() => handleDeleteCustomTag(tag, 'block')}
                          >
                            <DeleteOutlined />
                          </StyledListButton>
                        </CustomTagItemWrapper>
                      )
                    })}
                  </CustomTagList>
                </Stack>
              </CustomTagTypeWrapper>
              <CustomTagTypeWrapper>
                <Stack style={{ '--space': '8px' }}>
                  <StyledFormCustomTag
                    form={inlineForm}
                    layout="vertical"
                    onFinish={handleAddCustomTagInline}
                  >
                    <StyledFormItem
                      label="Custom Tag Inline"
                      name="inline"
                      rules={[
                        {
                          required: true,
                          message: t('customTagsInline.input.errors.noValue'),
                          validator: (_, value) => {
                            if (!value.trim().length) {
                              return Promise.reject()
                            }

                            return Promise.resolve()
                          },
                        },
                      ]}
                    >
                      <Input
                        placeholder={t('customTagsInline.input')}
                        ref={inlineInput}
                      />
                    </StyledFormItem>
                    <StyledFormButton
                      disabled={updateLoading || !canChangeSettings}
                      htmlType="submit"
                    >
                      {t('customTagsInline.actions.add')}
                    </StyledFormButton>
                  </StyledFormCustomTag>
                  <CustomTagList>
                    {inlineTags.map(tag => {
                      return (
                        <CustomTagItemWrapper key={tag.label}>
                          <CustomTagItemLabel>{tag.label}</CustomTagItemLabel>
                          <StyledListButton
                            disabled={updateLoading || !canChangeSettings}
                            htmlType="submit"
                            onClick={() => handleDeleteCustomTag(tag, 'inline')}
                          >
                            <DeleteOutlined />
                          </StyledListButton>
                        </CustomTagItemWrapper>
                      )
                    })}
                  </CustomTagList>
                </Stack>
              </CustomTagTypeWrapper>
            </Stack>
          </SettingsWrapper>

          <SettingsWrapper>
            <div>
              <SettingTitle>{t('configurableEditor')}</SettingTitle>
              <SettingInfo>{t('configurableEditor.detail')}</SettingInfo>
            </div>
            <Switch
              checked={isConfigurableEditorOn}
              data-test="configurable-editor-switch"
              disabled={updateLoading || !canChangeSettings}
              onChange={e => toggleConfigurableEditor(e)}
            />
          </SettingsWrapper>
          {isConfigurableEditorOn && (
            <ConfigurableEditorSettings
              savedWaxConfig={waxConfig}
              saveWaxConfig={saveWaxConfig}
            />
          )}
          <ButtonsContainer>
            <StyledButton
              data-test="settings-save-btn"
              disabled={!canChangeSettings}
              htmlType="submit"
              loading={updateLoading}
              onClick={handleUpdateBookSettings}
              type="primary"
            >
              save and exit
            </StyledButton>
            <StyledButton
              data-test="settings-save-btn"
              disabled={!canChangeSettings}
              htmlType="submit"
              loading={updateLoading}
              onClick={() => {
                setTimeout(() => {
                  toggleInformation(toggleName)
                }, 500)
              }}
              type="primary"
            >
              exit without saving
            </StyledButton>
          </ButtonsContainer>
        </Stack>
      </Center>
    </Box>
  )
}

SettingsForm.propTypes = {
  aiEnabled: PropTypes.bool,
  bookId: PropTypes.string.isRequired,
  bookSettings: PropTypes.shape({
    aiOn: PropTypes.bool,
    aiPdfDesignerOn: PropTypes.bool,
    freeTextPromptsOn: PropTypes.bool,
    customPrompts: PropTypes.arrayOf(PropTypes.string),
    customPromptsOn: PropTypes.bool,
    knowledgeBaseOn: PropTypes.bool,
    configurableEditorOn: PropTypes.bool,
    configurableEditorConfig: PropTypes.arrayOf(PropTypes.string),
    customTags: PropTypes.arrayOf(PropTypes.string),
  }),
  refetchBookSettings: PropTypes.func.isRequired,
}

SettingsForm.defaultProps = {
  aiEnabled: false,
  bookSettings: {
    aiOn: false,
    aiPdfDesignerOn: false,
    freeTextPromptsOn: false,
    customPromptsOn: false,
    knowledgeBaseOn: false,
  },
}
export default SettingsForm
