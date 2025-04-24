import React from 'react'
// import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Input } from 'antd'

const StyledTextArea = styled(Input.TextArea)``

const TextArea = props => {
  const { className, ...rest } = props

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <StyledTextArea className={className} {...rest} />
}

TextArea.propTypes = {}

TextArea.defaultProps = {}

export default TextArea
