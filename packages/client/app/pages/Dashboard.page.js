import React, { useEffect, useState } from 'react'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
import { useCurrentUser } from '@coko/client'

import {
  GET_BOOKS,
  DELETE_BOOK,
  BOOK_DELETED_SUBSCRIPTION,
  BOOK_RENAMED_SUBSCRIPTION,
} from '../graphql'

import Dashboard from '../ui/dashboard/Dashboard'
import { isAdmin, isOwner } from '../helpers/permissions'
import {
  showUnauthorizedActionModal,
  showGenericErrorModal,
} from '../helpers/commonModals'

const loaderDelay = 700

const DashboardPage = () => {
  const { currentUser } = useCurrentUser()
  const [actionInProgress, setActionInProgress] = useState(false)

  const canTakeActionOnBook = bookId =>
    isAdmin(currentUser) || isOwner(bookId, currentUser)

  const [paginationParams, setPaginationParams] = useState({
    currentPage: 1,
    booksPerPage: 12,
  })

  const [books, setBooks] = useState({ result: [], totalCount: 0 })
  const { currentPage, booksPerPage } = paginationParams

  const {
    loading,
    data: queryData,
    refetch,
  } = useQuery(GET_BOOKS, {
    fetchPolicy: 'network-only',
    variables: {
      options: {
        archived: false,
        orderBy: {
          column: 'title',
          order: 'asc',
        },
        page: currentPage - 1,
        pageSize: booksPerPage,
      },
    },
  })

  useEffect(() => {
    if (queryData) {
      // store results in local state to use it when queryData becomes undefined because of refetch
      setBooks(queryData?.getBooks)
    }
  }, [queryData])

  // listen for changes to currentUser
  useEffect(() => {
    refetch({
      options: {
        archived: false,
        orderBy: {
          column: 'title',
          order: 'asc',
        },
        page: currentPage - 1,
        pageSize: booksPerPage,
      },
    })
  }, [currentUser])

  useSubscription(BOOK_DELETED_SUBSCRIPTION, {
    onData: () => {
      const nrOfPages = Math.ceil(books.totalCount / booksPerPage)

      if (
        currentPage > 1 &&
        currentPage === nrOfPages &&
        books.result.length === 1
      ) {
        setPaginationParams({
          currentPage: currentPage - 1,
          booksPerPage,
        })
      } else {
        refetch({
          options: {
            archived: false,
            orderBy: {
              column: 'title',
              order: 'asc',
            },
            page: currentPage - 1,
            pageSize: booksPerPage,
          },
        })
      }
    },
  })

  useSubscription(BOOK_RENAMED_SUBSCRIPTION, {
    onData: () => {
      refetch({
        options: {
          archived: false,
          orderBy: {
            column: 'title',
            order: 'asc',
          },
          page: currentPage - 1,
          pageSize: booksPerPage,
        },
      })
    },
    onError: error => console.error(error),
  })

  const [deleteBook] = useMutation(DELETE_BOOK, {
    update(cache) {
      cache.modify({
        fields: {
          getBooks() {},
        },
      })
    },
    onCompleted: () => {
      const nrOfPages = Math.ceil(books.totalCount / booksPerPage)

      if (
        currentPage > 1 &&
        currentPage === nrOfPages &&
        books.result.length === 1
      ) {
        setPaginationParams({
          currentPage: currentPage - 1,
          booksPerPage,
        })
      } else {
        refetch({
          options: {
            archived: false,
            orderBy: {
              column: 'title',
              order: 'asc',
            },
            page: currentPage - 1,
            pageSize: booksPerPage,
          },
        })
      }
    },
    onError: err => {
      if (err.toString().includes('Not Authorised')) {
        return showUnauthorizedActionModal(false)
      }

      return showGenericErrorModal()
    },
  })

  const onPageChange = arg => {
    setPaginationParams({
      currentPage: arg,
      booksPerPage: paginationParams.booksPerPage,
    })
  }

  const onClickDelete = bookId => {
    if (!canTakeActionOnBook(bookId)) {
      return showUnauthorizedActionModal(false)
    }

    setActionInProgress(true)
    return deleteBook({ variables: { id: bookId } }).then(() =>
      setTimeout(() => {
        setActionInProgress(false)
      }, loaderDelay),
    )
  }

  return (
    <Dashboard
      books={books.result}
      booksPerPage={booksPerPage}
      canDeleteBook={canTakeActionOnBook}
      canUploadBookThumbnail={canTakeActionOnBook}
      currentPage={currentPage}
      loading={loading || actionInProgress}
      onClickDelete={onClickDelete}
      onPageChange={onPageChange}
      totalCount={books.totalCount}
    />
  )
}

export default DashboardPage
