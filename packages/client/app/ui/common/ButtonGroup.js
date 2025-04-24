import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'

import { grid } from '@coko/client'

const Wrapper = styled.div`
  display: ${props => (props.inline ? 'inline-block' : 'flex')};
  /* display: inline-block; */

  ${props => {
    const { inline, justify } = props
    let justifyValue

    if (inline) return null

    if (justify === 'left') justifyValue = 'flex-start'
    if (justify === 'right') justifyValue = 'flex-end'
    if (justify === 'center') justifyValue = 'center'

    if (justifyValue)
      return css`
        justify-content: ${justifyValue};
      `

    return null
  }}

  > button {
    margin-right: ${grid(2)};
  }

  > button:first-child {
    margin-left: 0;
  }

  > button:last-child {
    margin-right: 0;
  }
`

const ButtonGroup = props => {
  const { className, children, inline, justify } = props

  return (
    <Wrapper className={className} inline={inline} justify={justify}>
      {children}
    </Wrapper>
  )
}

ButtonGroup.propTypes = {
  /** Must be multiple Button components */
  children: PropTypes.arrayOf(
    (propValue, key, componentName, location, propFullName) => {
      // allow eg. {isAThing && <Button>something</Button>} if isAThing is false
      if (typeof el === 'undefined') return true

      const notButton = propValue.find(el => el.type.displayName !== 'Button')

      if (notButton)
        return new Error('ButtonGroup children should be instances of Button!')

      return null
    },
  ).isRequired,

  /** Sets display to `inline-block` */
  inline: PropTypes.bool,

  /** Sets position of buttons in the row. Only applies when `inline` is `false` */
  justify: PropTypes.oneOf(['left', 'right', 'center']),
}

ButtonGroup.defaultProps = {
  inline: false,
  justify: 'left',
}

export default ButtonGroup
