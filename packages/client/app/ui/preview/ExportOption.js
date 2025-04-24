import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { th, uuid } from '@coko/client'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  max-width: 500px;
  min-block-size: 32px;
`

const Label = styled.label`
  color: ${th('colorTextLight')};
  white-space: nowrap;
`

const ChildWrapper = styled.div`
  overflow: auto;

  > &:focus-within {
    outline: 1px solid ${th('colorOutline')};
  }
`

const ExportOption = props => {
  const { className, children, label, inline, id } = props
  const labelId = uuid()

  return (
    <Wrapper className={className} inline={inline} {...(id ? { id } : {})}>
      <Label id={labelId}>{label}</Label>
      <ChildWrapper aria-labelledby={labelId}>{children}</ChildWrapper>
    </Wrapper>
  )
}

ExportOption.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string,
  inline: PropTypes.bool,
}

ExportOption.defaultProps = {
  inline: false,
  id: null,
}

export default ExportOption
