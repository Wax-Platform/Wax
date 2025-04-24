import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import { Radio as AntRadio } from 'antd'
import { th } from '@coko/client'

const StyledRadioGroup = styled(AntRadio.Group)`
  /* apply extra styles to fix issues from changing default font size */
  /* font-size: ${th('fontSizeBase')}; */

  ${props =>
    props.vertical &&
    css`
      display: flex;
      flex-direction: column;
    `}

  .ant-radio-inner,
  .ant-radio-inner::after,
  .ant-radio-checked,
  .ant-radio-button-wrapper,
  .ant-radio-button-wrapper::before {
    transition-duration: 0.1s;
  }

  /* .ant-radio-wrapper .ant-radio-checked .ant-radio-inner::after {
    transform: scale(0.4);
  } */
`

const Radio = props => <AntRadio {...props} />

/**
 * Props are the same as Ant's RadioGroup https://ant.design/components/radio/#RadioGroup
 * with the addition of `vertical` and a slightly modified `onChange`.
 */
const RadioGroup = props => {
  const { className, onChange, vertical, ...rest } = props

  const handleChange = e => onChange(e.target.value)

  return (
    <StyledRadioGroup
      className={className}
      onChange={handleChange}
      role="radiogroup"
      vertical={vertical}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    />
  )
}

RadioGroup.propTypes = {
  /** Handle change. First argument is the incoming `value`. */
  onChange: PropTypes.func,
  /** Arrange items vertically instead of inline. */
  vertical: PropTypes.bool,
}

RadioGroup.defaultProps = {
  onChange: null,
  vertical: false,
}

/* Replicate exports from https://github.com/ant-design/ant-design/blob/master/components/radio/index.tsx#L28-L29 */
Radio.Button = AntRadio.Button
Radio.Group = RadioGroup

export default Radio
