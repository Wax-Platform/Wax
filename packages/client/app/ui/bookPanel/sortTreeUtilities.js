/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */

import { arrayMove } from '@dnd-kit/sortable'

import {
  closestCorners,
  getFirstCollision,
  KeyboardCode,
  defaultDropAnimation,
} from '@dnd-kit/core'

import { CSS } from '@dnd-kit/utilities'

export const iOS = /iPad|iPhone|iPod/.test(navigator.platform)

function getDragDepth(offset, indentationWidth) {
  return Math.round(offset / indentationWidth)
}

export const getProjection = (
  items,
  activeId,
  overId,
  dragOffset,
  indentationWidth,
) => {
  const overItemIndex = items.findIndex(({ id }) => id === overId)
  const activeItemIndex = items.findIndex(({ id }) => id === activeId)
  const activeItem = items[activeItemIndex]
  const newItems = arrayMove(items, activeItemIndex, overItemIndex)
  const previousItem = newItems[overItemIndex - 1]
  const nextItem = newItems[overItemIndex + 1]
  const dragDepth = getDragDepth(dragOffset, indentationWidth)
  const projectedDepth = activeItem.depth + dragDepth

  const maxDepth = getMaxDepth({
    previousItem,
  })

  const minDepth = getMinDepth({ nextItem })
  let depth = projectedDepth

  if (projectedDepth >= maxDepth) {
    depth = maxDepth
  } else if (projectedDepth < minDepth) {
    depth = minDepth
  }

  const parentId = getParentId()
  const parent = items.find(i => i.id === parentId)

  if (parent && depth > 0) {
    if (
      parent.componentType === 'chapter' &&
      parent.parentComponentId &&
      activeItem.componentType === 'chapter'
    ) {
      return { depth, maxDepth, minDepth, parentId: parent.parentComponentId }
    }

    // only allow nesting if parent is part and active item is chapter
    if (
      parent.componentType !== 'part' ||
      activeItem.componentType !== 'chapter'
    )
      return null
  }

  return { depth, maxDepth, minDepth, parentId: getParentId() }

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId
    }

    if (depth > previousItem.depth) {
      return previousItem.id
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find(item => item.depth === depth)?.parentId

    return newParent ?? null
  }
}

function getMaxDepth({ previousItem }) {
  if (previousItem) {
    return previousItem.depth + 1
  }

  return 0
}

function getMinDepth({ nextItem }) {
  if (nextItem) {
    return nextItem.depth
  }

  return 0
}

function flatten(items = [], parentId = null, depth = 0) {
  return items.reduce((acc, item, index) => {
    return [
      ...acc,
      { ...item, parentId, depth, index },
      ...flatten(item.children || [], item.id, depth + 1),
    ]
  }, [])
}

export function flattenTree(items) {
  return flatten(items)
}

export function buildTree(flattenedItems) {
  const root = { id: 'root', children: [] }
  const nodes = { [root.id]: root }
  const items = flattenedItems.map(item => ({ ...item, children: [] }))

  items.forEach(item => {
    const { id, children } = item
    const parentId = item.parentId ?? root.id
    const parent = nodes[parentId] ?? findItem(items, parentId)

    nodes[id] = { id, children }
    parent.children.push(item)
  })

  return root.children
}

export function findItem(items, itemId) {
  return items.find(({ id }) => id === itemId)
}

export const findItemDeep = (items, itemId) => {
  items.forEach(item => {
    const { id, children = [] } = item

    if (id === itemId) {
      return item
    }

    if (children.length) {
      const child = findItemDeep(children, itemId)

      if (child) {
        return child
      }
    }
  })

  return undefined
}

export function removeItem(items, id) {
  const newItems = []

  items.forEach(item => {
    if (item.id === id) {
      return
    }

    if (item.children.length) {
      item.children = removeItem(item.children, id)
    }

    newItems.push(item)
  })

  return newItems
}

export function setProperty(items, id, property, setter) {
  items.forEach(item => {
    if (item.id === id) {
      item[property] = setter(item[property])
      return
    }

    if (item.children?.length) {
      item.children = setProperty(item.children, id, property, setter)
    }
  })

  return [...items]
}

function countChildren(items = [], count = 0) {
  return items.reduce((acc, { children }) => {
    if (children.length) {
      return countChildren(children, acc + 1)
    }

    return acc + 1
  }, count)
}

export function getChildCount(items, id) {
  const item = findItemDeep(items, id)

  return item ? countChildren(item.children) : 0
}

export function removeChildrenOf(items, ids) {
  const excludeParentIds = [...ids]

  return items.filter(item => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (item.children.length) {
        excludeParentIds.push(item.id)
      }

      return false
    }

    return true
  })
}

export const directions = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
]

export const horizontal = [KeyboardCode.Left, KeyboardCode.Right]

export const sortableTreeKeyboardCoordinates =
  (context, indicator, indentationWidth) =>
  (
    event,
    {
      currentCoordinates,
      context: {
        active,
        over,
        collisionRect,
        droppableRects,
        droppableContainers,
      },
    },
  ) => {
    if (directions.includes(event.code)) {
      if (!active || !collisionRect) {
        return
      }

      event.preventDefault()

      const {
        current: { items, offset },
      } = context

      if (horizontal.includes(event.code) && over?.id) {
        const projection =
          getProjection(items, active.id, over.id, offset, indentationWidth) ||
          {}

        const { depth, maxDepth, minDepth } = projection

        switch (event.code) {
          case KeyboardCode.Left:
            if (depth > minDepth) {
              return {
                ...currentCoordinates,
                x: currentCoordinates.x - indentationWidth,
              }
            }

            break
          case KeyboardCode.Right:
            if (depth < maxDepth) {
              return {
                ...currentCoordinates,
                x: currentCoordinates.x + indentationWidth,
              }
            }

            break
          default:
            break
        }

        return undefined
      }

      const containers = []

      droppableContainers.forEach(container => {
        if (container?.disabled || container.id === over?.id) {
          return
        }

        const rect = droppableRects.get(container.id)

        if (!rect) {
          return
        }

        switch (event.code) {
          case KeyboardCode.Down:
            if (collisionRect.top < rect.top) {
              containers.push(container)
            }

            break
          case KeyboardCode.Up:
            if (collisionRect.top > rect.top) {
              containers.push(container)
            }

            break
          default:
            break
        }
      })

      const collisions = closestCorners({
        active,
        collisionRect,
        pointerCoordinates: null,
        droppableRects,
        droppableContainers: containers,
      })

      let closestId = getFirstCollision(collisions, 'id')

      if (closestId === over?.id && collisions.length > 1) {
        closestId = collisions[1].id
      }

      if (closestId && over?.id) {
        const activeRect = droppableRects.get(active.id)
        const newRect = droppableRects.get(closestId)
        const newDroppable = droppableContainers.get(closestId)

        if (activeRect && newRect && newDroppable) {
          const newIndex = items.findIndex(({ id }) => id === closestId)
          const newItem = items[newIndex]
          const activeIndex = items.findIndex(({ id }) => id === active.id)
          const activeItem = items[activeIndex]

          if (newItem && activeItem) {
            const { depth } = getProjection(
              items,
              active.id,
              closestId,
              (newItem.depth - activeItem.depth) * indentationWidth,
              indentationWidth,
            )

            const isBelow = newIndex > activeIndex
            const modifier = isBelow ? 1 : -1

            const offset2 = indicator
              ? (collisionRect.height - activeRect.height) / 2
              : 0

            const newCoordinates = {
              x: newRect.left + depth * indentationWidth,
              y: newRect.top + modifier * offset2,
            }

            return newCoordinates
          }
        }
      }
    }

    return undefined
  }

export const dropAnimationConfig = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ]
  },
  easing: 'ease-out',
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    })
  },
}

function getItemGap$1(clientRects, index, activeIndex) {
  const currentRect = clientRects[index]
  const previousRect = clientRects[index - 1]
  const nextRect = clientRects[index + 1]

  if (!currentRect) {
    return 0
  }

  if (activeIndex < index) {
    return previousRect
      ? currentRect.top - (previousRect.top + previousRect.height)
      : nextRect
      ? nextRect.top - (currentRect.top + currentRect.height)
      : 0
  }

  return nextRect
    ? nextRect.top - (currentRect.top + currentRect.height)
    : previousRect
    ? currentRect.top - (previousRect.top + previousRect.height)
    : 0
}

const defaultScale$1 = {
  scaleX: 1,
  scaleY: 1,
}

export const verticalListSortingStrategyCustom = _ref => {
  const {
    activeIndex,
    activeNodeRect: fallbackActiveRect,
    index,
    rects,
    overIndex,
  } = _ref

  const rects$activeIndex = rects[activeIndex]

  const activeNodeRect =
    rects$activeIndex != null ? rects$activeIndex : fallbackActiveRect

  if (!activeNodeRect) {
    return null
  }

  if (index === activeIndex) {
    const overIndexRect = rects[overIndex]

    if (!overIndexRect) {
      return null
    }

    return {
      x: 0,
      y:
        activeIndex < overIndex
          ? overIndexRect.top +
            overIndexRect.height -
            (activeNodeRect.top + activeNodeRect.height)
          : overIndexRect.top - activeNodeRect.top,

      ...defaultScale$1,
    }
  }

  const itemGap = getItemGap$1(rects, index, activeIndex)

  if (index > activeIndex && index <= overIndex) {
    return {
      x: 0,
      y: -activeNodeRect.height - itemGap,
      ...defaultScale$1,
    }
  }

  if (index < activeIndex && index >= overIndex) {
    return {
      x: 0,
      y: activeNodeRect.height,
      ...defaultScale$1,
    }
  }

  return {
    x: 0,
    y: 0,
    ...defaultScale$1,
  }
}
