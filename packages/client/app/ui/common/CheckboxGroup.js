import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Checkbox } from 'antd'

import { checkboxStyles } from './Checkbox'
import { vertical as verticalCss } from '../_helpers/cssSnippets'

const StyledGroup = styled(Checkbox.Group)`
  ${checkboxStyles}

  label.ant-checkbox-wrapper {
    margin-inline-start: 0;
  }
`

const VerticalWrapper = styled.div`
  display: inline-block;

  .ant-checkbox-group {
    ${verticalCss}
  }
`

const CheckboxGroup = props => {
  const { className, vertical, ...rest } = props

  const group = (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <StyledGroup className={className} {...rest} />
  )

  if (vertical) return <VerticalWrapper>{group}</VerticalWrapper>
  return group
}

CheckboxGroup.propTypes = {
  /** Arrange items vertically instead of inline. */
  vertical: PropTypes.bool,
}

CheckboxGroup.defaultProps = {
  vertical: false,
}

export default CheckboxGroup
