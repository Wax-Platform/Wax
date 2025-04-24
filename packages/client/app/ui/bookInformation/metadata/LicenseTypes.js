import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Checkbox } from '../../common'

const Wrapper = styled.div`
  display: flex;
`

const LicenseTypes = props => {
  const { value, onChange, canChangeMetadata } = props

  const { t } = useTranslation(null, {
    keyPrefix: 'pages.producer.bookMetadataTab.sections.copyrightPage.options',
  })

  const [currentValue, setCurrentValue] = useState(value)

  const handleChange = (checked, type) => {
    const newValue = { ...currentValue }

    newValue[type] = checked
    setCurrentValue(newValue)
    onChange(newValue)
  }

  const handleNcChange = evt => {
    handleChange(evt.target.checked, 'NC')
  }

  const handleSaChange = evt => {
    handleChange(evt.target.checked, 'SA')
  }

  const handleNdChange = evt => {
    handleChange(evt.target.checked, 'ND')
  }

  return (
    <Wrapper>
      <Checkbox
        checked={currentValue?.NC}
        disabled={!canChangeMetadata}
        onChange={handleNcChange}
      >
        {t('creativeCommons.restrictions.nonCommercial')}
      </Checkbox>
      <Checkbox
        checked={currentValue?.SA}
        disabled={currentValue?.ND || !canChangeMetadata}
        onChange={handleSaChange}
      >
        {t('creativeCommons.restrictions.shareAlike')}
      </Checkbox>
      <Checkbox
        checked={currentValue?.ND}
        disabled={currentValue?.SA || !canChangeMetadata}
        onChange={handleNdChange}
      >
        {t('creativeCommons.restrictions.noDerivatives')}
      </Checkbox>
    </Wrapper>
  )
}

LicenseTypes.propTypes = {
  value: PropTypes.shape({
    NC: PropTypes.bool,
    SA: PropTypes.bool,
    ND: PropTypes.bool,
  }),
  onChange: PropTypes.func,
  canChangeMetadata: PropTypes.bool.isRequired,
}

LicenseTypes.defaultProps = {
  value: {
    NC: false,
    SA: false,
    ND: false,
  },
  onChange: () => {},
}

export default LicenseTypes
