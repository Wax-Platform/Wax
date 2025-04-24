import React from 'react'
// import { lorem } from 'faker'

import Footer from '../../app/ui/preview/Footer'

const noop = () => {}

const successfulPromise = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 700)
  })
}

const unSuccessfulPromise = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject()
    }, 700)
  })
}

export const Base = () => {
  const handleClickDelete = successfulPromise
  const handleClickDownload = noop
  const createProfile = successfulPromise
  const updateProfile = successfulPromise

  return (
    <Footer
      canModify
      createProfile={createProfile}
      isDownloadButtonDisabled={false}
      isNewProfileSelected={false}
      isSaveDisabled={false}
      loadingPreview={false}
      onClickDelete={handleClickDelete}
      onClickDownload={handleClickDownload}
      updateProfile={updateProfile}
    />
  )
}

export const NewProfileSelected = () => {
  const handleClickDelete = successfulPromise
  const handleClickDownload = noop
  const createProfile = successfulPromise
  const updateProfile = successfulPromise

  return (
    <Footer
      canModify
      createProfile={createProfile}
      isDownloadButtonDisabled={false}
      isNewProfileSelected
      isSaveDisabled={false}
      loadingPreview={false}
      onClickDelete={handleClickDelete}
      onClickDownload={handleClickDownload}
      updateProfile={updateProfile}
    />
  )
}

export const FailingActions = () => {
  const handleClickDelete = unSuccessfulPromise
  const handleClickDownload = noop
  const createProfile = unSuccessfulPromise
  const updateProfile = unSuccessfulPromise

  return (
    <Footer
      canModify
      createProfile={createProfile}
      isDownloadButtonDisabled={false}
      isNewProfileSelected={false}
      isSaveDisabled={false}
      loadingPreview={false}
      onClickDelete={handleClickDelete}
      onClickDownload={handleClickDownload}
      updateProfile={updateProfile}
    />
  )
}

export const FailingActionsNewProfileSelected = () => {
  const handleClickDelete = unSuccessfulPromise
  const handleClickDownload = noop
  const createProfile = unSuccessfulPromise
  const updateProfile = unSuccessfulPromise

  return (
    <Footer
      canModify
      createProfile={createProfile}
      isDownloadButtonDisabled={false}
      isNewProfileSelected
      isSaveDisabled={false}
      loadingPreview={false}
      onClickDelete={handleClickDelete}
      onClickDownload={handleClickDownload}
      updateProfile={updateProfile}
    />
  )
}

export default {
  component: Footer,
  title: 'Preview/Footer',
}
