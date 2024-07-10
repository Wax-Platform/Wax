import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'

const Wrapper = styled.div`
  height: 100%;

  ${props =>
    props.maxWidth &&
    css`
      display: flex;
      justify-content: center;

      > div {
        max-width: ${props.maxWidth}px;
      }
    `}
`

const Page = props => {
  const { className, children, maxWidth } = props

  return (
    <Wrapper className={className} maxWidth={maxWidth}>
      {children}
    </Wrapper>
  )
}

Page.propTypes = {
  maxWidth: PropTypes.number,
}

Page.defaultProps = {
  maxWidth: null,
}

export default Page
