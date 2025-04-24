import React from 'react'
import { useQuery, useMutation } from '@apollo/client'
import {
  GET_TEMPLATES,
  ADD_TEMPLATE,
  REFRESH_TEMPLATE,
  DISABLE_TEMPLATE,
  ENABLE_TEMPLATE,
  REMOVE_TEMPLATE,
} from '../graphql'
import { TemplateMananger } from '../ui'

const TemplateManangerPage = () => {
  const { data: { getTemplates } = {}, loading } = useQuery(GET_TEMPLATES)

  const [addTemplate, { loading: addingTemplate }] = useMutation(ADD_TEMPLATE, {
    refetchQueries: [GET_TEMPLATES],
  })

  const [refreshTemplate, { loading: refreshingTemplate }] = useMutation(
    REFRESH_TEMPLATE,
    {
      refetchQueries: [GET_TEMPLATES],
    },
  )

  const [disableTemplate, { loading: disableLoading }] = useMutation(
    DISABLE_TEMPLATE,
    {
      refetchQueries: [GET_TEMPLATES],
    },
  )

  const [enableTemplate] = useMutation(ENABLE_TEMPLATE, {
    refetchQueries: [GET_TEMPLATES],
  })

  const [removeTemplate] = useMutation(REMOVE_TEMPLATE, {
    refetchQueries: [GET_TEMPLATES],
  })

  return (
    <TemplateMananger
      addingTemplate={addingTemplate}
      addTemplate={addTemplate}
      disableLoading={disableLoading}
      disableTemplate={disableTemplate}
      enableTemplate={enableTemplate}
      loading={loading}
      refreshingTemplate={refreshingTemplate}
      refreshTemplate={refreshTemplate}
      removeTemplate={removeTemplate}
      templatesData={getTemplates}
    />
  )
}

export default TemplateManangerPage
