/* eslint-disable no-console */
import React from 'react'
import { Form, LicenseTypes } from '../../app/ui'

export const Base = props => {
  const handleValuesChange = (changedValues, allValues) => {
    console.log(allValues.licenseTypes)
  }

  return (
    <Form
      initialValues={{
        licenseTypes: {
          ...props,
        },
      }}
      onValuesChange={handleValuesChange}
    >
      <Form.Item name="licenseTypes">
        <LicenseTypes />
      </Form.Item>
    </Form>
  )
}

Base.args = {
  NC: false,
  SA: false,
  ND: false,
}

export default {
  component: LicenseTypes,
  title: 'BookMetadata/LicenseTypes',
}
