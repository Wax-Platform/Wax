/* stylelint-disable no-descending-specificity */
/* stylelint-disable declaration-no-important */
/* stylelint-disable string-quotes */
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
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

import DocTreeManager from '../../dashboard/DocTreeManager/DocTreeManager'

import 'wax-table-service/dist/index.css'
import 'wax-prosemirror-core/dist/index.css'
import 'wax-prosemirror-services/dist/index.css'
import PromptBox from '../../component-ai-assistant/components/PromptBox'
import { AiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
import useAssistant from '../../component-ai-assistant/hooks/useAiDesigner'
import AiDesigner from '../../../AiDesigner/AiDesigner'
import { debounce } from 'lodash'
import { PagedJsPreview } from '../../component-ai-assistant/components/PagedJsPreview'
import { setInlineStyle } from '../../component-ai-assistant/utils'
import { StyledWindow, WindowHeading } from '../../_styleds/common'

const Wrapper = styled.div`
  --pm-editor-width: 90%;
  --menu-height: ${p => (p.$menuvisible ? '50px' : '0px')};
  background: ${th('colorBackground')};
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
    padding-bottom: 6px;
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
  padding-block: 45px;
  position: relative;
  width: 1200px;

  .ProseMirror {
    box-shadow: 0 0 8px #ecedf1;
    height: fit-content;
    max-width: 1000px;
    min-height: 150dvh;
    padding: 10% !important;
    transform: scale(${p => (p.$all ? '0.65' : p.$both ? '0.8' : '1')});
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
  background-color: white;
  border-bottom: ${p => (p.$show ? '1px' : '0px')} solid gainsboro;
  display: flex;
  flex-flow: row nowrap;
  font-size: 16px;
  height: var(--menu-height);
  max-height: var(--menu-height);
  padding: ${p => (p.$show ? '5px 20px' : '0')};
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
  margin-right: 15px;
  position: absolute;
  top: 0;
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
  height: calc(100dvh - (var(--header-height) + var(--menu-height)));
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
    clearHistory,
    updatePreview,
    htmlSrc,
    updateLayout,
    css,
    editorContent,
    settings,
    designerOn,
    previewRef,
  } = useContext(AiDesignerContext)
  const { loading } = useAssistant()
  const {
    deleteResource,
    renameResource,
    addResource,
    reorderResource,
    getDocTreeData,
    showFilemanager,
  } = props
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
        <PromptBox />
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
            <DocTreeManager
              deleteResource={deleteResource}
              renameResource={renameResource}
              addResource={addResource}
              reorderResource={reorderResource}
              getDocTreeData={getDocTreeData}
            />
          </FileManagerWrapper>
          <StyledWindow $show={layout.editor}>
            <WaxSurfaceScroll
              id="wax-surface-scroll"
              $loading={loading}
              ref={editorContainerRef}
            >
              <EditorContainer
                $both={!!layout.preview && !!layout.editor}
                $all={!!layout.preview && !!layout.editor && !!layout.chat}
              >
                <WaxView {...props} />
              </EditorContainer>
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

          <PagedJsPreview $show={designerOn} loading={loading} />
          <StyledWindow
            $show={designerOn && layout.chat}
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
        </WaxEditorWrapper>
      </Wrapper>
    </ThemeProvider>
  )
}

export default Layout
