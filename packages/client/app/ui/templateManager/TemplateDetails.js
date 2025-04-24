import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Button } from '../common'

const TemplateDetailsWrapper = styled.div`
  padding-inline: clamp(0rem, -1.0435rem + 5.2174vw, 3rem);
`

const TemplateInner = styled.div`
  display: grid;
  gap: clamp(0.25rem, -0.0109rem + 1.3043vw, 1rem);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`

const TemplateActions = styled.div`
  align-items: center;
  display: flex;
  gap: clamp(0.25rem, -0.0109rem + 1.3043vw, 1rem);
`

const StyledP = styled.p`
  max-width: 60ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const TemplateDetails = props => {
  const {
    record: {
      name,
      author,
      url,
      formats,
      enabled,
      enable,
      disable,
      canBeDeleted,
      deleteTemplate,
    },
  } = props

  const { t } = useTranslation(null, {
    keyPrefix: 'pages.templateManager.details',
  })

  const targetOptions = {
    pagedjs: t('formats.pdf'),
    epub: t('formats.epub'),
    web: t('formats.web'),
  }

  return (
    <TemplateDetailsWrapper>
      <TemplateInner>
        <div>
          <p>
            <strong>{t('name')} </strong> {name}
          </p>
          <p>
            <strong>{t('author')} </strong> {author}
          </p>
          <StyledP>
            <strong>{t('url')} </strong>
            <a href={url} rel="noreferrer" target="_blank">
              {url}
            </a>
          </StyledP>
        </div>
        <div>
          <p>
            <strong id={`${name}-template-list`}>{t('formats')}</strong>
          </p>
          <ul aria-labelledby={`${name}-template-list`}>
            {formats.map(format => (
              <li key={format.id}>
                {targetOptions[format.target]}
                {format.target === 'pagedjs' &&
                  `, dimensions ${format.trimSize}`}
              </li>
            ))}
          </ul>
        </div>
      </TemplateInner>
      <TemplateActions>
        {enabled ? (
          <Button onClick={disable} status="danger">
            {t('actions.disable', { keyPrefix: 'pages.templateManager' })}
          </Button>
        ) : (
          <Button onClick={enable} status="success">
            {t('actions.enable', { keyPrefix: 'pages.templateManager' })}
          </Button>
        )}
        {canBeDeleted ? (
          <Button onClick={deleteTemplate} status="danger">
            {t('actions.delete', { keyPrefix: 'pages.templateManager' })}
          </Button>
        ) : (
          <span>
            {t('actions.delete.blocked', {
              keyPrefix: 'pages.templateManager',
            })}
          </span>
        )}
      </TemplateActions>
    </TemplateDetailsWrapper>
  )
}

TemplateDetails.propTypes = {
  record: PropTypes.shape({
    name: PropTypes.string,
    author: PropTypes.string,
    url: PropTypes.string,
    formats: PropTypes.arrayOf(PropTypes.shape()),
    enabled: PropTypes.bool,
    enable: PropTypes.func,
    disable: PropTypes.func,
    canBeDeleted: PropTypes.bool,
    deleteTemplate: PropTypes.func,
  }),
}

TemplateDetails.defaultProps = {
  record: {},
}

export default TemplateDetails
