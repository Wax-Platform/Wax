/* stylelint-disable string-quotes */
/* eslint-disable react/prop-types */
import React from 'react'
import styled from 'styled-components'

const CheckboxContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
  margin-bottom: 4px;

  input[type='checkbox'] {
    accent-color: var(--color-blue);
    background: #eee;
    border: 1px solid #eee;
    border-radius: 5px;
    color: white;
    padding: 14px 9px;

    &:active,
    &:focus-visible {
      color: white;
      outline: none;
    }

    &:hover {
      accent-color: var(--color-blue);
      border: none;
    }
  }
`

const Checkbox = props => {
  const {
    checked,
    id,
    label,
    value,
    style = {},
    handleChange,
    labelBefore,
    className,
  } = props

  return (
    <CheckboxContainer className={className} style={style}>
      {labelBefore && <label htmlFor={id}>{label}</label>}
      <input
        checked={checked}
        id={id}
        name={value}
        onChange={handleChange}
        type="checkbox"
      />
      {!labelBefore && <label htmlFor={id}>{label}</label>}
    </CheckboxContainer>
  )
}

export default Checkbox