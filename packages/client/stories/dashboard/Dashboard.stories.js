/* eslint-disable no-alert */
import React, { useState, useEffect } from 'react'
import { faker } from '@faker-js/faker'
import { uuid } from '@coko/client'
import { Dashboard } from '../../app/ui'
import { createData } from '../_helpers'

const { lorem, image, random } = faker

const booksPerPage = 10

const handlePageChange = page => {
  alert(`Page changed: ${page}`)
}

const handleDelete = bookId => {
  alert(`Delete book: ${bookId}`)
}

const handleCanUploadBookThumbnail = () => {}

const handleCanDeleteBook = () => {}

const onCreateBook = () => alert('Create book')
const onImportBook = () => alert('Import book')

const makeData = n =>
  createData(n, i => {
    const showActions = random.numeric() % 2 === 0

    const createProps = {
      id: uuid(),
      title: lorem.words(6),
      cover: image.abstract(random.numeric(3), random.numeric(3)),
      showActions,
    }

    if (showActions) {
      createProps.onClickDelete = () => {
        alert('Delete the book')
      }
    }

    return createProps
  })

const makeBookData = bookCount => {
  const data = makeData(bookCount)
  return data
}

const getBooks = (bookCount = 10) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const data = makeBookData(bookCount)
      resolve({ books: data, totalCount: bookCount })
    }, 500)
  })
}

export const Base = args => {
  const { loading } = args
  const [loadingBooks, setLoadingBooks] = useState(false)

  const [dashboard, setDashboardData] = useState({
    books: [],
    totalCount: 0,
  })

  useEffect(() => {
    setLoadingBooks(true)
    getBooks(15)
      .then(res => setDashboardData(res))
      .catch(err => alert(err.toString()))
      .finally(() => {
        setLoadingBooks(false)
      })
  }, [])

  return (
    <Dashboard
      books={dashboard.books}
      booksPerPage={booksPerPage}
      canDeleteBook={handleCanDeleteBook}
      canUploadBookThumbnail={handleCanUploadBookThumbnail}
      currentPage={1}
      loading={loading || loadingBooks}
      onClickDelete={handleDelete}
      onCreateBook={onCreateBook}
      onImportBook={onImportBook}
      onPageChange={handlePageChange}
      title="Your books"
      totalCount={dashboard.totalCount || 0}
    />
  )
}

export const EmptyDashboard = args => {
  const { loading } = args
  const [loadingBooks, setLoadingBooks] = useState(false)

  const [dashboard, setDashboardData] = useState({
    books: [],
    totalCount: 0,
  })

  useEffect(() => {
    setLoadingBooks(true)
    getBooks(0)
      .then(res => setDashboardData(res))
      .catch(err => alert(err.toString()))
      .finally(() => {
        setLoadingBooks(false)
      })
  }, [])

  return (
    <Dashboard
      books={dashboard.books}
      booksPerPage={booksPerPage}
      canUploadBookThumbnail={handleCanUploadBookThumbnail}
      currentPage={1}
      loading={loading || loadingBooks}
      onClickDelete={handleDelete}
      onCreateBook={onCreateBook}
      onImportBook={onImportBook}
      onPageChange={handlePageChange}
      title="Your books"
      totalCount={dashboard.totalCount || 0}
    />
  )
}

export default {
  component: Dashboard,
  title: 'Dashboard/Dashboard',
}
