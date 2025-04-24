/* stylelint-disable declaration-no-important */
/* eslint-disable react/prop-types */
import React from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useSubscription } from '@apollo/client'
import {
  GET_DOCUMENTS,
  CREATE_DOCUMENT,
  DELETE_DOCUMENT,
  KB_UPDATED_SUBSCRIPTION,
} from '../graphql/knowledgeBase.queries'
import { KnowledgeBase } from '../ui'

export const KnowledgeBasePage = () => {
  const params = useParams()
  const { bookId } = params

  const { data, refetch } = useQuery(GET_DOCUMENTS, {
    fetchPolicy: 'network-only',
    variables: {
      bookId,
    },
  })

  const [createDocument] = useMutation(CREATE_DOCUMENT, {
    refetchQueries: [GET_DOCUMENTS],
    onError: console.error,
  })

  const [deleteDocument] = useMutation(DELETE_DOCUMENT, {
    refetchQueries: [GET_DOCUMENTS],
  })

  const handleDelete = id => {
    deleteDocument({ variables: { id, bookId } })
  }

  useSubscription(KB_UPDATED_SUBSCRIPTION, {
    skip: !bookId,
    variables: { bookId },
    onData: () => {
      refetch({
        bookId,
      })
    },
    onError: error => console.error(error),
  })

  return (
    <KnowledgeBase
      bookId={bookId}
      createDocument={createDocument}
      deleteDocument={handleDelete}
      docs={data?.getDocuments}
    />
  )
}

export default KnowledgeBasePage
