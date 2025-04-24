/* eslint-disable no-console */
import React from 'react'
import dayjs from 'dayjs'
import { Form, CopyrightInputs } from '../../app/ui'

export const Base = props => {
  const handleChange = (changedValues, allValues) => console.log(allValues)

  return (
    <Form initialValues={{ ...props }} onValuesChange={handleChange}>
      <CopyrightInputs namePrefix="cc" />
    </Form>
  )
}

Base.args = {
  ccCopyrightHolder: 'John Doe',
  ccCopyrightYear: dayjs('2025', 'YYYY'),
}

export default {
  component: CopyrightInputs,
  title: 'BookMetadata/CopyrightInputs',
}
