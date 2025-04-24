import React, { useContext, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { CssAssistantContext } from './hooks/CssAssistantContext'

const SelectionIndicator = styled.span`
  background-color: #0001;
  border: 1px dashed currentColor;
  pointer-events: none;
  position: absolute;
  transition: top 0.3s, left 0.3s, width 0.3s, height 0.3s, opacity 0.3s;
`

// eslint-disable-next-line react/prop-types
const SelectionBox = ({ topOffset = 5, leftOffset = 10 }) => {
  const { selectedNode, htmlSrc } = useContext(CssAssistantContext)
  const selectionBoxRef = useRef(null)

  useEffect(() => {
    const updateSelectionBoxPosition = () => {
      if (selectedNode !== htmlSrc) {
        if (selectedNode && selectionBoxRef.current) {
          const rect = selectedNode.getBoundingClientRect()
          const parent = selectionBoxRef?.current?.parentNode
          const parentRect = parent.getBoundingClientRect()

          selectionBoxRef.current.style.opacity = 1
          selectionBoxRef.current.style.left = `${
            rect.left - parentRect.left - leftOffset
          }px`
          selectionBoxRef.current.style.top = `${Math.floor(
            parent.scrollTop + rect.top - parentRect.top - topOffset,
          )}px`
          selectionBoxRef.current.style.width = `${
            rect.width + leftOffset * 2
          }px`
          selectionBoxRef.current.style.height = `${
            rect.height + topOffset * 2
          }px`
        }
      } else selectionBoxRef.current.style.opacity = 0
    }

    updateSelectionBoxPosition()

    selectionBoxRef?.current &&
      selectionBoxRef.current.parentNode.addEventListener(
        'scroll',
        updateSelectionBoxPosition,
      )
    selectionBoxRef?.current &&
      selectionBoxRef.current.parentNode.addEventListener(
        'resize',
        updateSelectionBoxPosition,
      )

    return () => {
      selectionBoxRef?.current &&
        selectionBoxRef.current.parentNode.removeEventListener(
          'scroll',
          updateSelectionBoxPosition,
        )
      selectionBoxRef?.current &&
        selectionBoxRef.current.parentNode.removeEventListener(
          'resize',
          updateSelectionBoxPosition,
        )
    }
  }, [selectedNode])

  return <SelectionIndicator ref={selectionBoxRef} />
}

export default SelectionBox
