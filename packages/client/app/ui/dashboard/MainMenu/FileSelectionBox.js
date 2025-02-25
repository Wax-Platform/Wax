import React, { useCallback, useEffect, useState } from 'react'
import { useDocumentContext } from '../hooks/DocumentContext'
import { useAiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
import styled from 'styled-components'
import { arrIf } from '../../../shared/generalUtils'

const SelectionBox = styled.div`
  background-color: #9500ff27;
  border: 1px solid #deafff;
  height: ${p => p.$h}px;
  left: ${p => p.$x}px;
  position: absolute;
  top: ${p => p.$y}px;
  width: ${p => p.$w}px;
  z-index: 999999999;
`

export const FileSelectionBox = ({ containerRef }) => {
  const { setSelectedDocs } = useDocumentContext()
  const { userInteractions } = useAiDesignerContext()
  const [selectionBox, setSelectionBox] = useState(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })

  const handleMouseDown = e => {
    if (!userInteractions.shift) return
    if (e.button !== 0) return

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()

    const offsetX = e.clientX - containerRect.left
    const offsetY = e.clientY - containerRect.top + container.scrollTop

    setIsSelecting(true)
    setStartPoint({ x: offsetX, y: offsetY })
    setSelectionBox({ x: offsetX, y: offsetY, width: 0, height: 0 })
  }

  const handleMouseMove = useCallback(
    e => {
      if (!isSelecting) return
      if (!userInteractions.shift) {
        setIsSelecting(false)
        setSelectionBox(null)
        return
      }
      e.stopPropagation()

      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()

      const offsetX = e.clientX - containerRect.left
      const offsetY = e.clientY - containerRect.top + container.scrollTop

      const $w = Math.abs(offsetX - startPoint.x)
      const $h = Math.abs(offsetY - startPoint.y)
      const $x = offsetX < startPoint.x ? offsetX : startPoint.x
      const $y = offsetY < startPoint.y ? offsetY : startPoint.y

      setSelectionBox({ $x, $y, $w, $h })
      const selectionRect = {
        left: $x,
        top: $y,
        right: $x + $w,
        bottom: $y + $h,
      }

      const selectedElements = [
        ...container.querySelectorAll('[data-resource-id]'),
      ].filter(el => {
        const elRect = el.getBoundingClientRect()
        const elLeft = elRect.left - containerRect.left
        const elTop = elRect.top - containerRect.top + container.scrollTop
        const elRight = elLeft + elRect.width
        const elBottom = elTop + elRect.height

        const isElementSelected =
          elLeft < selectionRect.right &&
          elRight > selectionRect.left &&
          elTop < selectionRect.bottom &&
          elBottom > selectionRect.top

        return isElementSelected
      })

      const selectedIds = selectedElements.map(el => el.dataset.resourceId)
      selectedIds.length &&
        setSelectedDocs(pr => [
          ...new Set([...arrIf(userInteractions.ctrl, pr), ...selectedIds]),
        ])
    },
    [
      isSelecting,
      startPoint,
      containerRef,
      setSelectedDocs,
      userInteractions.shift,
      userInteractions.ctrl,
    ],
  )

  const handleMouseUp = useCallback(
    e => {
      userInteractions.shift && e.stopPropagation()
      setIsSelecting(false)
      setSelectionBox(null)
    },
    [userInteractions.shift],
  )

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('mousedown', handleMouseDown)
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('click', handleMouseUp)
    }
    return () => {
      if (container) {
        container.removeEventListener('mousedown', handleMouseDown)
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('click', handleMouseUp)
      }
    }
  }, [handleMouseDown, handleMouseMove, handleMouseUp])

  return selectionBox ? <SelectionBox {...selectionBox} /> : null
}
