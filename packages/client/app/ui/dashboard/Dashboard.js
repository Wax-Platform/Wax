import React, { useEffect } from 'react'
import PmEditor from '../wax/PmEditor'
import useLoadFirstDocument from '../_helpers/useLoadFirstDocument'

const Dashboard = ({
  addResource,
  renameResource,
  deleteResource,
  reorderResource,
  getDocTreeData,
  showFilemanager,
}) => {
  
  const docIdentifier = useLoadFirstDocument(getDocTreeData)

  localStorage.removeItem('nextDocument')

  if (!docIdentifier) return null

  return (
    <PmEditor
      showFilemanager={showFilemanager}
      docIdentifier={docIdentifier}
      deleteResource={deleteResource}
      renameResource={renameResource}
      addResource={addResource}
      reorderResource={reorderResource}
      getDocTreeData={getDocTreeData}
    />
  )
}

Dashboard.propTypes = {}

Dashboard.defaultProps = {}

export default Dashboard
