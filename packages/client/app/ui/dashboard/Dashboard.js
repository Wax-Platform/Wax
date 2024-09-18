import React, { useEffect } from 'react'
import PmEditor from '../wax/PmEditor'
import useLoadFirstDocument from '../_helpers/useLoadFirstDocument'
import { useDocTree } from './hooks/useDocTree'

const Dashboard = ({ showFilemanager, enableLogin }) => {
  const { getDocTreeData } = useDocTree()

  const docIdentifier = useLoadFirstDocument(getDocTreeData)

  localStorage.removeItem('nextDocument')

  if (!docIdentifier) return null

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
