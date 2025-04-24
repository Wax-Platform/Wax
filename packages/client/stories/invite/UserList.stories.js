/* eslint-disable no-console */
import React from 'react'
import { faker } from '@faker-js/faker'
import { UserList } from '../../app/ui/invite'
import { createData, randomPick } from '../_helpers'

const usersCount = 10

export const Base = () => {
  const handleChangeAccess = value => console.log('Change access: ', value)
  const handleRemoveAccess = value => console.log('Remove access: ', value)

  const ownerTeam = {
    id: faker.datatype.uuid(),
    members: createData(1, () => ({
      id: faker.datatype.uuid(),
      user: {
        displayName: faker.name.fullName(),
        id: faker.datatype.uuid(),
      },
      status: randomPick(['read', 'write']),
    })),
    role: 'owner',
  }

  const collaboratorTeam = {
    id: faker.datatype.uuid(),
    members: createData(usersCount, () => ({
      id: faker.datatype.uuid(),
      user: {
        displayName: faker.name.fullName(),
        id: faker.datatype.uuid(),
      },
      status: randomPick(['read', 'write']),
    })),
    role: 'collaborators',
  }

  return (
    <UserList
      bookTeams={[ownerTeam, collaboratorTeam]}
      loading={false}
      onChangeAccess={handleChangeAccess}
      onRemoveAccess={handleRemoveAccess}
    />
  )
}

export default {
  component: UserList,
  title: 'Invite/UserList',
}
