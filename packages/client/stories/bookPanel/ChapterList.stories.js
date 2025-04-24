/* eslint-disable no-alert */
import React, { useState } from 'react'
import styled from 'styled-components'
// import { uuid } from '@coko/client/dist'
import ChapterList from '../../app/ui/bookPanel/ChapterList'

const ChapterListWrapper = styled.div`
  width: 300px;
`

const defaultChapters = [
  {
    id: '1',
    title: 'Where it all started',
    lockedBy: 'Urszula',
  },
  {
    id: '2',
    title: 'Far away',
  },
  {
    id: '3',
    title: 'Long chapter names get cut and ellipsis is shown',
  },
  {
    id: '4',
    title: 'Cat face',
    lockedBy: 'Ivo',
  },
  {
    id: '5',
    title: 'Spreading the wing',
  },
]

export const Base = args => {
  const [chapters, setChapters] = useState(defaultChapters)

  const onReorderChapter = c => {
    setChapters(c)
  }

  const handleChapterDelete = id => {
    const index = chapters.findIndex(chapter => chapter.id === id)

    if (index !== -1) {
      const newChapters = [
        ...chapters.slice(0, index),
        ...chapters.slice(index + 1),
      ]

      setChapters(newChapters)
    }
  }

  const handleChapterClick = id => {
    alert(`Chapter clicked: ${id}`)
  }

  // const handleChapterDuplicate = id => {
  //   const chapterToDuplicate = chapters.find(chapter => chapter.id === id)

  //   if (chapterToDuplicate) {
  //     const newChapter = {
  //       ...chapterToDuplicate,
  //       id: uuid(),
  //       title: `${chapterToDuplicate.title} (copy)`,
  //     }

  //     const index = chapters.findIndex(chapter => chapter.id === id)

  //     const newChapters = [
  //       ...chapters.slice(0, index + 1),
  //       newChapter,
  //       ...chapters.slice(index + 1),
  //     ]

  //     setChapters(newChapters)
  //   }
  // }

  return (
    <ChapterListWrapper>
      <ChapterList
        chapters={chapters}
        onChapterClick={handleChapterClick}
        onDeleteChapter={handleChapterDelete}
        // onDuplicateChapter={handleChapterDuplicate}
        onReorderChapter={onReorderChapter}
      />
    </ChapterListWrapper>
  )
}

export default {
  component: ChapterList,
  title: 'BookPanel/ChapterList',
}
