import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Input as AntInput } from 'antd'
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined'
import EyeOutlined from '@ant-design/icons/EyeOutlined'

import { inputShadow } from './_reusableStyles'

const Wrapper = styled.div``

const StyledInput = styled(AntInput)`
  ${inputShadow}
`

const NoStyleButton = styled.button`
  background: none;
  border: none;
`

const StyledPassword = styled(AntInput.Password)``

const Input = forwardRef((props, ref) => {
  const { className, onChange, type, passwordIconRender, ...rest } = props

  const handleChange = e => onChange && onChange(e.target.value)

  // wrap "eye" icon for show/hide password with a button to make it keyboard-focusalbe
  const defaultPasswordIconRender = visible => (
    <NoStyleButton
      aria-checked={visible}
      aria-label={visible ? 'Hide password' : 'Show password'}
      onClick={e => e.preventDefault()}
      role="switch"
      type="button"
    >
      {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
    </NoStyleButton>
  )

  return (
    <Wrapper className={className}>
      {type !== 'password' && (
        <StyledInput onChange={handleChange} ref={ref} {...rest} />
      )}

      {type === 'password' && (
        <StyledPassword
          iconRender={passwordIconRender || defaultPasswordIconRender}
          onChange={handleChange}
          ref={ref}
          {...rest}
        />
      )}
    </Wrapper>
  )
})

Input.propTypes = {
  /** optional icon for reveal/hide password */
  passwordIconRender: PropTypes.func,
  /** Handle change. First argument is the incoming `value`. */
  onChange: PropTypes.func,
  /** Define type of input. For other valid html input types, we have created separate components (eg. TextArea). */
  type: PropTypes.string,
}

Input.defaultProps = {
  passwordIconRender: null,
  onChange: null,
  type: 'text',
}

export default Input
