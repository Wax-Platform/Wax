/* eslint-disable no-alert */
import React from 'react'
import { Import } from '../../app/ui'

export const ImportFiles = args => {
  return <Import {...args} />
}

const onClickContinue = files => {
  const alertMessage =
    files.length > 0
      ? files.map((file, index) => `${index + 1}. ${file.name}`).join('\n')
      : 'No file selected.'

  alert(alertMessage)
}

ImportFiles.args = {
  multiple: true,
  accept: '.doc,.docx',
  onClickContinue,
}

export default {
  component: Import,
  title: 'Import/Import',
}
