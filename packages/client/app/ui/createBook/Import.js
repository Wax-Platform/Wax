import React, { useState } from 'react'
import { Button, Col, Row, Space } from 'antd'
import { grid } from '@coko/client'
import { InfoCircleFilled } from '@ant-design/icons'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import { Upload, Page } from '../common'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  padding: ${grid(4)};
`

const Import = ({ onClickContinue, canImport, loading }) => {
  const [filesToImport, setFilesToImport] = useState([])
  const { t } = useTranslation(null, { keyPrefix: 'pages.newBook.importPage' })

  return (
    <Page maxWidth={1200}>
      <Wrapper>
        <h1>{t('title')}</h1>
        <Row gutter={[24, 12]}>
          <Col md={12} xs={24}>
            <p>
              {t('info')} <strong>.docx</strong>
            </p>
            <p>
              <InfoCircleFilled /> {t('info.details')}
            </p>
          </Col>
          <Col md={12} xs={24}>
            <Space direction="vertical" style={{ display: 'flex' }}>
              <Upload
                accept=".docx"
                data-test="import-upload-button"
                disabled={!canImport}
                multiple
                onFilesChange={setFilesToImport}
              />

              <Row justify="end">
                <Button
                  data-test="import-continue-button"
                  disabled={!filesToImport.length || !canImport || loading}
                  loading={loading}
                  onClick={() => onClickContinue(filesToImport)}
                  size="large"
                  type="primary"
                >
                  {t('continue', { keyPrefix: 'pages.common.actions' })}
                </Button>
              </Row>
            </Space>
          </Col>
        </Row>
      </Wrapper>
    </Page>
  )
}

Import.propTypes = {
  onClickContinue: PropTypes.func.isRequired,
  canImport: PropTypes.bool,
  loading: PropTypes.bool,
}
Import.defaultProps = {
  canImport: false,
  loading: false,
}

export default Import
