import React from 'react'
import PropTypes from 'prop-types'
import { Col, Row, DatePicker } from 'antd'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Form, Input } from '../../common'

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
`

const CopyrightInputs = props => {
  const { namePrefix, canChangeMetadata, selected } = props

  const { t } = useTranslation(null, {
    keyPrefix: 'pages.producer.bookMetadataTab.sections.copyrightPage',
  })

  return (
    <Row gutter={[12, 0]}>
      <Col span={18}>
        <Form.Item
          label={t('copyrightHolder')}
          labelCol={{ span: 24 }}
          name={`${namePrefix}CopyrightHolder`}
          rules={[
            {
              required: selected,
              message: t('copyrightHolder.errors.noValue'),
            },
          ]}
        >
          <Input disabled={!canChangeMetadata} />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label={t('copyrightYear')}
          labelCol={{ span: 24 }}
          name={`${namePrefix}CopyrightYear`}
          rules={[
            { required: selected, message: t('copyrightYear.errors.noValue') },
          ]}
        >
          <StyledDatePicker disabled={!canChangeMetadata} picker="year" />
        </Form.Item>
      </Col>
    </Row>
  )
}

CopyrightInputs.propTypes = {
  namePrefix: PropTypes.string.isRequired,
  canChangeMetadata: PropTypes.bool.isRequired,
  selected: PropTypes.bool.isRequired,
}

export default CopyrightInputs
