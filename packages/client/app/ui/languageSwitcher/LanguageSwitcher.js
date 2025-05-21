/* stylelint-disable declaration-no-important */
import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import 'flag-icon-css/css/flag-icon.min.css'
import cookies from 'js-cookie'
import styled from 'styled-components'
import { th, grid } from '@coko/client'
import i18n from '../../translations/i18n'
import Select from '../common/Select'

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;
  margin-inline: auto;
  padding-inline: ${grid(1)};

  && {
    padding-block: 0;
  }

  :focus-within {
    outline: 2px solid ${th('colorOutline')};
  }
`

const StyledSelect = styled(Select)`
  align-items: center;
  display: inline-flex;
  margin-inline: auto;
  padding-block: 0 !important;
  width: auto;

  .ant-select-selector {
    padding: 0 !important;
  }

  .ant-select-arrow {
    inset-inline-end: 0 !important;
  }
`

const FlagIcon = styled.span`
  margin-right: 5px;
  opacity: ${({ isActive }) => (isActive ? 0.5 : 1)};
`

const LanguageSwitcher = props => {
  const { languages } = props
  const languageCode = useRef()

  languageCode.current =
    languages.findIndex(l => l.code === cookies.get('i18next')) !== -1
      ? cookies.get('i18next')
      : languages[0]?.code

  useEffect(() => {
    languageCode.current && i18n.changeLanguage(languageCode.current)
  }, [languageCode.current])

  const selectLanguage = language => {
    i18n.changeLanguage(language)
  }

  return languages.length > 1 ? (
    <Wrapper>
      <FlagIcon
        className={`flag-icon flag-icon-${
          languages.find(l => l.code === languageCode.current)?.flagCode
        }`}
      />
      <StyledSelect
        // bordered={false}
        defaultValue={languages[0].code}
        onChange={selectLanguage}
        options={languages.map(l => ({
          label: l.name,
          value: l.code,
        }))}
        popupMatchSelectWidth={100}
        value={languageCode.current}
      />
    </Wrapper>
  ) : null
}

LanguageSwitcher.propTypes = {
  languages: PropTypes.arrayOf(PropTypes.shape()),
}

LanguageSwitcher.defaultProps = {
  languages: [],
}

export default LanguageSwitcher
