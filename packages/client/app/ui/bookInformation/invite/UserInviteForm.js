import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Space } from 'antd'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Button, Select, Form } from '../../common'
import SelectUsers from './SelectUsers'

const Wrapper = styled(Space)`
  padding: 12px 0;
  width: 100%;
`

const StyledSpace = styled(Space)`
  width: 100%;

  .ant-space-item:first-child {
    width: 100%;
  }

  .ant-space-item:first-child .ant-space-compact {
    width: 100%;
  }
`

const StretchedFormItem = styled(Form.Item)`
  margin-bottom: 0;
  width: 100%;
`

const StyledFormItem = styled(Form.Item)`
  margin-bottom: 0;
`

const UserInviteForm = ({ form, fetchOptions, onInvite, canChangeAccess }) => {
  const { t } = useTranslation(null, {
    keyPrefix: 'pages.common.header.shareModal',
  })

  const accessOptions = [
    {
      value: 'read',
      label: t('permissions.options.view'),
    },
    {
      value: 'write',
      label: t('permissions.options.edit'),
    },
  ]

  const [noAvailableUsers, setNoAvailableUsers] = useState(true)

  return (
    <Wrapper direction="vertical">
      <Form
        form={form}
        initialValues={{
          users: [],
          access: 'read',
        }}
        onFinish={values => {
          setNoAvailableUsers(onInvite(values))
        }}
      >
        <StyledSpace align="start">
          <Space.Compact>
            <StretchedFormItem name="users">
              <SelectUsers
                canChangeAccess={canChangeAccess}
                fetchOptions={fetchOptions}
                noResultsSetter={setNoAvailableUsers}
              />
            </StretchedFormItem>
            <StyledFormItem name="access">
              <Select disabled={!canChangeAccess} options={accessOptions} />
            </StyledFormItem>
          </Space.Compact>
          <Button
            data-test="modal-share-btn"
            disabled={noAvailableUsers || !canChangeAccess}
            htmlType="submit"
            type="primary"
          >
            {t('actions.share')}
          </Button>
        </StyledSpace>
      </Form>
    </Wrapper>
  )
}

UserInviteForm.propTypes = {
  /* eslint-disable-next-line react/forbid-prop-types */
  form: PropTypes.object.isRequired,
  fetchOptions: PropTypes.func.isRequired,
  onInvite: PropTypes.func.isRequired,
  canChangeAccess: PropTypes.bool.isRequired,
}

export default UserInviteForm
