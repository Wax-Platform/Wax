import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Table as AntTable } from 'antd'

import { grid } from '@coko/client'

import Search from './Search'
import Spin from './Spin'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  > div:last-child {
    flex-grow: 1;

    .ant-spin-nested-loading,
    .ant-spin-container,
    .ant-table-wrapper {
      height: 100%;
    }

    .ant-table {
      height: calc(100% - ${grid(16)});
    }
  }
`

const SearchWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${grid(3)};

  > span {
    max-width: 1200px;
  }
`

const Table = props => {
  const {
    className,
    children,
    loading,
    showSearch,
    searchLoading,
    onSearch,
    searchPlaceholder,
    ...rest
  } = props

  return (
    <Wrapper className={className}>
      {showSearch && (
        <SearchWrapper>
          <Search
            loading={searchLoading}
            onSearch={onSearch}
            placeholder={searchPlaceholder}
          />
        </SearchWrapper>
      )}

      <Spin spinning={loading}>
        <AntTable {...rest}>{children}</AntTable>
      </Spin>
    </Wrapper>
  )
}

Table.propTypes = {
  loading: PropTypes.bool,
  showSearch: PropTypes.bool,
  searchLoading: PropTypes.bool,
  onSearch: PropTypes.func,
  searchPlaceholder: PropTypes.string,
}

Table.defaultProps = {
  loading: false,
  showSearch: false,
  searchLoading: false,
  onSearch: null,
  searchPlaceholder: null,
}

export default Table
