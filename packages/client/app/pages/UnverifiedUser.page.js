import React from 'react'
import { useHistory } from 'react-router-dom'
import { UnverifiedUser } from '../ui'

const UnverifiedUserPage = () => {
  const history = useHistory()

  const resend = () => {
    return history.push('/request-verification-email')
  }

  return <UnverifiedUser resend={resend} />
}

export default UnverifiedUserPage
