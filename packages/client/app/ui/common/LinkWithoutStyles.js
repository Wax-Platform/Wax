import { Link } from 'react-router-dom'
import styled from 'styled-components'

const LinkWithoutStyles = styled(Link)`
  color: inherit;
  text-decoration: none;
  width: 100%;

  &:hover,
  &:focus,
  &:active {
    color: inherit;
    text-decoration: none;
  }
`

export default LinkWithoutStyles
