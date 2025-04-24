/* eslint-disable no-console */
import React from 'react'
import { ISBNList } from '../../app/ui'
import { Form } from '../../app/ui/common'

/* eslint-disable-next-line react/prop-types */
export const Base = ({ canChangeMetadata, ...props }) => {
  const handleValuesChange = (changedValues, allValues) =>
    console.log('av', changedValues, allValues)

  const handleSubmit = values => console.log(values)

  return (
    <Form
      initialValues={{ ...props }}
      onFinish={handleSubmit}
      onValuesChange={handleValuesChange}
    >
      <Form.Item
        label="ISBN List"
        labelCol={{ span: 24 }}
        style={{ marginBottom: '0px' }}
        wrapperCol={{ span: 24 }}
      >
        <ISBNList canChangeMetadata={canChangeMetadata} name="isbns" />
      </Form.Item>
      <button type="submit">Submit</button>
    </Form>
  )
}

Base.args = {
  canChangeMetadata: true,
  isbns: [],
}

export const ReloadExistingISBNs = () => {
  const handleValuesChange = (changedValues, allValues) =>
    console.log('av', changedValues, allValues)

  const handleSubmit = values => console.log(values)

  const canChangeMetadata = true

  return (
    <Form
      initialValues={{
        canChangeMetadata: { canChangeMetadata },
        isbns: [{}, { label: 'test label', isbn: '111333' }],
      }}
      onFinish={handleSubmit}
      onValuesChange={handleValuesChange}
    >
      <Form.Item
        label="ISBN List"
        labelCol={{ span: 24 }}
        style={{ marginBottom: '0px' }}
        wrapperCol={{ span: 24 }}
      >
        <ISBNList canChangeMetadata={canChangeMetadata} name="isbns" />
      </Form.Item>
      <button type="submit">Submit</button>
    </Form>
  )
}

export default {
  component: ISBNList,
  title: 'BookMetadata/ISBNList',
}
