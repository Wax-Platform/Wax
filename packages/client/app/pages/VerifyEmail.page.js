import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useMutation } from '@apollo/client'

import { VerifyEmail } from '../ui'
import {
  HANDLE_INVITATION,
  REQUEST_VERIFICATION_EMAIL,
  VERIFY_EMAIL,
} from '../graphql'

const VerifyEmailPage = () => {
  const { token } = useParams()
  const history = useHistory()
  const redirectToLogin = () => history.push('/login')
  const loaderDelay = 2000

  // add a small delay on purpose to keep ui transitions smooth
  const [verifyingLoader, setVerifyingLoader] = React.useState(false)
  const [resendingLoader, setResendingLoader] = React.useState(false)

  const [
    verifyEmailMutation,
    {
      data: verifyData,
      loading: verifying,
      error: verifyError,
      called: verifyCalled,
    },
  ] = useMutation(VERIFY_EMAIL, { variables: { token } })

  const [handleInvitation] = useMutation(HANDLE_INVITATION, {
    variables: { token },
  })

  const [
    resendVerificationEmailMutation,
    { data: resendData, loading: resending },
  ] = useMutation(REQUEST_VERIFICATION_EMAIL, { variables: { token } })

  if (!verifyCalled) {
    verifyEmailMutation().catch(e => {})
    setVerifyingLoader(true)
    setTimeout(() => setVerifyingLoader(false), loaderDelay)
    handleInvitation().catch(e => {})
  }

  const resendVerificationEmail = () => {
    resendVerificationEmailMutation().catch(e => {
      console.error(e)
    })
    setResendingLoader(true)
    setTimeout(() => setResendingLoader(false), loaderDelay)
  }

  let alreadyVerified = false
  if (verifyError && verifyError.message.includes('already been confirmed'))
    alreadyVerified = true

  let expired = false
  if (verifyError && verifyError.message.includes('expired')) expired = true

  return (
    <VerifyEmail
      alreadyVerified={alreadyVerified}
      expired={expired}
      redirectToLogin={redirectToLogin}
      resend={resendVerificationEmail}
      resending={resending || resendingLoader}
      resent={!!resendData}
      successfullyVerified={!!verifyData}
      verifying={verifying || verifyingLoader}
    />
  )
}

export default VerifyEmailPage
