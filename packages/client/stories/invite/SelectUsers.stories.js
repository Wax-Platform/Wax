import React, { useState } from 'react'
import { faker } from '@faker-js/faker'
import { SelectUsers } from '../../app/ui'
import { createData } from '../_helpers'

const usersCount = 10

async function fetchUserList(username) {
  return new Promise(resolve => {
    setTimeout(() => {
      const users = createData(usersCount, () => ({
        displayName: faker.name.fullName(),
        id: faker.datatype.uuid(),
      }))

      resolve(users)
    }, 1000)
  })
}

export const Base = props => {
  const [value, setValue] = useState([])

  const handleChange = newValue => {
    setValue(newValue)
  }

  return (
    <SelectUsers
      {...props}
      fetchOptions={fetchUserList}
      mode="multiple"
      noResultsSetter={() => {}}
      onChange={handleChange}
      placeholder="Email, comma separated"
      style={{ width: '100%' }}
      value={value}
    />
  )
}

Base.args = {
  canChangeAccess: true,
}

export default {
  component: SelectUsers,
  title: 'Invite/SelectUsers',
}
