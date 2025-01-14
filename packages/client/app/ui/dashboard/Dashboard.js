import React from 'react'
import PmEditor from '../wax/PmEditor'
import { useParams } from 'react-router-dom'

const Dashboard = ({ showFilemanager, enableLogin }) => {
  const { docIdentifier } = useParams()
  localStorage.removeItem('nextDocument')

  return (
    <PmEditor
      showFilemanager={showFilemanager}
      docIdentifier={docIdentifier}
      enableLogin={enableLogin}
    />
  )
}

export default Dashboard
