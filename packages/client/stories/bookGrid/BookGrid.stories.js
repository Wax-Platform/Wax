/* eslint-disable no-alert */
import React, { useState, useEffect } from 'react'
import { uuid } from '@coko/client'

import { BookGrid } from '../../app/ui/bookGrid'

const books = [
  {
    id: uuid(),
  },
  {
    id: uuid(),
    title: 'Theory of computation',
  },
  {
    id: uuid(),
    cover: 'https://m.media-amazon.com/images/I/61KGTdfkPAL.jpg',
    title: 'Theory of computation',
  },
  {
    id: uuid(),
    cover: 'https://m.media-amazon.com/images/I/61KGTdfkPAL.jpg',
    title: 'Theory of computation',
    showActions: true,
    onClickDelete: () => alert('Are you sure you want to delete this book?'),
  },
  {
    id: uuid(),
    cover: 'https://m.media-amazon.com/images/I/61KGTdfkPAL.jpg',
    title: 'Theory of computation',
    showActions: true,
    onClickDelete: () => alert('Are you sure you want to delete this book?'),
  },
  {
    id: uuid(),
  },
  {
    id: uuid(),
    title: 'Theory of computation',
  },
  {
    id: uuid(),
    cover: 'https://m.media-amazon.com/images/I/61KGTdfkPAL.jpg',
    title: 'Theory of computation',
  },
  {
    id: uuid(),
    cover: 'https://m.media-amazon.com/images/I/61KGTdfkPAL.jpg',
    title: 'Theory of computation',
    showActions: true,
    onClickDelete: () => alert('Are you sure you want to delete this book?'),
  },
  {
    id: uuid(),
    cover: 'https://m.media-amazon.com/images/I/61KGTdfkPAL.jpg',
    title: 'Theory of computation',
    showActions: true,
    onClickDelete: () => alert('Are you sure you want to delete this book?'),
  },
  {
    id: uuid(),
    cover: 'https://m.media-amazon.com/images/I/61KGTdfkPAL.jpg',
    title: 'Theory of computation',
    showActions: true,
    onClickDelete: () => alert('Are you sure you want to delete this book?'),
  },
  {
    id: uuid(),
    title: 'Theory of Mern',
  },
  {
    id: uuid(),
    cover: 'https://m.media-amazon.com/images/I/61KGTdfkPAL.jpg',
    title: 'Theory of Python',
  },
  {
    id: uuid(),
    cover: 'https://m.media-amazon.com/images/I/61KGTdfkPAL.jpg',
    title: 'Theory of Node',
    showActions: true,
    onClickDelete: () => alert('Are you sure you want to delete this book?'),
  },
  {
    id: uuid(),
    cover: 'https://m.media-amazon.com/images/I/61KGTdfkPAL.jpg',
    title: 'Theory of Java',
    showActions: true,
    onClickDelete: () => alert('Are you sure you want to delete this book?'),
  },
  {
    id: uuid(),
    cover: 'https://m.media-amazon.com/images/I/61KGTdfkPAL.jpg',
    title: 'Theory of computer',
    showActions: true,
    onClickDelete: () => alert('Are you sure you want to delete this book?'),
  },
  {
    id: uuid(),
    title: 'Theory of Mern',
  },
  {
    id: uuid(),
    cover: 'https://m.media-amazon.com/images/I/61KGTdfkPAL.jpg',
    title: 'Theory of Python',
  },
  {
    id: uuid(),
    cover: 'https://m.media-amazon.com/images/I/61KGTdfkPAL.jpg',
    title: 'Theory of Node',
    showActions: true,
    onClickDelete: () => alert('Are you sure you want to delete this book?'),
  },
  {
    id: uuid(),
    cover: 'https://m.media-amazon.com/images/I/61KGTdfkPAL.jpg',
    title: 'Theory of Java',
    showActions: true,
    onClickDelete: () => alert('Are you sure you want to delete this book?'),
  },
  {
    id: uuid(),
    cover: 'https://m.media-amazon.com/images/I/61KGTdfkPAL.jpg',
    title: 'Theory of computer',
    showActions: true,
    onClickDelete: () => alert('Are you sure you want to delete this book?'),
  },
]

const onSearch = ({ page = 1, pageSize }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedBooks = books.slice(startIndex, endIndex)

      resolve({
        books: paginatedBooks,
        totalCount: books.length,
        currentPage: page,
      })
    }, 900)
  })
}

export const Base = args => {
  const { booksPerPage } = args

  const [searchResponse, setSearchResponse] = useState({})

  const [loadingBooks, setLoadingBooks] = useState(true)

  const [searchParams, setSearchParams] = useState({
    page: 1,
    pageSize: 10,
  })

  const handleDelete = bookId => {
    alert(`Delete book with ID: ${bookId}`)
  }

  const setSearchPage = page => {
    setSearchParams({ ...searchParams, page })
  }

  useEffect(() => {
    setLoadingBooks(true)
    onSearch({ ...searchParams, pageSize: booksPerPage }).then(res => {
      setSearchResponse(res)
      setLoadingBooks(false)
    })
  }, [searchParams, booksPerPage])

  return (
    <BookGrid
      books={searchResponse.books}
      currentPage={searchParams.page}
      loading={loadingBooks}
      onClickDelete={handleDelete}
      onPageChange={setSearchPage}
      totalCount={searchResponse.totalCount}
      {...args}
    />
  )
}

Base.args = {
  title: 'Your books',
  booksPerPage: 10,
  canDeleteBook: () => {},
  canUploadBookThumbnail: () => {},
}

export default {
  component: BookGrid,
  title: 'BookGrid/BookGrid',
}
