/* eslint-disable no-console */
import React from 'react'
import { BookMetadataLocked } from '../../app/ui'

export const Base = props => {
  return (
    <BookMetadataLocked
      closeModal={() => {
        console.log('closeModal called')
      }}
      open
    />
  )
}

export default {
  component: BookMetadataLocked,
  title: 'BookMetadata/MetadataLocked',
}
