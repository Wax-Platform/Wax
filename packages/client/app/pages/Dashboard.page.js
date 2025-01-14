import React, { useContext, useEffect } from 'react'
import { Dashboard } from '../ui'
import { useParams } from 'react-router-dom'
import { useDocumentContext } from '../ui/dashboard/hooks/DocumentContext'
import { AiDesignerContext } from '../ui/component-ai-assistant/hooks/AiDesignerContext'

const DashboardPage = ({ showFilemanager, enableLogin }) => {
  const { docIdentifier } = useParams()
  const { setCurrentDocId } = useDocumentContext()

  useEffect(() => {
    if (docIdentifier) setCurrentDocId(docIdentifier)
  }, [docIdentifier])

  return (
    <Dashboard showFilemanager={showFilemanager} enableLogin={enableLogin} />
  )
}

export default DashboardPage
