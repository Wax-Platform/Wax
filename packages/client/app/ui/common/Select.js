/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import { debounce as lodashDebounceFunc } from 'lodash'
import { th } from '@coko/client'

import { Select as AntSelect } from 'antd'

const StyledSelect = styled(AntSelect)`
  width: 100%;
`

const StyledDropdown = styled.div`
  .ant-select-item-option-content {
    ${props =>
      props.wrapOptionText &&
      css`
        white-space: normal;
      `}
  }

  .ant-select-item-option-selected .ant-select-item-option-content {
    color: ${th('colorTextReverse')};
  }

  .ant-select-item-option-disabled .ant-select-item-option-content {
    filter: brightness(55%);
  }
`

const Select = props => {
  const {
    async,
    className,
    // debounce,
    debounceTimeout,

    // disable rule for props handled by ant
    /* eslint-disable react/prop-types */
    filterOption,
    notFoundContent,
    onSearch,
    showSearch,
    /* eslint-enable react/prop-types */

    virtual,
    wrapOptionText,
    ...rest
  } = props

  const handleSearch = searchValue => {
    onSearch(searchValue)
  }

  // const useDebounce = async ? true : debounce

  const searchFunc = async
    ? lodashDebounceFunc(handleSearch, debounceTimeout)
    : handleSearch

  const customDropdownRender = menu => (
    <StyledDropdown wrapOptionText={wrapOptionText}>{menu}</StyledDropdown>
  )

  return (
    <StyledSelect
      className={className}
      dropdownRender={customDropdownRender}
      filterOption={async && !filterOption ? false : filterOption}
      notFoundContent={!notFoundContent && async ? null : notFoundContent}
      onSearch={onSearch && searchFunc}
      showSearch={showSearch || !!onSearch}
      virtual={virtual}
      {...rest}
    />
  )
}

Select.propTypes = {
  async: PropTypes.bool,
  // debounce: PropTypes.bool,
  debounceTimeout: PropTypes.number,
  virtual: PropTypes.bool,
  wrapOptionText: PropTypes.bool,
}

Select.defaultProps = {
  async: false,
  // debounce: false,
  debounceTimeout: 500,
  virtual: false,
  wrapOptionText: false,
}

export default Select
