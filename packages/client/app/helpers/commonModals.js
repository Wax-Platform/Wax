import React from 'react'

import { Paragraph } from '../ui/common/Typography'
import Modal from '../ui/common/Modal'

const showUnauthorizedAccessModal = callback => {
  const unauthorizedAccessModal = Modal.warning()
  return unauthorizedAccessModal.update({
    title: 'Unauthorized action',
    content: (
      <Paragraph>
        {`You don't have permission to access this book. Select 'OK' to be redirected to your Dashboard.`}
      </Paragraph>
    ),
    onOk() {
      if (callback) {
        callback()
      }

      unauthorizedAccessModal.destroy()
    },
    okButtonProps: { style: { backgroundColor: 'black' } },
    maskClosable: false,
    width: 570,
    bodyStyle: {
      marginRight: 38,
      textAlign: 'justify',
    },
  })
}

const showChangeInPermissionsModal = () => {
  const changeInPermissionsModal = Modal.warning()
  return changeInPermissionsModal.update({
    title: 'Permissions change',
    content: (
      <Paragraph>
        A change of your permissions just ocurred. Your new permissions will be
        updated in the background
      </Paragraph>
    ),
    onOk() {
      changeInPermissionsModal.destroy()
    },
    okButtonProps: { style: { backgroundColor: 'black' } },
    maskClosable: false,
    width: 570,
    bodyStyle: {
      marginRight: 38,
      textAlign: 'justify',
    },
  })
}

const showUnauthorizedActionModal = (
  shouldRedirect = false,
  callback = undefined,
  key = undefined,
) => {
  const unauthorizedActionModal = Modal.warning()

  let errorMessage

  switch (key) {
    case 'lockedChapterDelete':
      errorMessage = `You can’t delete a chapter that is currently being edited by another book member with edit access.`
      break

    default:
      errorMessage = `You don't have permissions to perform this action. Please contact book's
      owner`
      break
  }

  return unauthorizedActionModal.update({
    title: 'Unauthorized action',
    content: <Paragraph>{errorMessage}</Paragraph>,
    onOk() {
      if (shouldRedirect) {
        callback()
      }

      unauthorizedActionModal.destroy()
    },
    okButtonProps: { style: { backgroundColor: 'black' } },
    maskClosable: false,
    width: 570,
    bodyStyle: {
      marginRight: 38,
      textAlign: 'justify',
    },
  })
}

const showGenericErrorModal = callback => {
  const genericErrorModal = Modal.error()
  return genericErrorModal.update({
    title: 'Error',
    content: (
      <Paragraph>
        {`Something went wrong.${
          callback ? ' You will be redirected back to your dashboard.' : ''
        }Please contact your admin.`}
      </Paragraph>
    ),
    onOk() {
      if (callback) {
        callback()
      }

      genericErrorModal.destroy()
    },
    okButtonProps: { style: { backgroundColor: 'black' } },
    maskClosable: false,
    width: 570,
    bodyStyle: {
      marginRight: 38,
      textAlign: 'justify',
    },
  })
}

const onInfoModal = errorMessage => {
  const warningModal = Modal.warning()
  return warningModal.update({
    title: 'Warning',
    content: <Paragraph>{errorMessage}</Paragraph>,
    onOk() {
      warningModal.destroy()
    },
    okButtonProps: { style: { backgroundColor: 'black' } },
    maskClosable: false,
    width: 570,
    bodyStyle: {
      marginRight: 38,
      textAlign: 'justify',
    },
  })
}

const showOpenAiRateLimitModal = () => {
  const modal = Modal.warning()
  return modal.update({
    title: 'Rate Limit Exceeded',
    content: (
      <>
        <Paragraph>
          It looks like you’ve made too many requests in a short period. We have
          usage limits to ensure service reliability. Please wait for a few
          minutes before trying again.
        </Paragraph>
        <Paragraph>
          If you’re repeatedly getting this message, please contact your admin.
        </Paragraph>
      </>
    ),
    onOk() {
      modal.destroy()
    },
    okButtonProps: { style: { backgroundColor: 'black' } },
    maskClosable: false,
    width: 570,
    bodyStyle: {
      marginRight: 38,
      textAlign: 'justify',
    },
  })
}

const showErrorModal = callback => {
  const warningModal = Modal.error()
  return warningModal.update({
    title: 'Error',
    content: (
      <Paragraph>
        There is something wrong with the book you have requested. You will be
        redirected back to your dashboard
      </Paragraph>
    ),
    onOk() {
      warningModal.destroy()
      callback()
    },
    okButtonProps: { style: { backgroundColor: 'black' } },
    maskClosable: false,
    width: 570,
    bodyStyle: {
      marginRight: 38,
      textAlign: 'justify',
    },
  })
}

const showDeletedBookModal = callback => {
  const warningModal = Modal.error()
  return warningModal.update({
    title: 'Error',
    content: (
      <Paragraph>
        This book has been deleted by the Owner. Select &quot;OK&quot; to be
        redirected to your Dashboard
      </Paragraph>
    ),
    onOk() {
      warningModal.destroy()
      callback()
    },
    okButtonProps: { style: { backgroundColor: 'black' } },
    maskClosable: false,
    width: 570,
    bodyStyle: {
      marginRight: 38,
      textAlign: 'justify',
    },
  })
}

// preview page error modals
const showFlaxPreviewErrorModal = (code, callback) => {
  const errorModal = Modal.error()

  switch (code) {
    case '401':
    case '403':
      errorModal.update({
        title: 'Preview failed',
        content: (
          <Paragraph>
            Error 401: There was a problem authenticating with the Flax
            microservice. Please contact your administrator.
          </Paragraph>
        ),
        onOk() {
          errorModal.destroy()
          callback()
        },
      })
      break
    case '501':
      errorModal.update({
        title: 'Preview failed',
        content: (
          <Paragraph>
            Error 501: We’re having trouble connecting to the preview service.
            Please check your internet connection and try again. If the problem
            persists, contact your administrator.
          </Paragraph>
        ),
        onOk() {
          errorModal.destroy()
          callback()
        },
      })
      break
    case '502':
      errorModal.update({
        title: 'Preview failed',
        content: (
          <Paragraph>
            Error 502: Our preview service is currently down for maintenance.
            Please check back later or contact your administrator if the issue
            persists.
          </Paragraph>
        ),
        onOk() {
          errorModal.destroy()
          callback()
        },
      })
      break
    case '504':
      errorModal.update({
        title: 'Preview failed',
        content: (
          <Paragraph>
            Error 504: The preview is taking longer than expected. Please wait a
            moment and try again. If the problem persists, contact your
            administrator.
          </Paragraph>
        ),
        onOk() {
          errorModal.destroy()
          callback()
        },
      })
      break

    default:
      errorModal.update({
        title: 'Preview failed',
        content: (
          <Paragraph>
            Error 500: There was an error generating your preview. Please
            contact your administrator.
          </Paragraph>
        ),
        onOk() {
          errorModal.destroy()
          callback()
        },
      })
      break
  }
}

const showFlaxPublishErrorModal = (code, callback) => {
  const errorModal = Modal.error()

  switch (code) {
    case '401':
    case '403':
      errorModal.update({
        title: 'Publishing failed',
        content: (
          <Paragraph>
            Error 401: There was a problem authenticating with the Flax
            microservice. Please contact your administrator.
          </Paragraph>
        ),
      })
      break
    case '501':
      errorModal.update({
        title: 'Publishing failed',
        content: (
          <Paragraph>
            Error 501: We couldn’t publish your book. Please check your internet
            connection or try again later. If the problem persists, contact your
            administrator.
          </Paragraph>
        ),
      })
      break
    case '502':
      errorModal.update({
        title: 'Publishing failed',
        content: (
          <Paragraph>
            Error 502: Something went wrong on our end while publishing your
            book. Please try again in a few minutes. If the problem persists,
            contact your administrator.
          </Paragraph>
        ),
      })
      break
    case '504':
      errorModal.update({
        title: 'Preview failed',
        content: (
          <Paragraph>
            Error 504: The publishing process is taking longer than usual.
            Please give it another try in a moment. If the problem persists,
            contact your administrator.
          </Paragraph>
        ),
      })
      break

    default:
      errorModal.update({
        title: 'Publishing failed',
        content: (
          <Paragraph>
            Error 500: There was an error publishing your book. Please contact
            your administrator.
          </Paragraph>
        ),
      })
      break
  }
}

export {
  showUnauthorizedAccessModal,
  showGenericErrorModal,
  showUnauthorizedActionModal,
  showChangeInPermissionsModal,
  showOpenAiRateLimitModal,
  onInfoModal,
  showErrorModal,
  showDeletedBookModal,
  showFlaxPreviewErrorModal,
  showFlaxPublishErrorModal,
}
