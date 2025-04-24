/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState, useRef, memo, useCallback } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import without from 'lodash/without'

import { List as AntList, Pagination /* ConfigProvider */ } from 'antd'

import { grid, th } from '@coko/client'

import UICheckBox from './Checkbox'
import Search from './Search'
import UISelect from './Select'
import Spin from './Spin'

// #region styled
const Wrapper = styled.div`
  background-color: ${th('colorBackground')};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  > .ant-spin-nested-loading {
    flex-grow: 1;
    overflow: hidden;

    > .ant-spin-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  }
`

const SearchWrapper = styled.div`
  align-self: center;
  max-width: 1170px;
  padding: 0 ${grid(2)};
  width: 100%;
`

const InternalHeader = styled.div`
  border-bottom: 1px solid ${th('colorBorder')};
  display: flex;
  padding: ${grid(2)};
`

const TotalCount = styled.div`
  align-items: center;
  display: flex;
`

const SortWrapper = styled.div`
  margin-left: auto;
`

const Select = styled(UISelect)`
  display: inline-block;
  margin-left: ${grid(2)};
  width: 150px;
`

const ListItemWrapper = styled.li`
  align-items: center;
  display: flex;
  justify-content: stretch;
`

const SelectableWrapper = styled(ListItemWrapper)`
  > :last-child {
    flex-grow: 1;
  }
`

/* stylelint-disable declaration-no-important */
const StyledList = styled(AntList)`
  flex-grow: 1;
  overflow: auto;

  .ant-row {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
`
/* stylelint-enable declaration-no-important */

const FooterWrapper = styled.div`
  border: 1px solid ${th('colorBorder')};
  display: flex;
  justify-content: space-between;
  padding: 5px;
`

const CheckBox = styled(UICheckBox)`
  padding: ${grid(2)};
`
// #endregion styled

const compareItem = (preProps, nextProps) => {
  if (preProps.id === nextProps.id && preProps.selected === nextProps.selected)
    return true
  return false
}

// memoize Selectable item to avoid unecessary rerendering every time an item is selected/deselected
const SelectableItem = memo(props => {
  const {
    id,
    index,
    renderItem,
    onDeselect,
    onSelect,
    selected,
    checkboxLabel,
    ...rest
  } = props

  const handleChange = () => {
    if (selected) {
      onDeselect(id)
    } else {
      onSelect(id)
    }
  }

  return (
    <SelectableWrapper key={id}>
      <CheckBox
        aria-label={checkboxLabel}
        checked={selected}
        onChange={handleChange}
      />
      {renderItem({ id, ...rest }, index)}
    </SelectableWrapper>
  )
}, compareItem)

SelectableItem.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  renderItem: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  checkboxLabel: PropTypes.string,
}

SelectableItem.defaultProps = {
  checkboxLabel: 'Select item',
}

// memoized SelectableItem would use old value of selectedItems when handleSelect and handleDeselect are passed as they are
// when you wrap them with the below function, they always refer to the List's updated selectedItems
function useFunction(callback) {
  const ref = React.useRef()
  ref.current = callback

  function callbackFunction(...args) {
    const cb = ref.current

    if (typeof callback === 'function') {
      return cb.apply(this, args)
    }

    return false
  }

  return useCallback(callbackFunction, [])
}

// const EmptyList = () => {
//   return 'no data'
// }

const List = props => {
  const {
    footerContent,
    className,
    // disable prop types for props that exist on the ant component anyway
    /* eslint-disable react/prop-types */
    dataSource,
    locale,
    pagination,
    renderItem,
    /* eslint-enable react/prop-types */
    itemSelection,
    loading,
    onSearch,
    onSortOptionChange,
    searchLoading,
    searchPlaceholder,
    showPagination,
    showSearch,
    showSort,
    showTotalCount,
    sortOptions,
    totalCount,

    ...rest
  } = props

  const [selectedItems, setSelectedItems] = useState([])

  useEffect(() => {
    itemSelection &&
      itemSelection.onChange &&
      itemSelection.onChange(selectedItems)
  }, [selectedItems])

  // Clears selection when new data comes in
  // Necessary to clear the state after delete operations, otherwise the
  // selection will now keep rows that no longer exist
  // What we lose here is the ability to retain the selected rows if the data changes
  useEffect(() => {
    setSelectedItems([])
  }, [dataSource])

  const handleSelect = useFunction(id => {
    setSelectedItems([...selectedItems, id])
  })

  const handleDeselect = useFunction(id => {
    setSelectedItems(without(selectedItems, id))
  })

  const listItemToRender = itemSelection
    ? (itemProps, i) => (
        <SelectableItem
          index={i}
          onDeselect={handleDeselect}
          onSelect={handleSelect}
          renderItem={renderItem}
          selected={selectedItems.includes(itemProps.id)}
          {...itemProps}
        />
      )
    : (itemProps, i) => {
        return <ListItemWrapper>{renderItem(itemProps, i)}</ListItemWrapper>
      }

  const paginationRef = useRef(null)

  const paginationObj = {
    current: 1,
    pageSize: 10,
    ...pagination,
  }

  const [paginationCurrent, setPaginationCurrent] = useState(
    paginationObj.current,
  )

  const [paginationSize, setPaginationSize] = useState(paginationObj.pageSize)

  useEffect(() => {
    setPaginationCurrent(paginationObj.current)
    setPaginationSize(paginationObj.pageSize)
  }, [pagination])

  const passedPagination = {
    ...paginationObj,
    current: paginationCurrent,
    pageSize: paginationSize,
  }

  const triggerPaginationEvent = eventName => (page, pageSize) => {
    setPaginationCurrent(page)
    setPaginationSize(pageSize)

    if (pagination && pagination[eventName]) {
      pagination[eventName](page, pageSize)
    }
  }

  const onPaginationChange = triggerPaginationEvent('onChange')

  const onPaginationShowSizeChange = triggerPaginationEvent('onShowSizeChange')

  let splitDataSource = [...dataSource]

  // `totalCount` prop exists only to display the count at the top of the list,
  // but since we have the value, might as well pass it to the pagination config.
  // If the pagination config has a `total` key, then use that.
  // if neither `total` key nor totalCount are present but pagination object still exist, use dataSource.length as total
  if (passedPagination && !passedPagination.total) {
    if (totalCount) {
      passedPagination.total = totalCount
    } else {
      passedPagination.total = splitDataSource.length
    }
  }

  if (pagination) {
    if (
      splitDataSource.length >
      (passedPagination.current - 1) * passedPagination.pageSize
    ) {
      splitDataSource = [...dataSource].splice(
        (passedPagination.current - 1) * passedPagination.pageSize,
        passedPagination.pageSize,
      )
    }
  }

  const largestPage = Math.ceil(
    passedPagination.total / passedPagination.pageSize,
  )

  if (passedPagination.current > largestPage) {
    passedPagination.current = largestPage
  }

  const showInternalHeaderRow = showSort || showTotalCount
  const defaultSortOption = sortOptions && sortOptions.find(o => o.isDefault)

  // remove `isDefault` prop from sortOptions bcs it's unrecognized when spread onto an html <option>
  const sanitizedSortOptions = sortOptions.map(({ label, value }) => ({
    label,
    value,
  }))

  useEffect(() => {
    // enhance accessibility of pagination
    if (showPagination) {
      const pageItems = paginationRef.current.querySelectorAll(
        '.ant-pagination-item',
      )

      pageItems.forEach((page, index) => {
        const counter = index + 1
        let label = `Go to page ${counter}`

        if (page.classList.contains('ant-pagination-item-active')) {
          page.setAttribute('aria-current', 'page')
          label = `Page ${counter} , Current Page`
        }

        page.setAttribute('aria-label', label)
      })
    }
  }, [paginationCurrent, paginationSize, showPagination, dataSource])

  return (
    <Wrapper className={className}>
      {showSearch && (
        <SearchWrapper>
          <Search
            aria-label="Enter text to search in list"
            loading={searchLoading}
            onSearch={onSearch}
            placeholder={searchPlaceholder}
          />
        </SearchWrapper>
      )}

      {showInternalHeaderRow && (
        <InternalHeader>
          {showTotalCount && (
            <TotalCount>
              <span>{totalCount} results</span>
            </TotalCount>
          )}

          {showSort && (
            <SortWrapper>
              {/* disabling linter for this line because the label is indeed associated with the select input */}
              {/* alternatively: add a label prop to Select and render it from within the component */}
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label>
                Sort by
                <Select
                  defaultValue={defaultSortOption && defaultSortOption.value}
                  onChange={onSortOptionChange}
                  options={sanitizedSortOptions}
                />
              </label>
            </SortWrapper>
          )}
        </InternalHeader>
      )}

      <Spin spinning={loading}>
        {/* <ConfigProvider renderEmpty={EmptyList}> */}

        <StyledList
          dataSource={splitDataSource}
          locale={locale}
          renderItem={listItemToRender}
          {...rest}
        />

        {(footerContent || showPagination) && (
          <FooterWrapper>
            {footerContent || <div />}

            {showPagination && (
              <nav
                aria-label="Pagination"
                ref={paginationRef}
                role="navigation"
              >
                <Pagination
                  {...passedPagination}
                  onChange={onPaginationChange}
                  onShowSizeChange={onPaginationShowSizeChange}
                />
              </nav>
            )}
          </FooterWrapper>
        )}
        {/* </ConfigProvider> */}
      </Spin>
    </Wrapper>
  )
}

List.propTypes = {
  footerContent: PropTypes.element,
  itemSelection: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
  }),
  loading: PropTypes.bool,
  onSearch: PropTypes.func,
  onSortOptionChange: PropTypes.func,
  searchLoading: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  showPagination: PropTypes.bool,
  showSearch: PropTypes.bool,
  showSort: PropTypes.bool,
  showTotalCount: PropTypes.bool,
  sortOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      isDefault: PropTypes.bool,
    }),
  ),
  totalCount: PropTypes.number,
}

List.defaultProps = {
  footerContent: null,
  itemSelection: null,
  loading: false,
  onSearch: null,
  onSortOptionChange: null,
  searchLoading: false,
  showPagination: true,
  searchPlaceholder: null,
  showSearch: false,
  showSort: false,
  showTotalCount: false,
  sortOptions: [],
  totalCount: null,
}

List.Item = AntList.Item

export default List
