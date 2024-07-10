import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { grid } from '@coko/client'

import Divider from './Divider'
import { H2 } from './Headings'

const Wrapper = styled.div`
  > div:first-child {
    padding: 0 ${grid(4)};
  }
`

const FormSection = props => {
  const { className, children, label, last } = props

  return (
    <Wrapper className={className}>
      <div>
        <H2>{label}</H2>
        {children}
      </div>

      {!last && <Divider />}
    </Wrapper>
  )
}

FormSection.propTypes = {
  /** Label to display as heading above section */
  label: PropTypes.string,
  last: PropTypes.bool,
}

FormSection.defaultProps = {
  label: null,
  last: false,
}

export default FormSection
