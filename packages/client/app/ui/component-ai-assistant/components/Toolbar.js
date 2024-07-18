/* stylelint-disable indentation */
/* stylelint-disable string-quotes */
/* stylelint-disable no-descending-specificity */
import React, { useContext, useState } from 'react'
import { FilePdfOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { values } from 'lodash'
import { AiDesignerContext } from '../hooks/AiDesignerContext'
import AidLogoSmall from '../../../../static/AI Design Studio-Icon.svg'
import handCursor from '../../../../static/cursor-hand3.svg'
import dropperIcon from '../../../../static/dropper-icon.svg'
import brushIcon from '../../../../static/brush-icon.svg'
import chatIcon from '../../../../static/chat-icon.svg'
// import modelIcon from '../../../../static/model-icon.svg'
import targetIcon from '../../../../static/target-icon.svg'
import inputIcon from '../../../../static/input-icon.svg'
import textIcon from '../../../../static/text-icon.svg'
import paintIcon from '../../../../static/paint-icon.svg'
import paintBucketIcon from '../../../../static/paint-bucket-icon.svg'
import waxIcon from '../../../../static/waxdesignerwhite.svg'
// import { SnippetIcon } from '../utils'
import Each from '../utils/Each'
import AiDesigner from '../../../AiDesigner/AiDesigner'
import { SnipsDropDown } from './SnipsDropdown'

const DesignerTools = styled.div`
  --snippet-icon-st: #fff;
  align-items: center;
  background: linear-gradient(#fff, #fff) padding-box,
    linear-gradient(
        45deg,
        var(--color-green),
        var(--color-yellow),
        var(--color-orange),
        var(--color-blue)
      )
      border-box;
  border: 3px solid transparent;
  border-radius: 1.5rem;
  box-shadow: 0 0 4px #0004, inset 0 0 2px #000a;
  display: flex;
  flex-direction: column;
  /* height: 100%; */
  outline: none;
  padding: 10px 0;
  position: absolute;
  transform: rotateZ(${p => (p.$horizontal ? '-90deg' : '0')})
    translateY(${p => (p.$horizontal ? '-60px' : '0')});
  transform-origin: top right;
  transition: transform 0.5s;
  user-select: none;
  width: 50px;
  z-index: 99999999;

  #snips-dropdown {
    right: ${p => (p.$horizontal ? '0' : '53px')};
    top: ${p => (p.$horizontal ? '53px' : '-1px')};
    transition: all 0.4s;
    z-index: 1;
  }

  > button,
  > :first-child {
    border: 1px solid #0000;
    border-bottom: ${p =>
      !p.$horizontal
        ? '1px solid var(--color-blue-alpha-2)'
        : '1px solid #0000'};
    border-right: ${p =>
      p.$horizontal
        ? '1px solid var(--color-blue-alpha-2)'
        : '1px solid #0000'};
    height: ${p => (p.$horizontal ? '40px' : '30px')};
    transform: rotateZ(${p => (p.$horizontal ? '90deg' : '0')});
    transition: all 0.8s;
    width: ${p => (p.$horizontal ? '40px' : '40px')};
    z-index: 9;
  }

  img:not(:first-child),
  .anticon svg:not(#snips-dropdown .anticon svg),
  > button > img {
    color: var(--color-blue);
    height: 18px;
    object-fit: contain;
    width: 100%;
  }

  > :first-child {
    height: 22px;
    margin: ${p => (!p.$horizontal ? '8px 6px 10px 2px' : '8px 0px 10px 3px')};
    width: 22px;
  }

  > *:not(:first-child) {
    border-radius: 3px;
    padding: 5px;
    transition: all 0.3s;

    &:hover {
      background: var(--color-blue-alpha-2);
    }
  }

  button {
    background: none;
    cursor: pointer;
    filter: grayscale();
    margin: 0;
    outline: none;
    padding: 0;

    > svg {
      height: 20px;
      width: 20px;
    }
  }

  button[data-active='true'] {
    filter: none;
  }

  button[data-dropdown='true'] {
    background: var(--color-blue-alpha-2);
  }

  svg {
    fill: var(--color-blue);
  }
`

const DragButton = styled.button`
  background-color: #ddd;
  height: 5px;
  width: 15px;
`

const Toolbar = props => {
  const {
    mutateSettings,
    updateLayout,
    updateTools,
    tools: ctxTools,
    layout,
    selectedCtx,
    showSnippets,
    editorContainerRef,
    setShowSnippets,
    settings: {
      editor: { contentEditable, enableSelection, displayStyles },
    },
  } = useContext(AiDesignerContext)
  const [horizontal, setHorizontal] = useState(false)
  const [position, setPosition] = useState({
    top: 145,
    left: window.visualViewport.width - 80,
  })
  const [cursor, setCursor] = useState('grab')

  const handleMouseDown = event => {
    event.preventDefault()
    event.stopPropagation()
    setCursor('grabbing')
    // Capture initial mouse position relative to the viewport
    let initialX = event.clientX - parseInt(position.left, 10)
    let initialY = event.clientY - parseInt(position.top, 10)

    const moveMouse = e => {
      const newX = e.clientX - initialX
      const newY = e.clientY - initialY

      setPosition({
        left: `${newX}px`,
        top: `${newY}px`,
      })
    }

    document.addEventListener('mousemove', moveMouse)

    document.onclick = () => {
      document.removeEventListener('mousemove', moveMouse)
      document.onclick = null
      setCursor('grab')
    }
  }
  const scrollToSelectedNode = () => {
    const node = document.querySelector(`[data-aidctx="${selectedCtx.aidctx}"`)
    node &&
      editorContainerRef?.current &&
      editorContainerRef.current.scrollTo(0, node.offsetTop, {
        behavior: 'smooth',
      })
  }

  const renderTool = ({ src, Icon, imgProps, DropDown, ...rest }) => {
    return (
      <button type="button" {...rest}>
        {Icon ? <Icon {...imgProps} /> : <img src={src} {...imgProps} />}
        {DropDown && <DropDown />}
      </button>
    )
  }

  const tools = {
    selection: {
      src: handCursor,
      onClick: () => {
        AiDesigner.updateContext()
        mutateSettings('editor', {
          enableSelection: !enableSelection,
        })
      },
      imgProps: {},
      title: `${!enableSelection ? 'Enable' : 'Disable'} element selection`,
      'data-active': enableSelection,
    },
    goToSelectedNode: {
      src: targetIcon,
      onClick: scrollToSelectedNode,
      title: 'Scroll to selected node',
      imgProps: {},
    },
    enableEdit: {
      src: textIcon,
      onClick: () => {
        mutateSettings('editor', {
          contentEditable: !contentEditable,
        })
      },
      imgProps: { style: { height: '22px' } },
      title: `${!contentEditable ? 'Enable' : 'Disable'} Text editing`,
      'data-active': contentEditable,
    },
    dropper: {
      src: dropperIcon,
      onClick: () => {
        updateTools('dropper', { active: !ctxTools.dropper.active }, ['brush'])
      },
      imgProps: { style: { height: '18px' } },
      'data-active': ctxTools.dropper.active,
    },
    brush: {
      src: brushIcon,
      onClick: () => {
        updateTools('brush', { active: !ctxTools.brush.active }, ['dropper'])
      },
      onDoubleClick: () => {
        setShowSnippets(!showSnippets)
      },
      imgProps: { style: { height: '22px' } },
      'data-active': showSnippets || ctxTools.brush.active,
      'data-dropdown': showSnippets,
      DropDown: SnipsDropDown,
      style: { position: 'relative' },
    },
    paintBucket: {
      onClick: () => {
        updateTools('paintBucket', { active: !ctxTools.paintBucket.active }, [
          'dropper',
          'brush',
        ])
      },
      src: paintBucketIcon,
      imgProps: { style: { height: '22px' } },
      'data-active': ctxTools?.paintBucket?.active,
    },
    toggleChat: {
      src: chatIcon,
      onClick: () => {
        updateLayout({ chat: !layout.chat })
      },
      imgProps: {},
      'data-active': layout.chat,
    },
    toggleWax: {
      src: waxIcon,
      onClick: () => {
        updateLayout({ editor: !layout.editor })
      },
      imgProps: { style: { width: '30px', paddingTop: '2px' } },
      'data-active': layout.editor,
    },
    toggleInput: {
      src: inputIcon,
      onClick: () => {
        updateLayout({ input: !layout.input })
      },
      imgProps: {},
      'data-active': layout.input,
    },
    togglePreview: {
      Icon: FilePdfOutlined,
      onClick: () => {
        updateLayout({ preview: !layout.preview })
      },
      imgProps: {},
      'data-active': layout.preview,
    },
    // model: { src: modelIcon, onClick: () => {}, imgProps: {} },
    displayStyles: {
      src: paintIcon,
      onClick: () => {
        mutateSettings('editor', {
          displayStyles: !displayStyles,
        })
      },
      'data-active': displayStyles,
    },
  }

  return (
    <DesignerTools $horizontal={horizontal} {...props} style={{ ...position }}>
      <img
        onMouseDown={handleMouseDown}
        onDoubleClick={() => {
          setHorizontal(!horizontal)
        }}
        style={{ cursor }}
        alt="aid-logo"
        src={AidLogoSmall}
      />

      <Each fallback={null} of={values(tools)} render={renderTool} />
    </DesignerTools>
  )
}

export default Toolbar
