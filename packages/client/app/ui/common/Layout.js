// import React from 'react'
// import PropTypes from 'prop-types'
import styled from 'styled-components'

import { Layout as AntLayout } from 'antd'
import { grid, th } from '@coko/client'

// const Wrapper = styled.div``

const Layout = styled(AntLayout)`
  header,
  footer,
  main {
    background-color: ${th('colorBackground')};
    padding: ${grid(4)};
  }

  header {
    border-bottom: 1px solid ${th('colorBorder')};
    height: unset;
    line-height: unset;
  }

  footer {
    border-top: 1px solid ${th('colorBorder')};
  }
`

export default Layout
