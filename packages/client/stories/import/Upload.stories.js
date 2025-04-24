import React from 'react'
import { Upload } from '../../app/ui'

export const ImportFileUpload = args => <Upload {...args} />

ImportFileUpload.args = {
  multiple: true,
  accept: '.doc,.docx',
}

export default {
  component: ImportFileUpload,
  title: 'Import/FileUpload',
}
