import React, { useEffect } from 'react'
import PmEditor from '../wax/PmEditor'
import { useParams } from 'react-router-dom'
import { useDocumentContext } from './hooks/DocumentContext'
import { useAiDesignerContext } from '../component-ai-assistant/hooks/AiDesignerContext'

const Dashboard = ({ showFilemanager, enableLogin }) => {
  const { docIdentifier } = useParams()
  const { selectedTemplate } = useDocumentContext()
  const { setCss } = useAiDesignerContext()
  localStorage.removeItem('nextDocument')

  useEffect(() => {
    if (selectedTemplate) {
      setCss(selectedTemplate.rawCss)
    }
  }, [selectedTemplate?.rawCss])

  return (
    <PmEditor
      showFilemanager={showFilemanager}
      docIdentifier={docIdentifier}
      enableLogin={enableLogin}
    />
  )
}

export default Dashboard
