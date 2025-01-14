import React, { useEffect } from 'react'
import PmEditor from '../wax/PmEditor'
import useLoadFirstDocument from '../_helpers/useLoadFirstDocument'
import { useDocumentContext } from './hooks/DocumentContext'

const Dashboard = ({ showFilemanager, enableLogin }) => {
  const {
    graphQL: { getDocTreeData },
  } = useDocumentContext()
  const docIdentifier = useLoadFirstDocument(getDocTreeData)

  localStorage.removeItem('nextDocument')

  // if (!docIdentifier) return null

  return (
    <PmEditor
      showFilemanager={showFilemanager}
      docIdentifier={docIdentifier}
      enableLogin={enableLogin}
    />
  )
}

Dashboard.propTypes = {}

Dashboard.defaultProps = {}

export default Dashboard
