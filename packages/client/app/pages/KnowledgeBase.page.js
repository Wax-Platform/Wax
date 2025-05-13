/* stylelint-disable declaration-no-important */
/* eslint-disable react/prop-types */
import React from 'react'
import { useMutation, useQuery, useSubscription } from '@apollo/client'
import {
  GET_DOCUMENTS,
  CREATE_DOCUMENT,
  DELETE_DOCUMENT,
  KB_UPDATED_SUBSCRIPTION,
} from '../graphql/knowledgeBase.queries'
import { GET_BOOKS } from '../graphql'
import { KnowledgeBase } from '../ui'

export const KnowledgeBasePage = ({ bookId }) => {
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

/* eslint-disable-next-line react/function-component-definition, func-names */
export default function (props) {
  const { loading, data: dataBooks } = useQuery(GET_BOOKS, {
    fetchPolicy: 'network-only',
    variables: {
      options: {
        archived: false,
        orderBy: {
          column: 'title',
          order: 'asc',
        },
        page: 0,
        pageSize: 10,
      },
    },
  })

  if (loading) return null

  const [book] = dataBooks.getBooks.result

  return <KnowledgeBasePage {...props} bookId={book.id} />
}
