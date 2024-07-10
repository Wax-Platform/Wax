/* stylelint-disable declaration-no-important */
import React from 'react'

import styled from 'styled-components'

const Root = styled.div`
  --height: ${p => (p.$height ? p.$height : '10px')};
  align-items: center;
  display: flex;
  gap: 5px;
  margin: 3px 0;
`

const Container = styled.div`
  aspect-ratio: 16 / 7;
  background-color: ${p =>
    p.checked ? 'var(--color-enabled)' : 'var(--color-disabled)'};
  border-radius: var(--height);
  box-shadow: inset 0 0 4px #fff4, 0 0 2px #0002;
  box-sizing: content-box !important;
  cursor: pointer;
  display: flex;
  height: var(--height);
  padding: 2px;

  transition: all 0.4s;

  > span {
    aspect-ratio: 1 / 1;
    background-color: #eee;
    border-radius: 50%;
    box-shadow: 0 0 8px #0004, inset 0 -2px 5px #fffa;
    height: 100%;
    margin-left: ${p => (p.checked ? 'calc(100% - var(--height))' : '0')};
    transition: all 0.2s;
  }

  &:hover {
    filter: brightness(115%);
  }
`

// eslint-disable-next-line react/prop-types
const Toggle = ({ handleChange, checked, label, ...rest }) => {
  return (
    <Root {...rest}>
      <Container checked={checked} onClick={handleChange}>
        <span />
      </Container>
      {label && <span>{label}</span>}
    </Root>
  )
}

export default Toggle
