import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { CaretRightFilled } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { Form, Collapse, Radio } from '../../common'
import CopyrightLicenseOption from './CopyrightLicenseOption'
import CopyrightInputs from './CopyrightInputs'
import LicenseTypes from './LicenseTypes'

const StyledParagraph = styled.p`
  margin-top: 0;
`

const ExpandIcon = ({ isActive }) => {
  return <CaretRightFilled rotate={isActive ? 270 : 90} />
}

ExpandIcon.propTypes = {
  isActive: PropTypes.bool.isRequired,
}

const CopyrightLicenseInput = props => {
  const { onChange, value, canChangeMetadata } = props
  const [activeKey, setActiveKey] = useState(value)

  const { t } = useTranslation(null, {
    keyPrefix: 'pages.producer.bookMetadataTab.sections.copyrightPage',
  })

  const handleChange = v => {
    onChange(v)
    setActiveKey(v)
  }

  return (
    <Collapse
      accordion
      activeKey={activeKey}
      destroyInactivePanel
      expandIcon={ExpandIcon}
      expandIconPosition="end"
    >
      <CopyrightLicenseOption
        canChangeMetadata={canChangeMetadata}
        description={t('options.allRightsReserved.detail')}
        key="SCL"
        name="SCL"
        onChange={handleChange}
        selected={value === 'SCL'}
        title={t('options.allRightsReserved')}
      >
        <CopyrightInputs
          canChangeMetadata={canChangeMetadata}
          namePrefix="nc"
          selected={value === 'SCL'}
        />
      </CopyrightLicenseOption>

      <CopyrightLicenseOption
        canChangeMetadata={canChangeMetadata}
        description={t('options.creativeCommons.detail')}
        key="CC"
        link="https://creativecommons.org/about/cclicenses/"
        linkText={t('options.creativeCommons.link')}
        name="CC"
        onChange={handleChange}
        selected={value === 'CC'}
        title={t('options.creativeCommons')}
      >
        <CopyrightInputs
          canChangeMetadata={canChangeMetadata}
          namePrefix="sa"
          selected={value === 'CC'}
        />
        <Form.Item name="licenseTypes">
          <LicenseTypes canChangeMetadata={canChangeMetadata} />
        </Form.Item>
      </CopyrightLicenseOption>

      <CopyrightLicenseOption
        canChangeMetadata={canChangeMetadata}
        description={t('options.publicDomain.detail')}
        key="PD"
        name="PD"
        onChange={handleChange}
        selected={value === 'PD'}
        title={t('options.publicDomain')}
      >
        <Form.Item name="publicDomainType">
          <Radio.Group
            disabled={!canChangeMetadata}
            options={[
              {
                label: (
                  <div>
                    <strong>{t('options.publicDomain.cc0')}</strong>
                    <StyledParagraph>
                      {t('options.publicDomain.cc0.details')}
                    </StyledParagraph>
                  </div>
                ),
                value: 'cc0',
              },
              {
                label: (
                  <div>
                    <strong>{t('options.publicDomain.noCc')}</strong>
                    <StyledParagraph>
                      {t('options.publicDomain.noCc.details')}
                    </StyledParagraph>
                  </div>
                ),
                value: 'public',
              },
            ]}
          />
        </Form.Item>
      </CopyrightLicenseOption>
    </Collapse>
  )
}

CopyrightLicenseInput.propTypes = {
  value: PropTypes.oneOf(['SCL', 'PD', 'CC']),
  onChange: PropTypes.func,
  canChangeMetadata: PropTypes.bool,
}

CopyrightLicenseInput.defaultProps = {
  value: null,
  onChange: () => {},
  canChangeMetadata: true,
}

export default CopyrightLicenseInput
