/* eslint-disable no-alert */
import React from 'react'
import { uuid } from '@coko/client'
import styled from 'styled-components'

import { BookCard } from '../../app/ui/bookGrid'

const Wrapper = styled.div`
  width: 300px;
`

const WrappedBookCard = args => (
  <Wrapper>
    <BookCard {...args} />
  </Wrapper>
)

export const Base = args => <WrappedBookCard {...args} />
Base.args = {
  id: uuid(),
  title: 'Introduction to Automata Theory',
  cover: 'https://m.media-amazon.com/images/I/816J67jnBCL.jpg',
  canDeleteBook: () => {},
  canUploadBookThumbnail: () => {},
}

export const WithAction = args => <WrappedBookCard {...args} />
WithAction.args = {
  id: uuid(),
  title: 'Introduction to Automata Theory',
  cover: 'https://m.media-amazon.com/images/I/816J67jnBCL.jpg',
  showActions: true,
  onClickDelete: () => alert('Are you sure you want to delete the book?'),
  canUploadBookThumbnail: () => {},
  canDeleteBook: () => {},
}

export const WithoutCover = args => <WrappedBookCard {...args} />
WithoutCover.args = {
  id: uuid(),
  title: 'Introduction to Automata Theory',
  showActions: true,
  onClickDelete: () => alert('Are you sure you want to delete the book?'),
  canUploadBookThumbnail: () => {},
  canDeleteBook: () => {},
}

export const WithoutTitle = args => <WrappedBookCard {...args} />
WithoutTitle.args = {
  id: uuid(),
  cover: 'https://m.media-amazon.com/images/I/816J67jnBCL.jpg',
  showActions: true,
  onClickDelete: () => alert('Are you sure you want to delete the book?'),
  canUploadBookThumbnail: () => {},
  canDeleteBook: () => {},
}

export const WithoutCoverAndTitle = args => <WrappedBookCard {...args} />
WithoutCoverAndTitle.args = {
  id: uuid(),
  showActions: true,
  onClickDelete: () => alert('Are you sure you want to delete the book?'),
  canUploadBookThumbnail: () => {},
  canDeleteBook: () => {},
}

export default {
  component: BookCard,
  title: 'BookGrid/BookCard',
}
