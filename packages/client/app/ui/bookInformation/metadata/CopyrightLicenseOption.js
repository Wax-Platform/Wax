import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { grid } from '@coko/client'
import { Collapse, Radio } from '../../common'

const StyledPanel = styled(Collapse.Panel)`
  .ant-collapse-header {
    align-items: center !important; /* stylelint-disable-line declaration-no-important */
  }
`

const Wrapper = styled.div`
  align-items: center;
  display: flex;

  .ant-radio {
    margin-inline-end: ${grid(2)};
  }
`

const CopyrightLicenseOption = props => {
  const {
    title,
    description,
    link,
    linkText,
    children,
    selected,
    onChange,
    name,
    canChangeMetadata,
    ...rest
  } = props

  const handleClick = () => {
    if (canChangeMetadata) {
      onChange(name)
    }
  }

  return (
    <StyledPanel
      forceRender
      header={
        <Wrapper>
          <Radio
            checked={selected}
            disabled={!canChangeMetadata}
            onChange={handleClick}
          >
            <strong>{title}</strong>
            <p>{description}</p>
            {link && (
              <a href={link} rel="noreferrer" target="_blank">
                {linkText}
              </a>
            )}
          </Radio>
        </Wrapper>
      }
      showArrow={selected}
      {...rest}
    >
      {children}
    </StyledPanel>
  )
}

CopyrightLicenseOption.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  link: PropTypes.string,
  linkText: PropTypes.string,
  children: PropTypes.node.isRequired,
  selected: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  canChangeMetadata: PropTypes.bool.isRequired,
}

CopyrightLicenseOption.defaultProps = {
  link: null,
  linkText: null,
  selected: false,
  onChange: () => {},
}

export default CopyrightLicenseOption
