import React, { useState } from 'react'
import { faker } from '@faker-js/faker'
import styled from 'styled-components'
import camelCase from 'lodash/camelCase'

import { Preview } from '../../app/ui'
import { defaultProfile } from '../../app/pages/Exporter.page'
import thumbnails from './static'

const thumbnailsAsArray = Object.keys(thumbnails).map(key => thumbnails[key])

const Wrapper = styled.div`
  border: 1px solid gainsboro;
  height: 700px;
`

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
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [loadingExport] = useState(false)

  const [currentOptions, setCurrentOptions] = useState({
    format: 'pdf',
    size: '8.5x11',
    content: [],
    template: templateData[0].id,
    isbn: null,
    zoom: 1,
    spread: 'double',
  })

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

  const handleUpdateProfileOptions = (profileValue, options) => {
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

  const handleRenameProfile = (profileValue, name) => {
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

  const handleDeleteProfile = profileValue => {
    return fakeCall(() => {}).then(() => {
      const newProfiles = profiles.filter(p => p.value !== profileValue)
      setProfiles(newProfiles)
    })
  }

  const handleDownload = options => {
    return fakeCall(() => {}).then(() => {
      /* eslint-disable-next-line no-console */
      console.log(`Downloading with the following options`, options)
    })
  }

  const handleConnectToLulu = () => {
    /* eslint-disable-next-line no-console */
    console.log('Connecting user to Lulu')
  }

  const handleSendToLulu = (profileValue, options) => {
    /* eslint-disable-next-line no-console */
    console.log(
      `Sending ${profileValue} with the following options to Lulu`,
      options,
    )
  }

  const handleOptionsChange = vals => {
    setLoadingPreview(true)

    fakeCall(() => {
      setLoadingPreview(false)
      setCurrentOptions({
        ...currentOptions,
        ...vals,
      })
    })
  }

  const handleProfileChange = () => {}

  return (
    <Wrapper>
      <Preview
        canModify
        connectToLulu={handleConnectToLulu}
        createProfile={handleCreateProfile}
        currentOptions={currentOptions}
        defaultProfile={defaultProfile}
        deleteProfile={handleDeleteProfile}
        download={handleDownload}
        isbns={isbnData}
        isDownloadButtonDisabled={false}
        isUserConnectedToLulu
        loadingExport={loadingExport}
        loadingPreview={loadingPreview}
        onOptionsChange={handleOptionsChange}
        onProfileChange={handleProfileChange}
        previewLink="https://coko.foundation"
        profiles={profiles}
        renameProfile={handleRenameProfile}
        selectedProfile={profiles[0].value}
        sendToLulu={handleSendToLulu}
        templates={templateData}
        updateProfileOptions={handleUpdateProfileOptions}
      />
    </Wrapper>
  )
}

export default {
  component: Preview,
  title: 'Preview/Preview',
}
