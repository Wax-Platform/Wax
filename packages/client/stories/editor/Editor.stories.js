/* eslint-disable no-alert, no-console, react/prop-types */
import React, { useState } from 'react'
import { faker } from '@faker-js/faker'
import { uuid } from '@coko/client'
import dayjs from 'dayjs'
import { Editor } from '../../app/ui'
import { createData, randomBool } from '../_helpers'

export const Base = props => {
  const { chapters: defaultChapters, title, value, bookMetadataValues } = props
  const [chapters, setChapters] = useState(defaultChapters)

  const handleUploadChapter = () => {
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

  const handleAddChapter = () => {
    const newChapter = {
      id: uuid(),
      title: 'Untitled',
    }

    setChapters([...chapters, newChapter])
  }

  // const handleDuplicateChapter = id => {
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

  const handleDeleteChapter = id => {
    const index = chapters.findIndex(chapter => chapter.id === id)

    if (index !== -1) {
      const newChapters = [
        ...chapters.slice(0, index),
        ...chapters.slice(index + 1),
      ]

      setChapters(newChapters)
    }
  }

  const handleReorderChapter = c => {
    setChapters(c)
  }

  const handleClickBookMetadata = () => alert('Open book metadata modal')

  const handleSubmitBookMetadata = values => {
    console.log(values)
  }

  const handleErrorBookMetadata = err => {
    console.log(err)
  }

  const handleChapterClick = chapter => {
    console.log(`Chapter clicked: ${chapter}`)
  }

  const renderImage = file => {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.error)
      // Some extra delay to make the asynchronicity visible
      setTimeout(() => reader.readAsDataURL(file), 4150)
    })
  }

  const onPeriodicBookComponentTitleChange = () =>
    console.log('Periodic book component title change.')

  return (
    <Editor
      bookMetadataValues={bookMetadataValues}
      chapters={chapters}
      onAddChapter={handleAddChapter}
      onChange={source => console.log(source)}
      onChapterClick={handleChapterClick}
      onClickBookMetadata={handleClickBookMetadata}
      onDeleteChapter={handleDeleteChapter}
      onErrorBookMetadata={handleErrorBookMetadata}
      onImageUpload={file => renderImage(file)}
      onPeriodicBookComponentTitleChange={onPeriodicBookComponentTitleChange}
      onReorderChapter={handleReorderChapter}
      onSubmitBookMetadata={handleSubmitBookMetadata}
      onUploadChapter={handleUploadChapter}
      title={title}
      value={value}
      // onDuplicateChapter={handleDuplicateChapter}
    />
  )
}

Base.args = {
  title: faker.lorem.words(faker.datatype.number({ min: 5, max: 10 })),
  chapters: createData(5, () => ({
    id: faker.datatype.uuid(),
    title: faker.lorem.words(faker.datatype.number({ min: 1, max: 5 })),
    lockedBy: randomBool() ? faker.name.firstName() : null,
  })),
  value: '',
  bookMetadataValues: {
    title: faker.lorem.words(4),
    subtitle: faker.lorem.words(8),
    authors: [faker.name.fullName(), faker.name.fullName()].join(', '),
    isbn: faker.random.numeric(10),
    topPage: 'top page',
    bottomPage: 'bottom page',
    copyrightLicense: 'SCL',
    ncCopyrightHolder: faker.name.fullName(),
    ncCopyrightYear: dayjs('2025', 'YYYY'),
    saCopyrightHolder: faker.name.fullName(),
    saCopyrightYear: dayjs('2014', 'YYYY'),
    licenseTypes: {
      NC: true,
      SA: true,
      ND: false,
    },
    publicDomainType: 'cc0',
  },
}

export default {
  component: Editor,
  title: 'Editor/Editor',
}
