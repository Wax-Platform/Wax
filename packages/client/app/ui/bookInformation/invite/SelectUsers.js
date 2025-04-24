import React, { useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Spin, Select } from '../../common'

const StyledSelect = styled(Select)`
  &.ant-select {
    width: 100%;
  }
`

const SelectUsers = ({
  fetchOptions,
  debounceTimeout,
  value,
  onChange,
  noResultsSetter,
  canChangeAccess,
}) => {
  const [fetching, setFetching] = useState(false)
  const [options, setOptions] = useState([])
  const fetchRef = useRef(0)
  const { t } = useTranslation()

  const debounceFetcher = useMemo(() => {
    const loadOptions = v => {
      fetchRef.current += 1
      const fetchId = fetchRef.current
      setOptions([])
      setFetching(true)
      fetchOptions(v.trim()).then(newOptions => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return
        }

        const userOptions = newOptions.map(user => ({
          label: user.displayName,
          value: user.id,
          title: user.title,
        }))

        if (userOptions.length === 0 && value.length === 0) {
          noResultsSetter(true)
        }

        setOptions(userOptions)
        setFetching(false)
      })
    }

    return debounce(loadOptions, debounceTimeout)
  }, [fetchOptions, debounceTimeout, value])

  return (
    <StyledSelect
      disabled={!canChangeAccess}
      filterOption={false}
      labelInValue
      mode="multiple"
      notFoundContent={fetching ? <Spin spinning /> : null}
      onChange={newValue => {
        onChange(newValue)

        if (newValue.length === 0) {
          setOptions([])
          noResultsSetter(true)
        } else {
          noResultsSetter(false)
        }
      }}
      onDropdownVisibleChange={open => {
        if (!open && value.length === 0) {
          setOptions([])
          noResultsSetter(true)
        }
      }}
      onSearch={debounceFetcher}
      options={options}
      placeholder={t('pages.common.header.shareModal.emailInput')}
      value={value}
    />
  )
}

SelectUsers.propTypes = {
  fetchOptions: PropTypes.func.isRequired,
  debounceTimeout: PropTypes.number,
  noResultsSetter: PropTypes.func.isRequired,
  value: PropTypes.arrayOf(
    PropTypes.shape({
      disabled: PropTypes.bool,
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      title: PropTypes.string,
      value: PropTypes.string.isRequired,
    }),
  ),
  onChange: PropTypes.func,
  canChangeAccess: PropTypes.bool.isRequired,
}

SelectUsers.defaultProps = {
  debounceTimeout: 800,
  value: [],
  onChange: () => {},
}

export default SelectUsers
