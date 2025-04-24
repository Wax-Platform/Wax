import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Button } from '../common'

const Wrapper = styled.header`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

const TemplateManagerHeader = props => {
  const { openNewTemplateModal } = props
  const { t } = useTranslation(null, { keyPrefix: 'pages.templateManager' })

  return (
    <Wrapper>
      <h1>{t('title')}</h1>
      <Button onClick={openNewTemplateModal}>{t('actions.add')}</Button>
    </Wrapper>
  )
}

TemplateManagerHeader.propTypes = {
  openNewTemplateModal: PropTypes.func,
}

TemplateManagerHeader.defaultProps = {
  openNewTemplateModal: null,
}

export default TemplateManagerHeader
