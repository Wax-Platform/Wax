/* stylelint-disable declaration-no-important */
// import React from 'react'
import styled from 'styled-components'

const VisuallyHiddenElement = styled.span`
  border: 0 !important;
  clip: rect(1px, 1px, 1px, 1px) !important; /* 1 */
  clip-path: inset(50%) !important; /* 2 */
  height: 1px !important;
  margin: -1px !important;
  overflow: hidden !important;
  padding: 0 !important;
  position: absolute !important;
  white-space: nowrap !important;
  width: 1px !important;
`

export default VisuallyHiddenElement
