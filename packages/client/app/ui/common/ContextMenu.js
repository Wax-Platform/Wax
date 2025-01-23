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
  --svg-fill: var(--color-trois-opaque-2);
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

    button > span {
      line-height: 1;
      text-rendering: optimizeLegibility;
    }
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
    fill: var(--svg-fill) !important;
  }
`
const removeDuplicatedSeparators = items => {
  return (item, index) => {
    const isDash = item.label === '-'
    const previousIsDash = items[index - 1]?.label === '-'
    const isFirstAndDash = index === 0 && isDash
    return (isDash && previousIsDash) || isFirstAndDash ? null : item
  }
}

const calculateXandY = (x, y, menuHeight) => {
  const top =
    y + menuHeight > window.innerHeight ? window.innerHeight - menuHeight : y
  const left =
    x + menuHeight > window.innerWidth ? window.innerWidth - menuHeight : x
  return { top, left }
}

const optionRender = option => {
  const { contextualMenu } = useDocumentContext()
  const { action, label, disabled, ...props } = option
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
  const { show, items = [], x = 0, y = 0 } = contextualMenu.state || {}
  const visible = useBool({ start: show })
  const transitioning = useBool({ start: false })
  const { length: itemsCount } = items || []

  const handleHide = debounce(transitioning.off, 300)

  useEffect(() => {
    transitioning.on()
    show ? visible.on() : visible.off()
    handleHide()
  }, [show])

  const shouldNotDisplay = !transitioning.state && !visible.state && !show
  if (shouldNotDisplay) return null

  const shouldAnimate = visible.state && transitioning.state
  const menuHeight = itemsCount * ITEM_HEIGHT + 8
  const options = items.filter(removeDuplicatedSeparators(items))
  const { top, left } = calculateXandY(x, y, menuHeight)

  return (
    <Menu
      x={left}
      y={top}
      shouldAnimate={shouldAnimate}
      data-contextmenu
      className={className}
      visible={visible.state}
      onMouseLeave={() => contextualMenu.update({ show: false })}
    >
      <Each of={options} as={optionRender} if={itemsCount} />
    </Menu>
  )
}

export default ContextMenu
