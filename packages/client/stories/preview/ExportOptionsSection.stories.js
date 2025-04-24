import React, { useState } from 'react'
import { faker } from '@faker-js/faker'

import ExportOptionsSection from '../../app/ui/preview/ExportOptionsSection'
import { defaultProfile } from '../../app/pages/Exporter.page'
import thumbnails from './static'

const thumbnailsAsArray = Object.keys(thumbnails).map(key => thumbnails[key])

const templateData = Array.from(Array(10)).map((_, j) => {
  return {
    id: String(j + 1),
    // imageUrl:
    //   'https://fastly.picsum.photos/id/11/82/100.jpg?hmac=solY9YT1h0M-KJfh8WKXqPfbFygW52ideb5Hf1VCKgc',
    imageUrl: thumbnailsAsArray[j],
    name: faker.lorem.word(),
  }
})

const isbnData = [
  {
    isbn: '978-1-23-456789-0',
    label: 'Hard cover',
  },
  {
    isbn: '978-1-23-456789-1',
    label: '',
  },
  {
    isbn: '978-1-23-456789-2',
    label: 'Soft cover',
  },
  {
    isbn: '978-1-23-456789-3',
    label: 'EPub',
  },
]

export const Base = () => {
  const [values, setValues] = useState({
    format: defaultProfile.format,
    size: defaultProfile.size,
    content: defaultProfile.content,
    template: templateData[2].id,
    isbn: isbnData[1].isbn,
  })

  const handleChange = newValues => {
    setValues({ ...values, ...newValues })
  }

  return (
    <ExportOptionsSection
      disabled={false}
      isbns={isbnData}
      onChange={handleChange}
      selectedContent={values.content}
      selectedFormat={values.format}
      selectedIsbn={values.isbn}
      selectedSize={values.size}
      selectedTemplate={values.template}
      templates={templateData}
    />
  )
}

export const Disabled = () => {
  const handleTemplateClick = () => {}

  return (
    <ExportOptionsSection
      disabled
      isbns={isbnData}
      onChange={() => {}}
      onTemplateClick={handleTemplateClick}
      selectedContent={['includeTitlePage']}
      selectedFormat={defaultProfile.format}
      selectedIsbn={isbnData[1].isbn}
      selectedSize={defaultProfile.size}
      selectedTemplate={templateData[2].id}
      templates={templateData}
    />
  )
}

export default {
  component: ExportOptionsSection,
  title: 'Preview/ExportOptionsSection',
}
