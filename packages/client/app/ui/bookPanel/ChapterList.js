/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import styled from 'styled-components'
// import { useTranslation } from 'react-i18next'
import {
  buildTree,
  flattenTree,
  getProjection,
  removeChildrenOf,
  sortableTreeKeyboardCoordinates,
  iOS,
  dropAnimationConfig,
  verticalListSortingStrategyCustom,
} from './sortTreeUtilities'
import ChapterItem from './ChapterItem'
import Spin from '../common/Spin'

const ChapterListWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto;
`

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
}

const animateLayoutChanges = ({ isSorting, wasDragging }) =>
  !(isSorting || wasDragging)

/* eslint-disable-next-line react/prop-types */
const SortableTreeItem = ({ id, depth, ...props }) => {
  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <ChapterItem
      depth={depth}
      disableInteraction={isSorting}
      disableSelection={iOS}
      ghost={isDragging}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      id={id}
      ref={setDraggableNodeRef}
      style={style}
      wrapperRef={setDroppableNodeRef}
      {...props}
    />
  )
}

const ChapterList = ({
  chapters,
  onBookComponentTypeChange,
  onBookComponentParentIdChange,
  onChapterClick,
  onReorderChapter,
  selectedChapterId,
  onDeleteChapter,
  chaptersActionInProgress,
  className,
  canEdit,
}) => {
  const indentationWidth = 33

  const [items, setItems] = useState(() =>
    chapters.map(ch => ({
      ...ch,
      ...(ch.componentType === 'part'
        ? {
            children: [],
          }
        : {}),
    })),
  )

  const [activeId, setActiveId] = useState(null)
  const [previousActiveId, setPreviousActiveId] = useState(null)
  const [overId, setOverId] = useState(null)
  const [offsetLeft, setOffsetLeft] = useState(0)
  const [currentPosition, setCurrentPosition] = useState(null)
  const chapterList = useRef()

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items)

    const collapsedItems = flattenedTree.reduce(
      (acc, { children, collapsed, id }) =>
        collapsed && children.length ? [...acc, id] : acc,
      [],
    )

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems,
    )
  }, [activeId, items])

  useEffect(() => {
    const sortedItems = chapters.map(ch => ({
      ...ch,
      ...(ch.componentType === 'part'
        ? {
            children: [],
          }
        : {
            parentId: ch.parentComponentId,
          }),
    }))

    const newItems = buildTree(sortedItems)
    setItems(newItems)
  }, [chapters])

  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth,
        )
      : null

  const sensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  })

  const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(sensorContext, false, indentationWidth),
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    }),
  )

  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems],
  )

  const activeItem = activeId
    ? flattenedItems.find(({ id }) => id === activeId)
    : null

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    }
  }, [flattenedItems, offsetLeft])

  const announcements = {
    onDragStart({ active }) {
      return `Picked up ${active.id}.`
    },
    onDragMove({ active, over }) {
      return getMovementAnnouncement('onDragMove', active.id, over?.id)
    },
    onDragOver({ active, over }) {
      return getMovementAnnouncement('onDragOver', active.id, over?.id)
    },
    onDragEnd({ active, over }) {
      return getMovementAnnouncement('onDragEnd', active.id, over?.id)
    },
    onDragCancel({ active }) {
      return `Moving was cancelled. ${active.id} was dropped in its original position.`
    },
  }

  const getMovementAnnouncement = (eventName, activeId, overId) => {
    if (overId && projected) {
      if (eventName !== 'onDragEnd') {
        if (
          currentPosition &&
          projected.parentId === currentPosition.parentId &&
          overId === currentPosition.overId
        ) {
          return
        }

        setCurrentPosition({
          parentId: projected.parentId,
          overId,
        })
      }

      const clonedItems = JSON.parse(JSON.stringify(flattenTree(items)))
      const overIndex = clonedItems.findIndex(({ id }) => id === overId)
      const activeIndex = clonedItems.findIndex(({ id }) => id === activeId)
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex)

      const previousItem = sortedItems[overIndex - 1]

      let announcement
      const movedVerb = eventName === 'onDragEnd' ? 'dropped' : 'moved'
      const nestedVerb = eventName === 'onDragEnd' ? 'dropped' : 'nested'

      if (!previousItem) {
        const nextItem = sortedItems[overIndex + 1]
        announcement = `${activeId} was ${movedVerb} before ${nextItem.id}.`
      } else if (projected.depth > previousItem.depth) {
        announcement = `${activeId} was ${nestedVerb} under ${previousItem.id}.`
      } else {
        let previousSibling = previousItem

        while (previousSibling && projected.depth < previousSibling.depth) {
          const { parentId } = previousSibling
          previousSibling = sortedItems.find(({ id }) => id === parentId)
        }

        if (previousSibling) {
          announcement = `${activeId} was ${movedVerb} after ${previousSibling.id}.`
        }
      }

      /* eslint-disable-next-line consistent-return */
      return announcement
    }
  }

  const handleDragStart = ({ active: { id: activeId } }) => {
    setActiveId(activeId)
    setOverId(activeId)

    const activeItem = flattenedItems.find(({ id }) => id === activeId)

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId,
      })
    }

    document.body.style.setProperty('cursor', 'grabbing')
  }

  const handleDragMove = ({ delta }) => {
    setOffsetLeft(delta.x)
  }

  const handleDragOver = ({ over }) => {
    setOverId(over?.id ?? null)
  }

  const handleDragEnd = async ({ active, over }) => {
    resetState()

    if (!canEdit) {
      return
    }

    if (projected && over) {
      const { depth, parentId } = projected
      const clonedItems = JSON.parse(JSON.stringify(flattenTree(items)))
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id)
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id)
      const activeTreeItem = clonedItems[activeIndex]

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId }

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex)
      const newItems = buildTree(sortedItems)

      setItems(newItems)

      if (projected.parentId !== activeTreeItem.parentComponentId) {
        await onBookComponentParentIdChange(active.id, projected.parentId)
      }

      onReorderChapter(flattenTree(newItems))
    }
  }

  const handleDragCancel = () => {
    resetState()
  }

  const resetState = () => {
    setOverId(null)
    setPreviousActiveId(activeId)
    setActiveId(null)
    setOffsetLeft(0)
    setCurrentPosition(null)

    // reset collapsed items
    const partsWithChapters = items.filter(
      item => item.componentType === 'part' && item.children?.length > 0,
    )

    partsWithChapters.forEach(item => {
      item.collapsed = false
    })

    document.body.style.setProperty('cursor', '')
  }

  const collapseOtherParts = () => {
    // collapse all other items
    const partsWithChapters = items.filter(
      item => item.componentType === 'part' && item.children?.length > 0,
    )

    partsWithChapters.forEach(item => {
      item.collapsed = true
    })
  }

  // const handleChapterDuplicate = id => {
  //   onDuplicateChapter(id)
  // }

  const handleChapterDelete = async id => {
    const item = items.find(i => i.id === id)

    if (item && item.children?.length) {
      await Promise.all(
        item.children.map(async chapter => {
          await onBookComponentParentIdChange(chapter.id, null)
        }),
      )
    }

    onDeleteChapter(id)
    setFocusedChapter(
      id === selectedChapterId
        ? 0
        : chapters.findIndex(chapter => chapter.id === selectedChapterId) || 0,
    )
  }

  const handleChapterConvert = async (id, type) => {
    onBookComponentTypeChange(id, type)

    // if transforming part into chapter remove all children
    if (type === 'chapter') {
      const item = items.find(i => i.id === id)

      await Promise.all(
        item.children.map(async chapter => {
          await onBookComponentParentIdChange(chapter.id, null)
        }),
      )
    }
  }

  const [focusedChapter, setFocusedChapter] = useState(
    selectedChapterId
      ? flattenedItems.findIndex(chapter => chapter.id === selectedChapterId)
      : 0,
  )

  useEffect(() => {
    const activeItemIndex = flattenedItems.findIndex(ch =>
      activeId ? ch.id === activeId : ch.id === previousActiveId,
    )

    activeItemIndex !== -1 && setFocusedChapter(activeItemIndex)
  }, [flattenedItems])

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'ArrowUp') {
        setFocusedChapter(prevIndex => (prevIndex > 0 ? prevIndex - 1 : 0))
      } else if (event.key === 'ArrowDown') {
        setFocusedChapter(prevIndex =>
          prevIndex < flattenedItems.length - 1 ? prevIndex + 1 : prevIndex,
        )
      }
    }

    chapterList?.current?.addEventListener('keydown', handleKeyDown)

    return () => {
      chapterList?.current?.removeEventListener('keydown', handleKeyDown)
    }
  }, [flattenedItems, focusedChapter])

  const handleChapterClick = id => {
    if (
      !chapterList.current?.getAttribute('data-rbd-scroll-container-context-id')
    ) {
      onChapterClick(id)
    }
  }

  return (
    <ChapterListWrapper className={className} ref={chapterList} role="menu">
      <Spin spinning={chaptersActionInProgress}>
        <DndContext
          accessibility={{ announcements }}
          collisionDetection={closestCenter}
          measuring={measuring}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
          onDragMove={handleDragMove}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          sensors={sensors}
        >
          <SortableContext
            items={sortedIds}
            strategy={verticalListSortingStrategyCustom}
          >
            <div style={{ display: ' flex', flexDirection: ' column' }}>
              {flattenedItems.map(
                ({ id, children, depth, componentType, ...rest }, index) => (
                  <SortableTreeItem
                    canEdit={canEdit}
                    childCount={children?.length}
                    collapseOtherParts={collapseOtherParts}
                    depth={
                      id === activeId && projected ? projected.depth : depth
                    }
                    focused={focusedChapter === index}
                    id={id}
                    indentationWidth={indentationWidth}
                    index={index}
                    isPart={componentType === 'part'}
                    key={id}
                    onChapterClick={handleChapterClick}
                    onChapterConvert={handleChapterConvert}
                    onClickDelete={handleChapterDelete}
                    selectedChapterId={selectedChapterId}
                    {...rest}
                  />
                ),
              )}
            </div>
            {createPortal(
              <DragOverlay
                dropAnimation={dropAnimationConfig}
                modifiers={undefined}
              >
                {activeId && activeItem ? (
                  <SortableTreeItem
                    clone
                    depth={activeItem.depth}
                    id={activeId}
                    key={activeId}
                    selectedChapterId={selectedChapterId}
                    title={activeItem.title}
                  />
                ) : null}
              </DragOverlay>,
              document.body,
            )}
          </SortableContext>
        </DndContext>
      </Spin>
    </ChapterListWrapper>
  )
}

ChapterList.propTypes = {
  chapters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      lockedBy: PropTypes.string,
      status: PropTypes.number,
    }),
  ),
  selectedChapterId: PropTypes.string,
  onChapterClick: PropTypes.func.isRequired,
  onReorderChapter: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
  // onDuplicateChapter: PropTypes.func.isRequired,
  onDeleteChapter: PropTypes.func.isRequired,
  chaptersActionInProgress: PropTypes.bool.isRequired,
  onBookComponentTypeChange: PropTypes.func,
  onBookComponentParentIdChange: PropTypes.func,
}
ChapterList.defaultProps = {
  chapters: [],
  selectedChapterId: undefined,
  onBookComponentTypeChange: null,
  onBookComponentParentIdChange: null,
}

export default ChapterList
