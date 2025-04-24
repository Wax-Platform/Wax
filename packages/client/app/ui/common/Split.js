import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

// import { grid, th } from '@coko/client'

import { Col, Row } from 'antd'

const Wrapper = styled(Row)``
const Left = styled(Col)``
const Right = styled(Col)``

const Split = props => {
  const { className, children, gutter, splitAt } = props
  const [left, right] = children

  return (
    <Wrapper className={className} gutter={gutter}>
      <Left span={splitAt}>{left}</Left>
      <Right span={24 - splitAt}>{right}</Right>
    </Wrapper>
  )
}

Split.propTypes = {
  gutter: PropTypes.number,
  /** Number on the antd grid of 24 total */
  splitAt: PropTypes.number,
}

Split.defaultProps = {
  gutter: 0,
  splitAt: 12,
}

export default Split
