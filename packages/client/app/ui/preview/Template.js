/* stylelint-disable string-quotes */

import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'

import { th, grid } from '@coko/client'

import fallback from '../../../static/imageFallback.png'

const Wrapper = styled.li`
  align-items: center;
  background-color: transparent;
  border: none;
  box-shadow: none;
  cursor: pointer;
  display: inline-flex;
  flex-direction: column;
  max-width: 85px;
  object-fit: cover;

  &[aria-checked='true']::before {
    background-color: ${th('colorText')};
    border-radius: 5px;
    content: '';
    height: ${grid(1)};
    margin: 0 auto ${grid(1)};
    position: relative;
    top: 0;
    transition: visibility 0.1s ease-in, width 0.1s ease-in;
    visibility: 'visible';
    width: ${grid(8)};
  }

  &[aria-checked='false'] {
    padding-top: ${grid(2)};
  }
`

const Name = styled.div`
  align-items: center;
  text-align: center;
  text-transform: capitalize;
  word-wrap: break-word;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${props =>
    props.selected &&
    css`
      font-weight: bold;
      transition: font-weight 0.1s ease-in;
    `}
`

const TemplateImg = styled.img`
  border-color: transparent;
  border-radius: ${th('borderRadius')};
  border-style: solid;
  border-width: 3px;
  cursor: pointer;
  height: 100px;
  opacity: ${props => (props.selected ? 1 : 0.5)};
  transition: border 0.1s ease-in, opacity 0.1s ease-in;
  width: 82px;

  &:hover {
    border-color: ${th('colorBorder')};
    opacity: 1;
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${props =>
    props.selected &&
    css`
      border-color: ${th('colorText')};

      &:hover {
        border-color: ${th('colorPrimary')};
      }
    `}
`

const Template = props => {
  const { className, id, imageUrl, isSelected, name, onClick } = props

  const handleClick = () => onClick(id)

  return (
    <Wrapper
      aria-checked={isSelected}
      className={className}
      id={id}
      key={id}
      onClick={handleClick}
      role="radio"
    >
      <TemplateImg
        alt={name}
        selected={isSelected}
        src={imageUrl || fallback}
      />

      <Name selected={isSelected}>
        <span aria-hidden="true" data-test="preview-templateName">
          {name}
        </span>
      </Name>
    </Wrapper>
  )
}

Template.propTypes = {
  id: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  isSelected: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
}

Template.defaultProps = {
  imageUrl: null,
}

export default Template
