import React, { useEffect } from 'react'
import { Dashboard } from '../ui'
import { useParams } from 'react-router-dom'
import { useDocumentContext } from '../ui/dashboard/hooks/DocumentContext'

const DashboardPage = ({ showFilemanager, enableLogin }) => {
  return (
    <Dashboard showFilemanager={showFilemanager} enableLogin={enableLogin} />
  )
}

export default DashboardPage
