/* eslint-disable no-console */
import React from 'react'
import dayjs from 'dayjs'
import { Form, CopyrightLicenseInput } from '../../app/ui'

export const Base = props => {
  const handleValuesChange = (changedValues, allValues) =>
    console.log('av', changedValues, allValues)

  const handleSubmit = values => console.log(values)

  return (
    <Form
      initialValues={{ ...props }}
      onFinish={handleSubmit}
      onValuesChange={handleValuesChange}
    >
      <Form.Item name="copyrightLicense">
        <CopyrightLicenseInput />
      </Form.Item>
      <button type="submit">Save</button>
    </Form>
  )
}

Base.args = {
  copyrightLicense: 'SCL',
  ncCopyrightHolder: 'Yannis',
  ncCopyrightYear: dayjs('2023', 'YYYY'),
  saCopyrightHolder: 'Pokhi',
  saCopyrightYear: dayjs('2025', 'YYYY'),
  licenseTypes: {
    NC: true,
    SA: false,
    ND: false,
  },
  publicDomainType: 'public',
}

Base.argTypes = {
  copyrightLicense: {
    type: 'select',
    options: ['SCL', 'CC', 'PD'],
  },
}

export default {
  component: CopyrightLicenseInput,
  title: 'BookMetadata/CopyrightLicenseInput',
}
