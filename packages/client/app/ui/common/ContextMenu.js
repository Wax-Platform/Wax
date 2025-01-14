import React from 'react'
import styled from 'styled-components'
import { CleanButton } from '../_styleds/common'
import Each from '../component-ai-assistant/utils/Each'
import { safeCall } from '../component-ai-assistant/utils'

const Menu = styled.ul`
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px #0001;
  display: ${p => (p.visible ? 'block' : 'none')};
  list-style: none;
  min-width: 200px;
  padding: 8px 0;
  position: absolute;
  z-index: 1000;
`

const MenuItem = styled.li`
  display: flex;
  padding: 8px 16px;

  &:hover {
    background-color: var(--color-trois-lightest-3);
  }
`
const MenuButton = styled(CleanButton)`
  color: var(--color-trois-dark);
  display: flex;
  width: 100%;
`

const renderMenuItem = item => {
  const { action, label } = item
  return (
    <MenuItem>
      <MenuButton onClick={safeCall(action)}>{label}</MenuButton>
    </MenuItem>
  )
}

const ContextMenu = ({ items = [], show, onClose, className }) => {
  const { length: hasItems } = items || []

  return (
    <Menu
      data-contextmenu
      className={className}
      visible={!!show}
      onMouseLeave={onClose}
    >
      <Each of={items} as={renderMenuItem} if={hasItems} />
    </Menu>
  )
}

export default ContextMenu
