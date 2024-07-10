import React from 'react'
import { Result as AntResult } from 'antd'
import styled from 'styled-components'
import { th } from '@coko/client'

const StyledResult = styled(AntResult)`
  .ant-result-subtitle {
    color: ${th('colorText')};
  }
`

const Result = props => <StyledResult {...props} />

export default Result
