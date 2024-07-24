import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { AiDesignerContext } from '../hooks/AiDesignerContext'
import { mapEntries, mapValues } from '../utils'
import brushIcon from '../../../../static/brush-icon.svg'
import dropperIcon from '../../../../static/dropper-icon.svg'
import styled from 'styled-components'

const FakeCursor = styled.div`
  background: none;
  cursor: none;
  display: flex;
  filter: brightness(0) drop-shadow(1px 0 0 white) drop-shadow(-1px 0 0 white)
    drop-shadow(0 1px 0 white) drop-shadow(0 -1px 0 white)
    drop-shadow(1px 1px 1px #0005);
  height: 30px;
  padding: 8px;
  pointer-events: none;
  position: absolute;
  width: 30px;
  z-index: 99999999999;

  img {
    height: auto;
    object-fit: contain;
    width: ${p => (p.tool === 'dropper' ? '25px' : '100%')};
  }
`
export const ToolsCursor = ({ container = window }) => {
  const {
    tools,
    settings: {
      editor: { enableSelection },
    },
    previewRef,
    updatePreview,
  } = useContext(AiDesignerContext)

  const [position, setPosition] = useState({
    top: 145,
    left: 0,
  })

  const handleMousemove = e => {
    console.log(e.clientX)
    const newX = e.clientX
    const newY = e.clientY

    setPosition({
      left: `${newX - 18}px`,
      top: `${newY - 23}px`,
    })
  }

  const someToolActive = () => {
    return mapValues(tools, t => t.active).filter(Boolean).length > 0
  }

  useLayoutEffect(() => {
    if (previewRef?.current?.contentDocument?.documentElement) {
      previewRef.current.contentDocument.documentElement.style.cursor =
        enableSelection && someToolActive() ? 'none' : 'unset'
    }
    previewRef?.current.contentDocument.addEventListener(
      'mousemove',
      handleMousemove,
    )
    return () => {
      previewRef?.current.contentDocument.removeEventListener(
        'mousemove',
        handleMousemove,
      )
    }
  }, [
    tools.brush.active,
    tools.dropper.active,
    enableSelection,
    previewRef?.current?.contentDocument,
    updatePreview,
  ])

  useEffect(() => {}, [])

  const cursors = {
    brush: brushIcon,
    dropper: dropperIcon,
  }

  const activeTool = mapEntries(tools, (k, v) => !!v.active && k).filter(
    Boolean,
  )[0]

  return enableSelection && someToolActive() ? (
    <FakeCursor style={{ ...position }} tool={activeTool}>
      <img src={cursors[activeTool]} style={{ transform: 'scaleX(-1)' }} />
    </FakeCursor>
  ) : null
}
