import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input } from 'antd'

const ISBNInput = ({
  canChangeMetadata,
  field,
  name,
  placeholder,
  style,
  label,
  ...props
}) => {
  return (
    <Form.Item
      {...props}
      isListField
      name={[field.name, name]}
      style={{ ...style, display: 'inline-block' }}
    >
      <Input
        aria-label={label}
        disabled={!canChangeMetadata}
        placeholder={placeholder}
      />
    </Form.Item>
  )
}

ISBNInput.defaultProps = {
  style: {},
  label: '',
}

ISBNInput.propTypes = {
  canChangeMetadata: PropTypes.bool.isRequired,
  field: PropTypes.shape({
    fieldKey: PropTypes.number.isRequired,
    key: PropTypes.number.isRequired,
    name: PropTypes.number.isRequired,
  }).isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  style: PropTypes.shape({}),
  label: PropTypes.string,
}

export default ISBNInput
