import React from 'react'
import styled from 'styled-components'
import { th } from '@coko/client'
import { Link } from 'react-router-dom'

const StyledLink = styled(Link)`
  && {
    color: ${th('colorText')};
    text-decoration: underline;

    &:hover {
      color: ${th('colorText')};
      text-decoration: none;
    }

    &:focus {
      color: ${th('colorText')};
      outline: 1px solid ${th('colorPrimary')};
      text-decoration: none;
    }
  }
`

const KetidaLink = props => {
  return <StyledLink {...props} />
}

export default KetidaLink
