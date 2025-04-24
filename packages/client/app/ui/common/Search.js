import React from 'react'
// import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Input } from 'antd'

import { inputShadow } from './_reusableStyles'

const StyledSearch = styled(Input.Search)`
  ${inputShadow}
`

const Search = props => {
  const { className, ...rest } = props

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <StyledSearch className={className} {...rest} />
}

Search.propTypes = {}

Search.defaultProps = {}

export default Search
