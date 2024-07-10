import React from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import { Button as AntButton } from 'antd'
import { omit } from 'lodash'

import { darken, th, grid } from '@coko/client'

const colors = {
  danger: 'colorError',
  error: 'colorError',
  success: 'colorSuccess',
  // warn: 'colorWarning',
}

const StyledButton = styled(AntButton)`
  font-size: ${th('fontSizeBase')};
  /* let lineHeight expand the button height */
  height: unset;
  line-height: ${th('lineHeightBase')};
  ${props =>
    props.direction === 'rtl' &&
    css`
      direction: rtl;

      .anticon + span {
        margin-right: 8px;
        margin-left: 0;
      }
    `};

  ${props => {
    const { status, theme, type, ghost } = props

    if (!Object.keys(colors).includes(status)) {
      if (type === 'primary' && !ghost) {
        return css`
          &:hover,
          &:focus,
          &:active {
            background-color: ${darken('colorPrimary', 0.25)} !important;
          }
        `
      }

      return null
    }

    const color = theme[colors[status]]

    // primary
    if (type === 'primary')
      return css`
        background-color: ${color};
        border-color: ${color};
        color: ${theme.colorTextReverse};

        &:hover,
        &:focus,
        &:active {
          border-color: ${color};
          color: ${theme.colorTextReverse};
        }

        &:hover,
        &:focus {
          background-color: ${darken(color, 0.25)} !important;
        }

        &:active {
          background-color: ${darken(color, 0.25)} !important;
        }
      `

    // non-primary
    return css`
      color: ${color};
      border-color: ${color};

      &:hover,
      &:focus {
        color: ${darken(color, 0.25)};
        border-color: ${darken(color, 0.25)};
      }

      &:active {
        color: ${darken(color, 0.25)};
        border-color: ${darken(color, 0.25)};
      }
    `
  }}
  padding: 0 ${grid(4)};
`

/**
 * API is the same as https://ant.design/components/button/#API, except for the
 * `danger` prop, which is ommited in favour of `status`, described below.
 */

const Button = props => {
  const { children, className, ...rest } = props
  const passProps = omit(rest, 'danger')

  return (
    <StyledButton className={className} {...passProps}>
      {children}
    </StyledButton>
  )
}

Button.propTypes = {
  status: PropTypes.oneOf(['error', 'danger', 'success']),
}

Button.defaultProps = {
  status: null,
}

export default Button
