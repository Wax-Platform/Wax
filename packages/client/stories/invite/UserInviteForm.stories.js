/* eslint-disable no-console */
import React from 'react'
import { faker } from '@faker-js/faker'
import { find } from 'lodash'
import styled from 'styled-components'
import { UserInviteForm } from '../../app/ui'
import { Form } from '../../app/ui/common'
import { createData } from '../_helpers'

const FormWrapper = styled.div`
  display: flex;
  flex-direction: row;

  .ant-form-item {
    flex: 1;
  }
`

const usersCount = 10

async function fetchUserList(username) {
  return new Promise(resolve => {
    setTimeout(() => {
      const users = createData(usersCount, () => ({
        id: faker.datatype.uuid(),
        displayName: faker.name.fullName(),
      }))

      resolve(users)
    }, 1000)
  })
}

export const Base = props => {
  const [form] = Form.useForm()

  const handleInvite = values => {
    console.log('Invite: ', values)
    form.resetFields()
  }

  return (
    <FormWrapper>
      <UserInviteForm
        {...props}
        fetchOptions={fetchUserList}
        form={form}
        onInvite={handleInvite}
      />
    </FormWrapper>
  )
}

Base.args = {
  canChangeAccess: true,
}

const availableUsers = [...Array(10).keys()].map(index => ({
  id: faker.datatype.uuid(),
  displayName: `user${index}`,
}))

async function fetchMatchingUser(username) {
  return new Promise(resolve => {
    setTimeout(() => {
      const user = find(availableUsers, { displayName: username })
      const users = user ? [user] : []
      resolve(users)
    }, 1000)
  })
}

export const requireExactUserName = props => {
  const [form] = Form.useForm()

  const handleInvite = values => {
    console.log('Invite: ', values)
    form.resetFields()
    return true
  }

  return (
    <span>
      <FormWrapper>
        <UserInviteForm
          {...props}
          fetchOptions={fetchMatchingUser}
          form={form}
          onInvite={handleInvite}
        />
      </FormWrapper>
      (Available users: {availableUsers.map(u => u.displayName).join(', ')})
    </span>
  )
}

requireExactUserName.args = {
  canChangeAccess: true,
}

export default {
  component: UserInviteForm,
  title: 'Invite/UserInviteForm',
}
