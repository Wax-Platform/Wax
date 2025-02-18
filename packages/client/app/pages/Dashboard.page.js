import React, { useEffect } from 'react'
import { Dashboard } from '../ui'
import { useMutation } from '@apollo/client'
import { CHECK_IF_USER_TEMPLATES_EXIST } from '../graphql/templates.graphql'

const DashboardPage = ({ showFilemanager, enableLogin }) => {
  const [checkIfUserTemplatesExist] = useMutation(CHECK_IF_USER_TEMPLATES_EXIST)

  useEffect(() => {
    checkIfUserTemplatesExist()
  }, [checkIfUserTemplatesExist])

  return (
    <Dashboard showFilemanager={showFilemanager} enableLogin={enableLogin} />
  )
}

export default DashboardPage
