/* stylelint-disable indentation */
/* stylelint-disable string-quotes */
/* stylelint-disable no-descending-specificity */
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { FilePdfOutlined, LayoutOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { debounce, values } from 'lodash'
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
        var(--color-secondary),
        var(--color-pink),
        var(--color-orange),
        var(--color-trois)
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
    transition: all 0.3s;
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
    color: var(--color-trois);
    object-fit: contain;
    padding: 0;
  }

  > :first-child {
    height: 25px;
    margin: ${p => (!p.$horizontal ? '8px 6px 10px 2px' : '8px 0px 10px 3px')};
    width: 25px;
  }

  > *:not(:first-child) {
    border-radius: 3px;
    height: 26px;
    padding: 0;
    transition: all 0.3s;
    width: 26px;

    &:hover {
      transform: scale(1.08);
    }
  }

  button {
    background: none;
    cursor: pointer;
    margin: 0;
    outline: none;
    padding: 0;

    .anticon svg:not(#snips-dropdown .anticon svg),
    > img {
      filter: grayscale();
      opacity: 0.5;
    }

    > svg {
      height: 20px;
      width: 20px;
    }
  }

  button[data-active='true'] {
    .anticon svg:not(#snips-dropdown .anticon svg),
    > img {
      filter: none;
      opacity: 1;
    }
  }

  button[data-dropdown='true'] {
    background: var(--color-blue-alpha-2);
  }

  svg {
    fill: var(--color-trois);
  }
`

const DragButton = styled.button`
  background-color: #ddd;
  height: 5px;
  width: 15px;
`

const Toolbar = ({ drag, ...props }) => {
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
    previewRef,
    settings: {
      editor: { contentEditable, enableSelection, displayStyles },
    },
    designerOn,
  } = useContext(AiDesignerContext)

  const toolbarRef = useRef(null)
  const [horizontal, setHorizontal] = useState(false)
  const [position, setPosition] = useState({
    top: 135,
    left: window.visualViewport.width - 80,
  })
  const [cursor, setCursor] = useState('grab')

  const handleMouseDown = event => {
    if (!drag) return
    event.preventDefault()
    event.stopPropagation()
    setCursor('grabbing')
    toolbarRef.current.style.transition &&
      (toolbarRef.current.style.transition = '')

    let initialX = event.clientX - parseInt(position.left, 10)
    let initialY = event.clientY - parseInt(position.top, 10)

    const moveMouse = e => {
      const left = e.clientX - initialX > 80 ? e.clientX - initialX : 80
      const top = e.clientY - initialY > 135 ? e.clientY - initialY : 135

      setPosition({ left, top })
    }

    document.addEventListener('mousemove', moveMouse)

    document.onclick = () => {
      document.removeEventListener('mousemove', moveMouse)
      document.onclick = null
      setCursor('grab')
    }
  }
  const limitPosition = () => {
    const { width, height } = toolbarRef?.current?.getBoundingClientRect() || {}
    const axis = horizontal ? width : 56
    const top =
      position.top + 15 > window.visualViewport.height - height
        ? window.visualViewport.height - height - 15
        : position.top
    const left =
      position.left + 20 > window.visualViewport.width - width
        ? window.visualViewport.width - axis - 20
        : position.left
    setPosition({
      top,
      left,
    })
  }
  useLayoutEffect(() => {
    drag && limitPosition()
  }, [position.left, position.top, drag])

  useEffect(() => {
    if (!drag) return
    toolbarRef.current.style.transition = 'all 0.3s'
    debounce(() => {
      if (!toolbarRef?.current) return
      limitPosition()
      debounce(() => {
        if (!toolbarRef?.current) return
        toolbarRef.current.style.transition = ''
      }, 500)()
    }, 300)()
  }, [horizontal, enableSelection, drag])

  const scrollToSelectedNode = e => {
    e.preventDefault()
    const iframeElement = previewRef?.current?.contentDocument?.documentElement
    if (!iframeElement) return
    let node = iframeElement.querySelector(
      `[data-aidctx="${selectedCtx.aidctx}"]`,
    )
    let offsetTop = node.offsetTop
    let offsetLeft = node.offsetLeft

    // Traverse up the DOM tree, accumulating offsets
    while (node.offsetParent) {
      node = node.offsetParent
      offsetTop += node.offsetTop
      offsetLeft += node.offsetLeft
    }
    node &&
      iframeElement &&
      iframeElement.scrollTo({ top: offsetTop - 80, behavior: 'smooth' })
  }

  const renderTool = ({ src, Icon, imgProps, DropDown, disabled, ...rest }) => {
    return !disabled ? (
      <button type="button" {...rest}>
        {Icon ? <Icon {...imgProps} /> : <img src={src} {...imgProps} />}
        {DropDown && <DropDown />}
      </button>
    ) : null
  }

  const tools = {
    // selection: {
    //   src: handCursor,
    //   onClick: () => {
    //     AiDesigner.updateContext()
    //     enableSelection && AiDesigner.select('aid-ctx-main')
    //     mutateSettings('editor', {
    //       enableSelection: !enableSelection,
    //     })
    //   },
    //   imgProps: {},
    //   title: `${!enableSelection ? 'Enable' : 'Disable'} element selection`,
    //   'data-active': enableSelection,
    // },
    goToSelectedNode: {
      src: targetIcon,
      onClick: scrollToSelectedNode,
      title: 'Scroll to selected node',
      disabled: !selectedCtx?.node,
      'data-active': !!selectedCtx?.node,
      imgProps: {},
    },
    // enableEdit: {
    //   src: textIcon,
    //   onClick: () => {
    //     mutateSettings('editor', {
    //       contentEditable: !contentEditable,
    //     })
    //   },
    //   imgProps: { style: { height: '22px' } },
    //   title: `${!contentEditable ? 'Enable' : 'Disable'} Text editing`,
    //   'data-active': contentEditable,
    // },
    // dropper: {
    //   disabled: !enableSelection,
    //   src: dropperIcon,
    //   onClick: () => {
    //     updateTools('dropper', { active: !ctxTools.dropper.active }, ['brush'])
    //   },
    //   imgProps: { style: { height: '18px', transform: 'scaleX(-1)' } },
    //   'data-active': ctxTools.dropper.active,
    // },
    // brush: {
    //   disabled: !enableSelection,
    //   src: brushIcon,
    //   onClick: () => {
    //     !showSnippets &&
    //       updateTools('brush', { active: !ctxTools.brush.active }, ['dropper'])
    //   },
    //   onDoubleClick: () => {
    //     setShowSnippets(!showSnippets)
    //   },
    //   imgProps: { style: { height: '22px', transform: 'scaleX(-1)' } },
    //   'data-active': ctxTools.brush.active,
    //   'data-dropdown': showSnippets,
    //   DropDown: SnipsDropDown,
    //   style: { position: 'relative' },
    // },
    // paintBucket: {
    //   onClick: () => {
    //     updateTools('paintBucket', { active: !ctxTools.paintBucket.active }, [
    //       'dropper',
    //       'brush',
    //     ])
    //   },
    //   src: paintBucketIcon,
    //   imgProps: { style: { height: '22px' } },
    //   'data-active': ctxTools?.paintBucket?.active,
    // },
    toggleChat: {
      src: chatIcon,
      title: 'Show chat',
      onClick: () => {
        updateLayout({ chat: !layout.chat })
      },
      imgProps: {},
      'data-active': layout.chat,
    },
    toggleWax: {
      // src: waxIcon,
      title: 'Toggle dual view',
      Icon: LayoutOutlined,
      onClick: () => {
        updateLayout({ editor: !layout.editor })
      },
      'data-active': layout.editor,
    },
    // toggleInput: {
    //   src: inputIcon,
    //   onClick: () => {
    //     updateLayout({ input: !layout.input })
    //   },
    //   imgProps: {},
    //   'data-active': layout.input,
    // },
    // togglePreview: {
    //   Icon: FilePdfOutlined,
    //   onClick: () => {
    //     updateLayout({ preview: !layout.preview })
    //   },
    //   imgProps: {},
    //   'data-active': layout.preview,
    // },
    // model: { src: modelIcon, onClick: () => {}, imgProps: {} },
    // displayStyles: {
    //   src: paintIcon,
    //   onClick: () => {
    //     mutateSettings('editor', {
    //       displayStyles: !displayStyles,
    //     })
    //   },
    //   'data-active': displayStyles,
    // },
  }

  useEffect(() => {
    !enableSelection && AiDesigner.select('aid-ctx-main')
  }, [enableSelection])

  return !designerOn ? null : (
    <DesignerTools
      ref={toolbarRef}
      $horizontal={horizontal}
      {...props}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      {drag ? (
        <img
          onMouseDown={handleMouseDown}
          onDoubleClick={() => {
            setHorizontal(!horizontal)
          }}
          style={{ cursor }}
          alt="aid-logo"
          src={AidLogoSmall}
        />
      ) : (
        <span></span>
      )}

      <Each fallback={null} of={values(tools)} render={renderTool} />
    </DesignerTools>
  )
}

export default Toolbar
