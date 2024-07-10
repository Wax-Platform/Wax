// eslint-disable-next-line react/jsx-props-no-spreading

import React from 'react'
import PropTypes from 'prop-types'
// import styled from 'styled-components'

import { Typography } from 'antd'

const { Title } = Typography

const Heading = props => {
  const { className, children, level } = props

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Title className={className} level={level}>
      {children}
    </Title>
  )
}

Heading.propTypes = {
  level: PropTypes.number,
}

Heading.defaultProps = {
  level: 1,
}

export const H1 = ({ children, className }) => (
  <Heading className={className} level={1}>
    {children}
  </Heading>
)

export const H2 = ({ children, className }) => (
  <Heading className={className} level={2}>
    {children}
  </Heading>
)

export const H3 = ({ children, className }) => (
  <Heading className={className} level={3}>
    {children}
  </Heading>
)

export const H4 = ({ children, className }) => (
  <Heading className={className} level={4}>
    {children}
  </Heading>
)

export const H5 = ({ children, className }) => (
  <Heading className={className} level={5}>
    {children}
  </Heading>
)
