import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import { useTranslation } from 'react-i18next'

import { grid, th } from '@coko/client'

import Template from './Template'

const Wrapper = styled.ul`
  align-items: center;
  border: 1px solid ${th('colorBorder')};
  border-radius: ${th('borderRadius')};
  display: flex;
  gap: ${grid(1)};
  list-style-type: none;
  min-height: 100px;
  overflow-x: auto;
  padding: ${grid(2)};

  > div:not(:last-child) {
    margin-right: ${grid(2)};
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${props =>
    props.disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    `}
`

const EmptyMessage = styled.div`
  margin-left: ${grid(3)};
`

const TemplateList = props => {
  const { className, onTemplateClick, templates, selectedTemplate, disabled } =
    props

  const { t } = useTranslation(null, {
    keyPrefix: 'pages.previewAndPublish.sections',
  })

  const handleKeydown = event => {
    let flag = false

    if (disabled || !templates.length) {
      return
    }

    switch (event.key) {
      case ' ':
        onTemplateClick(selectedTemplate)
        flag = true
        break

      case 'Up':
      case 'ArrowUp':
      case 'Left':
      case 'ArrowLeft':
        onTemplateClick(
          templates[
            (templates.findIndex(temp => temp.id === selectedTemplate) -
              1 +
              templates.length) %
              templates.length
          ].id,
        )
        flag = true
        break

      case 'Down':
      case 'ArrowDown':
      case 'Right':
      case 'ArrowRight':
        onTemplateClick(
          templates[
            (templates.findIndex(temp => temp.id === selectedTemplate) +
              1 +
              templates.length) %
              templates.length
          ].id,
        )
        flag = true
        break

      default:
        break
    }

    if (flag) {
      event.stopPropagation()
      event.preventDefault()
    }
  }

  return (
    <Wrapper
      aria-activedescendant={selectedTemplate}
      aria-labelledby="templates"
      className={className}
      disabled={disabled}
      onFocus={() => {
        document
          .getElementById(selectedTemplate)
          ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }}
      onKeyDown={handleKeydown}
      role="radiogroup"
      tabIndex="0"
    >
      {templates.length > 0 ? (
        templates.map(template => (
          <Template
            id={template.id}
            imageUrl={template.imageUrl}
            isSelected={selectedTemplate === template.id}
            key={template.id}
            name={template.name}
            onClick={onTemplateClick}
          />
        ))
      ) : (
        <li>
          <EmptyMessage>{t('templates.empty')}</EmptyMessage>
        </li>
      )}
    </Wrapper>
  )
}

TemplateList.propTypes = {
  disabled: PropTypes.bool,
  onTemplateClick: PropTypes.func.isRequired,
  selectedTemplate: PropTypes.string,
  templates: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      imageUrl: PropTypes.string,
      name: PropTypes.string.isRequired,
    }),
  ),
}

TemplateList.defaultProps = {
  disabled: false,
  selectedTemplate: null,
  templates: [],
}

export default TemplateList
