/* eslint-disable no-console */
import React from 'react'
import { ISBNInput } from '../../app/ui'
import { Form } from '../../app/ui/common'

/* eslint-disable-next-line react/prop-types */
export const Base = ({ canChangeMetadata, ...props }) => {
  return (
    <Form initialValues={{ ...props }}>
      <Form.List name="inputList">
        {(fields, { add, remove }, { errors }) => {
          return (
            <div>
              {fields.map(field => (
                <div key={field.key}>
                  <ISBNInput
                    canChangeMetadata={canChangeMetadata}
                    field={field}
                    name="label"
                    placeholder="Label"
                    style={{ width: '20em' }}
                  />
                  <ISBNInput
                    canChangeMetadata={canChangeMetadata}
                    field={field}
                    name="isbn"
                    placeholder="ISBN value"
                    style={{ width: '20em' }}
                  />
                </div>
              ))}
            </div>
          )
        }}
      </Form.List>
    </Form>
  )
}

Base.args = {
  canChangeMetadata: true,
  inputList: [{}, { label: 'test label', isbn: '111333' }],
}

export default {
  component: ISBNInput,
  title: 'BookMetadata/ISBNInput',
}
