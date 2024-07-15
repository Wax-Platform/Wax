/* stylelint-disable declaration-no-important */
/* stylelint-disable string-quotes */
import React, { useContext, useEffect, useRef, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { WaxContext, ComponentPlugin, WaxView } from 'wax-prosemirror-core'
import { grid, th, override } from '@coko/client'
import { DeleteOutlined, EllipsisOutlined } from '@ant-design/icons'
import SelectionBox from '../../component-ai-assistant/SelectionBox'
import ChatHistory from '../../component-ai-assistant/ChatHistory'
import YjsContext from '../../../yjsProvider'
import theme from '../../../theme'
import commonStyles from './cokoDocsWaxStyles'
import MenuComponent from './MenuComponent'
import Toolbar from '../../component-ai-assistant/components/Toolbar'

import DocTreeManager from '../../dashboard/DocTreeManager/DocTreeManager'

import 'wax-table-service/dist/index.css'
import 'wax-prosemirror-core/dist/index.css'
import 'wax-prosemirror-services/dist/index.css'
import PromptBox from '../../component-ai-assistant/components/PromptBox'
import { AiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
import useAssistant from '../../component-ai-assistant/hooks/useAiDesigner'
import AiDesigner from '../../component-ai-assistant/utils/AiDesigner'
import { debounce } from 'lodash'

const Wrapper = styled.div`
  --pm-editor-width: 90%;
  background: ${th('colorBackground')};
  display: flex;
  flex-direction: column;
  font-family: '${th('fontInterface')}';
  font-size: ${th('fontSizeBase')};
  height: 100%;
  line-height: ${grid(4)};
  width: 100%;
  min-width: 100%;

  * {
    box-sizing: border-box;
  }
`

const WaxBottomRightInfo = styled.div`
  bottom: 0;
  position: absolute;
  right: 40px;
`

const InfoContainer = styled.div`
  bottom: 1px;
  display: flex;
  right: 21px;
  z-index: 999;

  span {
    font-size: 14px;
  }

  div div div div {
    display: flex;
    color: #525e76;
    height: fit-content;
    margin: 0;
    padding-bottom: 6px;
  }

  div > div > div {
    position: absolute;
    right: 15px;

    > div {
      height: fit-content;
      width: fit-content;
      min-height: 240px;
      min-width: 300px;
      white-space: nowrap;
    }
  }
`

const EditorContainer = styled.div`
  height: 100%;
  padding-block: 45px;
  position: relative;

  .ProseMirror {
    box-shadow: 0 0 8px #ecedf1;
    height: fit-content;
    max-width: 1200px;
    min-height: 100%;
    min-width: 650px;
    padding: 10% !important;
    width: unset;
  }

  > div > :first-child {
    display: flex;
    justify-content: center;
  }
  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${commonStyles}
`

const MenuWrapper = styled.div`
  background-color: white;
  border-bottom: 1px solid gainsboro;
  border-top: 1px solid gainsboro;
  display: flex;
  flex-flow: row nowrap;
  font-size: 16px;

  div:last-child {
    margin-left: auto;
  }
`
const StyledWindow = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  transition: width 0.5s ease;
  width: ${p => (p.$show ? '100%' : '0')};
`

const WindowHeading = styled.div`
  align-items: center;
  background-color: #efefef;
  box-shadow: inset 0 0 5px #fff4, 0 0 2px #0009;
  color: #777;
  display: flex;
  font-size: 12px;
  font-weight: bold;
  justify-content: space-between;
  line-height: 1;
  min-height: 23px;
  padding: 2px 10px;
  white-space: nowrap;
  z-index: 99;

  svg {
    fill: #00495c;
    stroke: #00495c;
  }

  > :first-child {
    color: #aaa;
  }
`
const PreviewIframe = styled.iframe`
  border: none;
  display: flex;
  height: calc(100% - 10px);

  width: 100%;
`
const ShowMore = styled(EllipsisOutlined)`
  display: none;
  font-size: 40px;
  margin-left: auto;
  right: 10px;

  @media screen and (max-width: 1050px) {
    display: flex;
    position: relative;
    right: 10px;
    top: 0;
  }
`

const CommentsContainer = styled.div`
  bottom: 0;
  display: flex;
  flex-direction: column;
  height: fit-content;
  position: absolute;
  right: 0;
  width: fit-content;

  div[data-box] {
    width: 30vw;

    button {
      font-size: 14px;
    }

    span {
      font-size: 11px;
    }
  }
`

const WaxSurfaceScroll = styled.div`
  box-sizing: border-box;
  display: flex;
  height: 100%;
  justify-content: center;
  margin: 0;
  overflow: scroll;
  position: relative;
  width: 100%;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  /* ${override('Wax.WaxSurfaceScroll')} */
`

const WaxEditorWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 95%;
  min-width: 100%;
`

const FileManagerWrapper = styled.div`
  display: flex;
  width: fit-content;
`

const MyComp = ({ name }) => {
  // console.log(name)
  return (
    <div>
      <span>{name}</span>
      <button
        onClick={() => {
          // console.log('ffff')
        }}
      >
        {' '}
        change config
      </button>
    </div>
  )
}

const BottomRightInfo = ComponentPlugin('BottomRightInfo')
const RightArea = ComponentPlugin('rightArea')

/* eslint-disable-next-line react/prop-types */
const Layout = props => {
  const context = useContext(WaxContext)
  const {
    options,
    pmViews: { main },
  } = context
  const { sharedUsers, yjsCurrentUser } = useContext(YjsContext)
  const {
    editorContainerRef,
    layout,
    clearHistory,
    updatePreview,
    previewRef,
    previewSource,
    setEditorContent,
    htmlSrc,
    updateLayout,
    css,
    editorContent,
    settings,
    setWaxContext,
  } = useContext(AiDesignerContext)
  const { loading, handleScroll } = useAssistant()

  const ref = useRef(null)
  const [open, toggleMenu] = useState(false)
  const [menuHeight, setMenuHeight] = useState(42)

  useEffect(() => {
    if (ref.current) {
      setMenuHeight(ref.current.clientHeight + 2)
    }
  }, [open])

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        setMenuHeight(ref.current.clientHeight + 2)
      }
    }

    window.addEventListener('resize', handleResize)
  })

  useEffect(() => {
    layout.preview && settings.preview.livePreview && updatePreview()
  }, [htmlSrc, css, editorContent])

  useEffect(() => {
    layout.preview && updatePreview()
    !layout.preview && !layout.editor && updateLayout({ editor: true })
  }, [layout.preview])

  useEffect(() => {
    if (!layout.editor) {
      !layout.preview && updateLayout({ preview: true })
    }
    updatePreview()
  }, [layout.editor])

  useEffect(() => {
    if (main?.docView) {
      console.log(context)
      setWaxContext(main)
      AiDesigner.setStates(prev => ({
        ...prev,
        get view() {
          return context.activeView
        },
      }))
      main.state && AiDesigner.updateContext()
    }
  }, [context.activeView])

  const showMore = () => {
    toggleMenu(!open)
  }

  const users = sharedUsers.map(([id, { user }]) => ({
    userId: user.id,
    displayName: user.displayName,
    currentUser: user.id === yjsCurrentUser.id,
  }))

  const { fullScreen } = options

  let fullScreenStyles = {}

  if (fullScreen) {
    fullScreenStyles = {
      backgroundColor: '#fff',
      left: '0',
      margin: '0',
      padding: '0',
      position: 'fixed',
      top: '0',
      width: '100%',
      zIndex: '1',
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Wrapper
        id="wax-container"
        menuHeight={menuHeight}
        style={fullScreenStyles}
        onClick={({ target }) => {
          // if (
          //   htmlSrc.contains(target) ||
          //   target?.dataset?.element === 'element-options'
          // )
          //   return
          // setSelectedCtx(getCtxBy('node', htmlSrc))
          // setSelectedNode(htmlSrc)
        }}
      >
        <PromptBox></PromptBox>
        <MenuWrapper>
          {main && (
            <MenuComponent fullScreen={fullScreen} open={open} ref={ref} />
          )}
          <ShowMore onClick={showMore} />
        </MenuWrapper>
        <WaxEditorWrapper>
          {props.showFilemanager && (
            <FileManagerWrapper>
              <DocTreeManager
                deleteResource={props.deleteResource}
                renameResource={props.renameResource}
                addResource={props.addResource}
                reorderResource={props.reorderResource}
                getDocTreeData={props.getDocTreeData}
              />
            </FileManagerWrapper>
          )}
          <StyledWindow $show={layout.editor}>
            <WaxSurfaceScroll
              $loading={loading}
              onScroll={handleScroll}
              ref={editorContainerRef}
            >
              <EditorContainer>
                <WaxView {...props} />
              </EditorContainer>
              <SelectionBox></SelectionBox>
              <CommentsContainer>
                <RightArea area="main" users={users} />
              </CommentsContainer>
            </WaxSurfaceScroll>
            <WaxBottomRightInfo>
              <InfoContainer id="info-container">
                <BottomRightInfo />
              </InfoContainer>
            </WaxBottomRightInfo>
          </StyledWindow>
          <StyledWindow $show={layout.preview}>
            {/* <WindowHeading>
              <span>PDF PREVIEW</span>
            </WindowHeading> */}
            <PreviewIframe
              onLoad={updatePreview}
              ref={previewRef}
              srcDoc={previewSource}
              title="Article preview"
            />
          </StyledWindow>
          <StyledWindow
            $show={layout.chat}
            style={{ maxWidth: '25%', background: '#f5f5f5' }}
          >
            <WindowHeading>
              <span>CHAT HISTORY</span>
              <DeleteOutlined
                onClick={clearHistory}
                title="Clear history (not undoable)"
              />
            </WindowHeading>
            <ChatHistory />
          </StyledWindow>
          <Toolbar />
        </WaxEditorWrapper>
      </Wrapper>
    </ThemeProvider>
  )
}

export default Layout
