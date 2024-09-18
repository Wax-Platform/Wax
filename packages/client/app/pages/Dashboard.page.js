import React from 'react'
import { Dashboard } from '../ui'

const DashboardPage = ({ showFilemanager, enableLogin }) => {
  return (
    <Dashboard showFilemanager={showFilemanager} enableLogin={enableLogin} />
  )
}

export default DashboardPage
