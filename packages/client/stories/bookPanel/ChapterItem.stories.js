/* eslint-disable no-alert */
import React from 'react'
import { faker } from '@faker-js/faker'
import ChapterItem from '../../app/ui/bookPanel/ChapterItem'

const handleDelete = () => alert('delete')
// const handleDuplicate = () => alert('duplicate')

const handleChapterClick = id => {
  alert(`Chapter clicked: ${id}`)
}

export const Base = args => (
  <ChapterItem onChapterClick={handleChapterClick} {...args} />
)

Base.args = {
  id: faker.datatype.uuid(),
  isDragging: false,
  onClickDelete: handleDelete,
  // onClickDuplicate: handleDuplicate,
  title: faker.lorem.sentence(),
}

export const LockedChapter = args => (
  <ChapterItem onChapterClick={handleChapterClick} {...args} />
)

LockedChapter.args = {
  id: faker.datatype.uuid(),
  isDragging: false,
  lockedBy: faker.name.fullName(),
  onClickDelete: handleDelete,
  // onClickDuplicate: handleDuplicate,
  title: faker.lorem.sentence(),
}

export const LongTitleChapter = args => (
  <ChapterItem onChapterClick={handleChapterClick} {...args} />
)

LongTitleChapter.args = {
  id: faker.datatype.uuid(),
  isDragging: false,
  onClickDelete: handleDelete,
  // onClickDuplicate: handleDuplicate,
  title: faker.lorem.words(40),
}

export default {
  component: ChapterItem,
  title: 'BookPanel/ChapterItem',
}
