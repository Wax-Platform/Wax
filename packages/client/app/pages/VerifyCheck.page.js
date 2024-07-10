import React from 'react'
import { Redirect } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { useCurrentUser } from '@coko/client'

import { VerifyCheck } from 'ui'

import { RESEND_VERIFICATION_EMAIL_AFTER_LOGIN } from '../graphql'

const VeriryCheckPage = props => {
  const [verifyingLoader, setVerifyingLoader] = React.useState(false)
  const loaderDelay = 2000

  const { currentUser } = useCurrentUser()

  const [resendMutation, { data, loading, error }] = useMutation(
    RESEND_VERIFICATION_EMAIL_AFTER_LOGIN,
  )

  if (error) console.error(error)

  const resend = () => {
    resendMutation().catch(e => console.error(e))
    setVerifyingLoader(true)
    setTimeout(() => setVerifyingLoader(false), loaderDelay)
  }

  if (!currentUser) return null

  if (currentUser?.defaultIdentity.isVerified) {
    return <Redirect to="/" />
  }

  return (
    <VerifyCheck
      resend={resend}
      resending={loading || verifyingLoader}
      resent={!verifyingLoader && !!data}
    />
  )
}

VeriryCheckPage.propTypes = {}

VeriryCheckPage.defaultProps = {}

export default VeriryCheckPage
