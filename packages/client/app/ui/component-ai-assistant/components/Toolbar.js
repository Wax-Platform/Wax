import React, { useContext } from 'react'
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
import AiDesigner from '../utils/AiDesigner'

const DesignerTools = styled.div`
  --snippet-icon-st: #fff;
  display: flex;
  align-items: center;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #0002;
  height: 100%;
  width: 50px;
  outline: none;
  padding: 0;
  position: relative;

  img:not(:first-child),
  .anticon svg,
  button > img {
    object-fit: contain;
    width: 100%;
    height: 18px;
    color: var(--color-blue);
    transition: all 0.5s;
  }
  button {
    filter: grayscale();
  }

  > :first-child {
    width: 22px;
    margin: 8px 6px 10px 2px;
    height: 22px;
  }
  > *:not(:first-child) {
    border-bottom: 1px solid var(--color-blue-alpha-2);
    padding: 5px;
    height: 35px;
    border-radius: 3px;
    width: 50px;
    transition: all 0.3s;
    &:hover {
      background: var(--color-blue-alpha-2);
    }
  }

  button {
    background: none;
    border: none;
    outline: none;
    padding: 0;
    margin: 0;
    cursor: pointer;

    > svg {
      width: 20px;
      height: 20px;
    }
  }

  button[data-active='true'] {
    filter: none;
  }

  svg {
    fill: var(--color-blue);
  }
  z-index: 999;
`

const Toolbar = () => {
  const {
    mutateSettings,
    updateLayout,
    updateTools,
    tools: ctxTools,
    layout,
    selectedCtx,
    editorContainerRef,
    settings: {
      editor: { contentEditable, enableSelection, displayStyles },
    },
  } = useContext(AiDesignerContext)

  const scrollToSelectedNode = () => {
    const node = document.querySelector(`[data-aidctx="${selectedCtx.dataRef}"`)
    node &&
      editorContainerRef?.current &&
      editorContainerRef.current.scrollTo(0, node.offsetTop)
  }

  const renderTool = ({ src, Icon, imgProps, ...rest }) => {
    return (
      <button type="button" {...rest}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        {Icon ? <Icon {...imgProps} /> : <img src={src} {...imgProps} />}
      </button>
    )
  }

  const tools = {
    selection: {
      src: handCursor,
      onClick: () => {
        AiDesigner.addAidCtx()
        mutateSettings('editor', {
          enableSelection: !enableSelection,
        })
      },
      imgProps: {},
      title: 'Selection box',
      'data-active': enableSelection,
    },
    goToSelectedNode: {
      src: targetIcon,
      onClick: scrollToSelectedNode,
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
      title: `Text editing (${contentEditable ? 'enabled' : 'disabled'} )`,
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
      imgProps: { style: { transform: 'scaleX(-1)', height: '22px' } },
      'data-active': ctxTools.brush.active,
    },
    paintBucket: {
      src: paintBucketIcon,
      imgProps: { style: { transform: 'scaleX(-1)', height: '22px' } },
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
    <DesignerTools>
      <img alt="aid-logo" src={AidLogoSmall} />
      <Each fallback={null} of={values(tools)} render={renderTool} />
    </DesignerTools>
  )
}

export default Toolbar
