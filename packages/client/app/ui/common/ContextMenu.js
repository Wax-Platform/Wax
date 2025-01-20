/* stylelint-disable declaration-no-important */
import React, { useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { debounce } from 'lodash'
import { CleanButton } from '../_styleds/common'
import Each from '../component-ai-assistant/utils/Each'
import { safeCall } from '../component-ai-assistant/utils'
import { useBool } from '../../hooks/dataTypeHooks'
import { useDocumentContext } from '../dashboard/hooks/DocumentContext'

const showAnimation = keyframes`
  from {
    opacity: 0;
    transform: scaleY(0);
  }

  to {
    opacity: 1;
    transform: scaleY(1);
  }
`

const ITEM_HEIGHT = 24

const Menu = styled.ul`
  --item-height: ${ITEM_HEIGHT}px;
  animation: ${p => p.shouldAnimate && showAnimation} 0.3s;
  background-color: var(--color-trois-lightest);
  border: 1px solid var(--color-trois-alpha);
  border-radius: 4px;
  box-shadow: 0 2px 8px #0001;
  left: ${p => p.x}px;
  list-style: none;
  min-width: 200px;
  opacity: ${p => (p.visible ? 1 : 0)};
  padding: 4px 0;
  position: absolute;
  top: ${p => p.y}px;
  transform: ${p => (p.visible ? 'scaleY(1)' : 'scaleY(0)')};
  transform-origin: top;
  transition: opacity 0.3s, transform 0.3s;
  z-index: 1000;

  * {
    user-select: none;
  }

  li {
    height: var(--item-height);
  }

  hr {
    margin: 2px 0;
    padding: 4px;

    &::after {
      background-color: var(--color-trois-alpha);
    }
  }
`

const MenuItem = styled.li`
  display: flex;

  &:hover {
    background-color: #0001;
  }
`
const MenuButton = styled(CleanButton)`
  align-items: center;
  color: var(--svg-fill);
  display: flex;
  font-size: 12px;
  height: 100%;
  padding: 4px 8px;
  width: 100%;

  > :last-child {
    display: flex;
    width: 100%;
  }

  svg {
    fill: var(--svg-fill);
  }
`

const MenuItemRender = item => {
  const { contextualMenu } = useDocumentContext()
  const { action, label, disabled, ...props } = item
  const handleAction = e => {
    safeCall(action)(e)
    contextualMenu.update({ show: false })
  }

  return label === '-' ? (
    <hr></hr>
  ) : (
    <MenuItem {...props}>
      <MenuButton $disabled={disabled} onClick={handleAction}>
        {label}
      </MenuButton>
    </MenuItem>
  )
}

const ContextMenu = ({ className }) => {
  const { contextualMenu } = useDocumentContext()
  const { items = [], x = 0, y = 0, show } = contextualMenu.state || {}
  const visible = useBool({ start: show })
  const transitioning = useBool({ start: false })
  const { length: hasItems } = items || []

  const handleHide = debounce(transitioning.off, 300)

  useEffect(() => {
    if (show) {
      transitioning.on()
      visible.on()
      handleHide()
    } else {
      transitioning.on()
      visible.off()
      handleHide()
    }
  }, [show])

  const shouldNotDisplay = !transitioning.state && !visible.state && !show
  const shouldAnimate = visible.state && transitioning.state
  const itemsWithoutDashDuplicated = items.filter((item, index) => {
    const isDash = item.label === '-'
    const previousIsDash = items[index - 1]?.label === '-'

    return isDash && previousIsDash ? null : item
  })

  const menuHeight = hasItems * ITEM_HEIGHT + 8

  return shouldNotDisplay ? null : (
    <Menu
      x={
        x + menuHeight > window.innerWidth
          ? window.innerWidth - menuHeight
          : x - 10
      }
      y={
        y + menuHeight > window.innerHeight
          ? window.innerHeight - menuHeight
          : y - 10
      }
      shouldAnimate={shouldAnimate}
      data-contextmenu
      className={className}
      visible={visible.state}
      onMouseLeave={() => contextualMenu.update({ show: false })}
    >
      <Each of={itemsWithoutDashDuplicated} as={MenuItemRender} if={hasItems} />
    </Menu>
  )
}

export default ContextMenu
