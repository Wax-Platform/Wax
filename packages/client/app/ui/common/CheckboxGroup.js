import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import { Checkbox } from 'antd'

import { checkboxStyles } from './Checkbox'

// eslint-disable-next-line import/prefer-default-export
export const verticalCss = css`
  display: flex;
  flex-direction: column;
`

const StyledGroup = styled(Checkbox.Group)`
  ${checkboxStyles}
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
