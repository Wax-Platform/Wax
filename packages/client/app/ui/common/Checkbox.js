import React from 'react'
import styled, { css } from 'styled-components'
import { Checkbox as AntCheckbox } from 'antd'

// define css here and export to use in CheckboxGroup as well
export const checkboxStyles = css`
  .ant-checkbox-inner,
  .ant-checkbox-checked,
  .ant-checkbox-inner::after {
    transition: all 0.2s;
  }

  &.ant-checkbox-wrapper.ant-checkbox-wrapper-disabled > span {
    color: ${props => `${props.theme.colorText}cc`};
  }
`

const StyledCheckbox = styled(AntCheckbox)`
  ${checkboxStyles}
`

const Checkbox = props => {
  // eslint-disable-next-line react/prop-types
  const { children, className, ...rest } = props

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <StyledCheckbox className={className} {...rest}>
      {children}
    </StyledCheckbox>
  )
}

export default Checkbox
