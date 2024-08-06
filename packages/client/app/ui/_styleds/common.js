/* stylelint-disable declaration-no-important */
import styled from 'styled-components'

export const FlexRow = styled.div`
  align-items: var(--y, center);
  display: flex;
  flex-direction: row;
  justify-content: var(--x, space-between);
`
export const FlexCol = styled.div`
  align-items: var(--x, flex-start);
  display: flex;
  flex-direction: column;
  justify-content: var(--y, center);
`
export const CleanButton = styled.button.attrs({ type: 'button' })`
  background: #fff0;
  border: none;
  cursor: pointer;
  margin: 0;
  outline: none;
  padding: 0;
`
export const FlexCleanButton = styled(CleanButton)`
  display: flex;
`

export const WindowHeading = styled.div`
  align-items: center;
  background: var(--color-trois);
  color: #fff;
  display: flex;
  font-size: 12px;
  font-weight: bold;
  justify-content: space-between;
  line-height: 1;
  min-height: 28px;
  padding: 5px 10px;
  white-space: nowrap;
  z-index: 99;

  svg {
    fill: #fff;
    stroke: #fff;
  }

  > :first-child {
    color: #fff;
  }
`

export const StyledWindow = styled.div`
  border-right: ${p => (p.$show ? '1px' : '0px')} solid #0004;
  display: flex;
  flex-direction: column;
  /* height: var(--styledwindow-height); */
  opacity: ${p => (p.$show ? '1' : '0')};
  overflow: hidden;
  position: relative;
  transition: all 0.3s linear;
  width: ${p => (p.$show ? '100%' : '0')};
`
