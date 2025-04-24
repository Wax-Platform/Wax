/* eslint-disable no-console */
import React, { useState } from 'react'
import dayjs from 'dayjs'
import styled from 'styled-components'
import { faker } from '@faker-js/faker'
import { uuid } from '@coko/client/dist'
import BookPanel from '../../app/ui/bookPanel/BookPanel'

const generateChapters = n => {
  const chapters = []

  for (let i = 1; i <= n; i += 1) {
    const chapter = {
      id: i.toString(),
      title: faker.lorem.words(faker.datatype.number({ min: 1, max: 5 })),
      lockedBy: faker.datatype.boolean() ? faker.name.firstName() : null,
    }

    chapters.push(chapter)
  }

  return chapters
}

const book = {
  title: faker.lorem.words(faker.datatype.number({ min: 5, max: 10 })),
  chapters: generateChapters(10),
}

const PanelWrapper = styled.div`
  width: 350px;
`

export const Base = args => {
  const { title, chapters: defaultChapters } = args
  const [chapters, setChapters] = useState(defaultChapters)
  const [metadataModalOpen, setMetadataModalOpen] = useState(false)

  const handleChapterUploadClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.doc,.docx'

    input.onchange = event => {
      const selectedFile = event.target.files[0]

      const newChapter = {
        id: uuid(),
        title: selectedFile.name.replace(/\.[^/.]+$/, ''),
      }

      setChapters([...chapters, newChapter])
    }

    input.click()
  }

  const handleAddChapterClick = () => {
    const newChapter = {
      id: uuid(),
      title: 'Untitled',
    }

    setChapters([...chapters, newChapter])
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

  const onReorderChapter = c => {
    setChapters(c)
  }

  const handleChapterClick = () => {
    console.log('Chapter clicked')
  }

  const handleClickBookMetadata = () => {
    console.log('Clicked Book Metadata')
  }

  const closeModal = () => {
    setMetadataModalOpen(false)
  }
  // const handleSubmitBookMetadata = values => console.log(values)

  // const handleErrorBookMetadata = err => console.log(err)

  return (
    <PanelWrapper>
      <BookPanel
        bookMetadataValues={{
          title: faker.lorem.words(2),
          subtitle: faker.lorem.words(2),
          authors: [faker.name.fullName(), faker.name.fullName()].join(', '),
          isbns: [
            {
              label: faker.lorem.words(),
              isbn: faker.random.alphaNumeric(10),
            },
          ],
          topPage: faker.lorem.words(2),
          bottomPage: faker.lorem.words(2),
          copyrightLicense: 'SCL',
          ncCopyrightHolder: faker.name.fullName(),
          ncCopyrightYear: dayjs('2023', 'YYYY'),
          saCopyrightHolder: faker.name.fullName(),
          saCopyrightYear: dayjs('2023', 'YYYY'),
          licenseTypes: {
            NC: true,
            SA: false,
            ND: true,
          },
          publicDomainType: 'cc0',
          open: metadataModalOpen,
          closeModal,
        }}
        chapters={chapters}
        metadataModalOpen={metadataModalOpen}
        onAddChapter={handleAddChapterClick}
        onChapterClick={handleChapterClick}
        onClickBookMetadata={handleClickBookMetadata}
        onDeleteChapter={handleChapterDelete}
        // onDuplicateChapter={handleChapterDuplicate}
        // onErrorBookMetadata={handleErrorBookMetadata}
        onReorderChapter={onReorderChapter}
        // onSubmitBookMetadata={handleSubmitBookMetadata}
        onUploadChapter={handleChapterUploadClick}
        setMetadataModalOpen={setMetadataModalOpen}
        title={title}
      />
    </PanelWrapper>
  )
}

Base.args = {
  title: book.title,
  chapters: book.chapters,
}

export default {
  component: BookPanel,
  title: 'BookPanel/BookPanel',
}
