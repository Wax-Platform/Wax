import React, { useState } from 'react'
import styled from 'styled-components'
import { faker } from '@faker-js/faker'
import camelCase from 'lodash/camelCase'

import { PreviewSettings } from '../../app/ui/preview'
import { defaultProfile } from '../../app/pages/Exporter.page'
import thumbnails from './static'

const thumbnailsAsArray = Object.keys(thumbnails).map(key => thumbnails[key])

const profileData = [
  {
    label: 'Custom profile',
    value: 'custom',
    format: 'epub',
    size: '6x9',
    content: ['includeTitlePage', 'includeCopyrights', 'includeTOC'],
    template: '4',
    isbn: '978-1-23-456789-3',
    synced: false,
    lastSynced: null,
    projectId: null,
    projectUrl: null,
  },
  {
    label: 'Special profile',
    value: 'special',
    format: 'pdf',
    size: '5.5x8.5',
    content: ['includeTitlePage', 'includeCopyrights'],
    template: '2',
    isbn: null,
    synced: true,
    lastSynced: new Date().toString(),
    projectId: 'abcd1234',
    projectUrl: 'https://lulu.com',
  },
]

const templateData = Array.from(Array(10)).map((_, j) => {
  return {
    id: String(j + 1),
    // imageUrl:
    //   'https://fastly.picsum.photos/id/11/82/100.jpg?hmac=solY9YT1h0M-KJfh8WKXqPfbFygW52ideb5Hf1VCKgc',
    imageUrl: thumbnailsAsArray[j],
    isSelected: false,
    name: faker.lorem.word(),
  }
})

const isbnData = [
  {
    isbn: '978-1-23-456789-0',
    label: 'Hard cover',
  },
  {
    isbn: '978-1-23-456789-1',
    label: '',
  },
  {
    isbn: '978-1-23-456789-2',
    label: 'Soft cover',
  },
  {
    isbn: '978-1-23-456789-3',
    label: 'EPub',
  },
]

const Wrapper = styled.div`
  border: 1px solid gainsboro;
  height: 800px;
  max-width: 800px;
`

const fakeCall = fn => {
  return new Promise(resolve => {
    setTimeout(() => {
      const res = fn()
      resolve(res)
    }, 700)
  })
}

export const Base = () => {
  const [profiles, setProfiles] = useState(profileData)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const [currentOptions, setCurrentOptions] = useState({
    format: 'pdf',
    size: '8.5x11',
    content: [],
    template: templateData[0].id,
    isbn: null,
    zoom: 1,
    spread: 'double',
  })

  const handleClickCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleOptionsChange = vals => {
    setCurrentOptions({
      ...currentOptions,
      ...vals,
    })
  }

  const handleConnectToLulu = () => {}

  const handleClickDeleteProfile = profileValue => {
    return fakeCall(() => {}).then(() => {
      const newProfiles = profiles.filter(p => p.value !== profileValue)
      setProfiles(newProfiles)
    })
  }

  const handleClickDownload = options => {
    return fakeCall(() => {}).then(() => {
      /* eslint-disable-next-line no-console */
      console.log(`Downloading with the following options`, options)
    })
  }

  const handleCreateProfile = (name, options) => {
    return fakeCall(() => {
      const newProfile = {
        label: name,
        value: camelCase(name),
        ...options,
      }

      setProfiles([...profiles, newProfile])

      return newProfile
    })
  }

  const handleUpdateProfile = (profileValue, options) => {
    return fakeCall(() => {
      const newProfiles = profiles.map(p => {
        if (p.value === profileValue) {
          return {
            ...p,
            ...options,
          }
        }

        return p
      })

      setProfiles(newProfiles)
    })
  }

  const handleSendToLulu = (profileValue, options) => {
    /* eslint-disable-next-line no-console */
    console.log(
      `Sending ${profileValue} with the following options to Lulu`,
      options,
    )
  }

  const handleProfileRename = (profileValue, name) => {
    return fakeCall(() => {
      const newProfiles = profiles.map(p => {
        if (p.value === profileValue) {
          return {
            ...p,
            label: name,
          }
        }

        return p
      })

      setProfiles(newProfiles)
    })
  }

  const handleProfileChange = () => {}

  return (
    <Wrapper>
      <PreviewSettings
        canModify
        createProfile={handleCreateProfile}
        currentOptions={currentOptions}
        defaultProfile={defaultProfile}
        deleteProfile={handleClickDeleteProfile}
        download={handleClickDownload}
        isbns={isbnData}
        isCollapsed={isCollapsed}
        isDownloadButtonDisabled={false}
        isUserConnectedToLulu
        loadingPreview={false}
        onClickCollapse={handleClickCollapse}
        onClickConnectToLulu={handleConnectToLulu}
        onOptionsChange={handleOptionsChange}
        onProfileChange={handleProfileChange}
        optionsDisabled={false}
        profiles={profiles}
        renameProfile={handleProfileRename}
        selectedProfile={profiles[0].value}
        sendToLulu={handleSendToLulu}
        templates={templateData}
        updateProfileOptions={handleUpdateProfile}
      />
    </Wrapper>
  )
}

export default {
  component: PreviewSettings,
  title: 'Preview/PreviewSettings',
}
