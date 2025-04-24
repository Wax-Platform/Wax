import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { grid, th } from '@coko/client'

const Wrapper = styled.span`
  background-color: ${({ variant }) => {
    switch (variant) {
      case 'Not Submitted':
        return th('colorBorder')
      case 'Submitted':
        return th('colorText')
      case 'Rejected':
        return th('colorError')
      case 'Under Review':
        return th('colorWarning')
      case 'In Production':
        return th('colorPrimary')
      case 'Published':
        return th('colorSuccess')
      default:
        return th('colorBackground')
    }
  }};
  border-radius: 2px;
  color: ${({ variant }) =>
    variant === 'Not Submitted' ? th('colorText') : th('colorTextReverse')};
  flex: 0 0 120px;
  font-size: ${th('fontSizeBaseSmall')};
  /* font-weight: bold; */
  padding: ${grid(1)} ${grid(3)};
  text-align: right;
`

const Status = props => {
  const { className, status } = props

  return (
    <Wrapper className={className} variant={status}>
      {status}
    </Wrapper>
  )
}

Status.propTypes = {
  status: PropTypes.oneOf([
    'Not Submitted',
    'Submitted',
    'Rejected',
    'Under Review',
    'In Production',
    'Published',
  ]).isRequired,
}

Status.defaultProps = {}

export default Status
