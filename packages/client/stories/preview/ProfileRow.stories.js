/* eslint-disable no-console */

import React, { useState } from 'react'
import pick from 'lodash/pick'
// import { lorem } from 'faker'

import ProfileRow from '../../app/ui/preview/ProfileRow'
import { defaultProfile } from '../../app/pages/Exporter.page'

const profileData = [
  pick(defaultProfile, ['label', 'value']),
  {
    label: 'Custom profile',
    value: 'custom',
  },
  {
    label: 'Special profile',
    value: 'special',
  },
]

export const Base = () => {
  const [profiles, setProfiles] = useState(profileData)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const [selectedProfile, setSelectedProfile] = useState(
    profileData.find(p => p.value === 'special'),
  )

  const handleProfileRename = (profile, name) => {
    return new Promise(resolve => {
      const newProfiles = profiles.map(p => {
        if (p.value === profile) {
          return {
            value: p.value,
            label: name,
          }
        }

        return p
      })

      setProfiles(newProfiles)

      setTimeout(() => {
        resolve()
      }, 700)
    })
  }

  const handleClickCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleProfileChange = val => {
    setSelectedProfile(profileData.find(p => p.value === val))
  }

  return (
    <ProfileRow
      canModifyProfiles
      isCollapsed={isCollapsed}
      isNewProfileSelected={selectedProfile.value === defaultProfile.value}
      onClickCollapse={handleClickCollapse}
      onProfileChange={handleProfileChange}
      onProfileRename={handleProfileRename}
      profiles={profiles}
      selectedProfile={selectedProfile}
    />
  )
}

export default {
  component: ProfileRow,
  title: 'Preview/ProfileRow',
}
