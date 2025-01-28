/* stylelint-disable string-quotes */
/* stylelint-disable declaration-no-important */
/* stylelint-disable no-descending-specificity */
import React, { useContext, useEffect, useRef, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { WaxContext, ComponentPlugin, WaxView } from 'wax-prosemirror-core'
import { grid, th } from '@coko/client'
import { DeleteOutlined, EllipsisOutlined } from '@ant-design/icons'
import ChatHistory from '../../component-ai-assistant/ChatHistory'
import YjsContext from '../../../yjsProvider'
import theme from '../../../theme'
import commonStyles from './cokoDocsWaxStyles'
import MenuComponent from './MenuComponent'
import MainMenu from '../../dashboard/MainMenu/MainMenu'
import 'wax-table-service/dist/index.css'
import 'wax-prosemirror-core/dist/index.css'
import 'wax-prosemirror-services/dist/index.css'
import PromptBox from '../../component-ai-assistant/components/PromptBox'
import {
  AiDesignerContext,
  useAiDesignerContext,
} from '../../component-ai-assistant/hooks/AiDesignerContext'
import useAssistant from '../../component-ai-assistant/hooks/useAiDesigner'
import AiDesigner from '../../../AiDesigner/AiDesigner'
import { PagedJsPreview } from '../../component-ai-assistant/components/PagedJsPreview'
import { setInlineStyle } from '../../component-ai-assistant/utils'
import { StyledWindow, WindowHeading } from '../../_styleds/common'

const Wrapper = styled.div`
  --pm-editor-width: 90%;
  --menu-height: ${p => (p.$menuvisible ? '47px' : '0px')};
  background: var(--color-trois-lightest-2);
  display: flex;
  flex-direction: column;
  font-family: '${th('fontInterface')}';
  font-size: ${th('fontSizeBase')};
  height: 100dvh;
  line-height: ${grid(4)};
  min-width: 100%;
  overflow: hidden;
  width: 100%;

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
    color: #525e76;
    display: flex;
    height: fit-content;
    margin: 0;
  }

  div > div > div {
    position: absolute;
    right: 15px;

    > div {
      height: fit-content;
      min-height: 240px;
      min-width: 300px;
      white-space: nowrap;
      width: fit-content;
    }
  }
`

const EditorContainer = styled.div`
  max-width: 85%;
  padding-block: 72px;
  position: relative;
  width: 1200px;

  .ProseMirror {
    box-shadow: 0 0 8px #ecedf1;
    height: fit-content;
    max-width: 100%;
    min-height: 150dvh;
    padding: 10% !important;
    transform-origin: top center;
    transition: transform 0.2s;
    width: 1200px;
  }

  > div > :first-child {
    display: flex;
    justify-content: center;
  }
  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${commonStyles}
`

const MenuWrapper = styled.div`
  background-color: #fff0;
  display: flex;
  flex-flow: row nowrap;
  font-size: 16px;
  height: fit-content;
  justify-content: center;
  max-height: var(--menu-height);
  /* opacity: ${p => (p.$show ? '1' : '0')}; */
  pointer-events: ${p => (p.$show ? 'all' : 'none')};
  transition: all 0.3s linear;

  div:last-child {
    margin-left: auto;
  }
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
  display: flex;
  flex-direction: column;
  height: fit-content;
  max-width: ${p => (p.$show ? '20%' : '0')};
  opacity: ${p => (p.$show ? '1' : '0')};
  overflow-x: hidden;
  right: 0;
  top: 0;
  transition: all 0.3s;
  width: fit-content;

  div[data-box] {
    width: fit-content;

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
  justify-content: center;
  margin: 0;
  overflow: scroll;
  position: relative;
  scroll-behavior: smooth;
  width: 100%;
`

const WaxEditorWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: calc(100dvh - (var(--header-height) + var(--menu-height)));

  justify-content: space-between;
  min-width: 100%;
  padding-inline-start: 10px;
  transition: all 0.3s;
`

const FileManagerWrapper = styled.div`
  display: flex;
  width: fit-content;
`

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
    updatePreview,
    htmlSrc,
    updateLayout,
    css,
    editorContent,
    settings,
    designerOn,
    previewRef,
  } = useAiDesignerContext()

  const { loading } = useAssistant()
  const { enableLogin } = props
  const ref = useRef(null)
  const [open, toggleMenu] = useState(false)

  useEffect(() => {
    !!layout.preview && settings.preview.livePreview && updatePreview()
  }, [htmlSrc, css, editorContent])

  useEffect(() => {
    !!layout.preview && updatePreview()
    !layout.preview && !layout.editor && updateLayout({ editor: true })
  }, [layout.preview])

  useEffect(() => {
    if (!layout.editor) {
      !layout.preview && updateLayout({ preview: true })
    }
  }, [layout.editor])

  useEffect(() => {
    const pages = previewRef?.current?.contentDocument?.documentElement
    pages &&
      setInlineStyle(pages, {
        transition: `transform 0.2s`,
        transformOrigin: 'top left',
        transform: `scale(${
          designerOn && layout.chat && layout.editor ? '0.8' : '1'
        }) translateX(${
          designerOn && layout.chat && layout.editor ? '4%' : '0'
        })`,
      })
  }, [layout.chat, layout.editor, updatePreview])

  useEffect(() => {
    if (main?.docView) {
      AiDesigner.setStates(prev => ({
        ...prev,
        get view() {
          return context.activeView
        },
      }))
      main.state && AiDesigner.select('aid-ctx-main')
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
        style={fullScreenStyles}
        $menuvisible={!!layout.editor}
      >
        <MenuWrapper $show={layout.editor}>
          {main && (
            <MenuComponent
              fullScreen={fullScreen}
              open={layout.editor}
              ref={ref}
            />
          )}
          <ShowMore onClick={showMore} />
        </MenuWrapper>

        <WaxEditorWrapper>
          <FileManagerWrapper>
            <MainMenu enableLogin={enableLogin} />
          </FileManagerWrapper>
          <StyledWindow $show={layout.editor}>
            <WaxSurfaceScroll
              id="wax-surface-scroll"
              $loading={!!loading}
              ref={editorContainerRef}
            >
              <EditorContainer
                $both={!!layout.preview && !!layout.editor}
                $all={!!layout.preview && !!layout.editor && !!layout.userMenu}
              >
                <WaxView {...props} />
              </EditorContainer>
              {!layout.userMenu && !layout.preview && layout.editor && (
                <CommentsContainer $show>
                  <RightArea area="main" users={users} />
                </CommentsContainer>
              )}
            </WaxSurfaceScroll>
            <WaxBottomRightInfo>
              <InfoContainer id="info-container">
                <BottomRightInfo />
              </InfoContainer>
            </WaxBottomRightInfo>
          </StyledWindow>
          <PagedJsPreview $show={designerOn} loading={loading} />
        </WaxEditorWrapper>
      </Wrapper>
    </ThemeProvider>
  )
}

export default Layout
