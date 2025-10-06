/* eslint-disable no-await-in-loop */
/* stylelint-disable selector-type-no-unknown */
/* stylelint-disable declaration-no-important */
/* stylelint-disable no-descending-specificity, string-quotes */
import React, { useContext, useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled, { ThemeProvider, css } from 'styled-components'
import { grid, th } from '@coko/client'
import PanelGroup from 'react-panelgroup'

import {
  ToTopOutlined,
  CaretUpFilled,
  CaretDownFilled,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons'
import {
  ApplicationContext,
  WaxContext,
  ComponentPlugin,
  WaxView,
  DocumentHelpers,
} from 'wax-prosemirror-core'
import { useTranslation } from 'react-i18next'
import { usePrevious } from '../../../utils'
import ChatThreadComponent from '../../chat/ChatThread'
import { Button, Checkbox, Result, Spin } from '../../common'
import Select from '../../common/Select'
// import BookPanel from '../../bookPanel/BookPanel'

import { DocTreeManager } from '../../DocTreeManager'

import {
  BookInformation,
  BookSettings,
  SettingsForm,
  UserInviteModal,
} from '../../bookInformation'
import theme from '../../../theme'

import YjsContext from '../../provider-yjs/YjsProvider'
import FileUpload from '../../fileUpload/FileUpload'

import 'wax-prosemirror-core/dist/index.css'
import 'wax-prosemirror-services/dist/index.css'
import 'wax-table-service/dist/index.css'

const SpinnerWrapper = styled.div`
  display: ${props => (props.showSpinner ? 'block' : 'none')};
  left: 42%;
  margin-top: -25px;
  position: absolute;
  top: 50%;
  z-index: 999;
`

// #region styled
const Wrapper = styled.div`
  --top-menu-base: clamp(3rem, 4.3478rem + -1.7391vw, 4rem);
  background: ${th('colorBackground')};
  display: flex;
  flex-direction: column;
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBase')};
  height: 100%;
  overflow: hidden;
  width: 100%;
`

const Main = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 calc(100% - var(--top-menu-base));
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: calc(100% - 400px);

  > :nth-child(2) {
    overflow: auto;
    width: 100%;
  }
`

const TopMenu = styled.div`
  align-items: center;
  background-color: ${th('colorBackground')};
  border-bottom: 1px solid lightgrey;
  display: flex;
  flex: 1 0 var(--top-menu-base);
  flex-flow: nowrap;
  gap: ${grid(1)};
  justify-content: center;

  ${({ isHidden }) =>
    isHidden &&
    css`
      > * {
        opacity: 0;
        visibility: hidden;
      }
    `};

  padding: ${grid(2)} ${grid(4)};
  user-select: none;

  &.scrollable {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    row-gap: ${grid(2)};

    > div:has(#questions-list) {
      grid-column: span 2;

      [aria-controls='questions-list'] {
        width: 150px;
      }

      #questions-list {
        margin-left: 40px;
        width: 211px;
      }
    }
  }

  &.scrollable[data-expanded='false'] {
    flex: unset;
    height: 48px;
    overflow: hidden;
  }

  > div {
    display: contents;
    justify-content: center;

    &:has(button[title='Undo']) {
      display: inline-flex;
    }

    > div {
      text-align: center;
    }

    &:has(#block-level-options),
    &:has(#questions-list) {
      display: flex;
    }
  }

  [aria-controls='block-level-options'] {
    background-color: transparent;
    width: 90px;
  }

  [aria-controls='questions-list'] {
    padding-inline: 1ch;

    span,
    svg {
      top: 0;
    }
  }

  #block-level-options {
    width: 100px;
    z-index: 1001;
  }

  #questions-list {
    margin: 32px auto auto;
    z-index: 1001;
  }

  > div > div:has(#custom-block-level-options) button[aria-haspopup='true'] {
    width: 120px;
  }

  .Dropdown-root {
    display: contents;
  }

  .Dropdown-control {
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: 8px;
    white-space: nowrap;
    width: 120px;

    .Dropdown-arrow {
      position: unset;
    }
  }

  .Dropdown-menu {
    top: unset;
    width: 120px;
    z-index: 1001;
  }

  [aria-controls='table-options'] {
    width: 120px;
  }

  #table-options {
    span {
      text-align: start;
    }
  }

  &[data-loading='true'] [aria-controls='block-level-options'] {
    > span {
      opacity: 0;
    }
  }

  #collapse {
    align-items: center;
    border: none;
    box-shadow: none;
    display: none;
    flex-direction: row-reverse;
    justify-content: center;

    > .ant-btn-icon {
      margin-inline: ${grid(2)} 0;
    }
  }

  &.scrollable #collapse {
    display: flex;
  }
`

const CollapseContainer = styled.div`
  background-color: transparent;
  display: flex;
  inset-inline-end: ${grid(3)};
  justify-content: center;
  padding-block-start: 9px;
  position: absolute;
  z-index: 9;

  &[data-collapsed='true'] {
    align-items: start;
    background-color: white;
    height: unset;
    inset: 0;

    button {
      transform: rotate(90deg);
    }
  }

  button {
    block-size: 34px;
    inline-size: 34px;
    transform: rotate(-90deg);
    transition: transform 0.3s ease-out;
  }

  @media (min-width: 800px) {
    display: none;
  }
`

const EditorArea = styled.div`
  background: #e8e8e8;
  border-bottom: 1px solid lightgrey;
  flex-grow: 1;
  height: 100%;
  padding: 4px 0 0;
  width: ${({ isFullscreen }) => (isFullscreen ? '100%' : '80%')};
`

const WaxSurfaceScroll = styled.div`
  box-sizing: border-box;
  display: flex;
  height: 100%;
  overflow-y: auto;
  position: relative;
  width: 100%;
`

const CitationContainer = styled.div`
  background: white;
  border-left: 1px solid lightgrey;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  max-width: 400px;
  position: fixed;
  right: 0;
  top: 100px;
  width: 400px;
  z-index: 1;

  @media (max-width: 1400px) {
    position: absolute;
    right: ${grid(1)};
  }

  > div {
    margin-inline-start: 1em;
  }

  textarea {
    border: 1px solid ${th('colorBorder')};
  }

  button {
    border-radius: 3px;
  }

  &:empty {
    display: none;
  }
`

const CommentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;

  @media (max-width: 1400px) {
    position: absolute;
    right: ${grid(1)};
  }

  > div {
    margin-inline-start: 1em;
  }

  textarea {
    border: 1px solid ${th('colorBorder')};
  }

  button {
    border-radius: 3px;
  }

  &:empty {
    display: none;
  }
`

const NotesAreaContainer = styled.div`
  background: #fff;
  display: flex;
  flex-direction: row;
  height: 100%;
  justify-content: center;
  overflow-y: scroll;
  position: absolute;
  width: 100%;
  /* PM styles  for note content */
  .ProseMirror {
    display: inline;
  }
`

const NotesInnerContainer = styled.div`
  background: white;
  display: flex;
  height: 100%;
  left: -10px;
  position: relative;
  width: 796px;
`

const NotesContainer = styled.div`
  counter-reset: footnote-view;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: auto;
  max-width: 760px;
  padding-bottom: ${grid(4)};
  padding-top: 10px;
  width: 100%;
`

const CommentsContainerNotes = styled.div`
  // display: flex;
  // flex-direction: column;
  // height: 100%;
  // width: 35%;
`

const TrackToolsContainer = styled.div`
  border: 1px solid ${th('colorBorder')};
  display: grid;
  grid-auto-rows: 30px;
  grid-template-columns: 1fr;
  margin-inline-start: 0;
  position: fixed;
  right: clamp(0rem, -0.2174rem + 1.087vw, 0.625rem);
  z-index: 1;
`

const ToggleComments = styled.div`
  align-items: center;
  background-color: ${th('colorBackground')};
  border-bottom: 1px solid ${th('colorBorder')};
  display: inline-flex;
  padding-inline: ${grid(2)};

  > label {
    flex-direction: row-reverse;

    .ant-checkbox {
      margin-inline: 6px;
    }
  }

  @media (min-width: 1400px) {
    display: none;
  }
`

const TrackTools = styled.div`
  align-items: center;
  background-color: ${th('colorBackground')};
  display: flex;
  justify-content: end;
  padding-inline: ${grid(2)};
  position: relative;
  z-index: 1;
`

const TrackOptions = styled.div`
  display: flex;
  margin-left: 10px;
  position: relative;

  > div > button ~ div {
    right: ${grid(-2)};
  }
`

const EditorContainer = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  margin: 0 auto;
  position: relative;
  width: 800px;

  > div:first-child {
    width: 100%;
  }

  .ProseMirror {
    --padding-inline: clamp(1.25rem, -0.4022rem + 8.2609vw, 6rem);
    background: ${({ selectedChapterId }) =>
      selectedChapterId ? '#fff' : '#e8e8e8'};
    min-height: calc(100vh - 104px);
    padding: ${grid(20)} var(--padding-inline) ${grid(20)}
      calc(50px + var(--padding-inline));
    width: calc(100% - 20px);

    footnote {
      background-color: black;
      border: 2px solid black;
      color: white;
      position: relative;
      top: 4px;

      &::after {
        bottom: 5px;
      }
    }

    .small-caps {
      font-variant-caps: small-caps;
    }

    @media (min-width: 600px) {
      padding: ${grid(20)} var(--padding-inline);
    }

    table > caption {
      caption-side: top;
    }

    .ProseMirror {
      min-height: unset;
      padding: unset;
    }

    .multiple-choice,
    .true-false,
    .true-false-single-correct,
    .multiple-choice-single-correct,
    .essay {
      border: 2px solid rgb(245 245 247);
    }

    .essay {
      > div:first-child {
        min-block-size: 10em;

        .ProseMirror {
          padding: 1ch;
        }
      }

      > div:nth-child(2) {
        min-block-size: 10em;
        padding: 1ch;
      }
    }

    [aria-controls='numerical-answer-list'] {
      min-inline-size: 235px;
      width: unset;
    }
  }
`

const LeftPanelWrapper = styled.div`
  background-color: #e8e8e8;
  display: flex;
  flex-direction: column;
  height: 100%;
  left: 0;
  padding-inline: ${grid(3)} ${grid(3)} ${grid(3)} 0;
  position: absolute;
  top: 0;
  transition: flex-basis 0.4s, width 0.4s;
  z-index: 1000; // hate it but it's the wax cursor's fault!
`

const StyledSettingsForm = styled(SettingsForm)`
  padding-inline-start: calc(50px + var(--s1));

  @media (min-width: 600px) {
    padding-inline-start: var(--s1);
  }
`

const NoSelectedChapterWrapper = styled.div`
  display: grid;
  font-size: 16px;
  height: 80%;
  place-content: center;
`

const ChatThread = styled.div`
  background: ${({ isCollapsed }) => (isCollapsed ? 'transparent' : 'white')};
  border-left: ${({ isCollapsed }) =>
    isCollapsed ? 'none' : '1px solid lightgrey'};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  max-width: 400px;
  position: fixed;
  right: ${({ isCollapsed }) => (isCollapsed ? '-400px' : '0')};
  top: 100px;
  transition: right 0.3s ease-in-out background 0.3s ease-in-out,
    border-left 0.3s ease-in-out;
  width: 400px;
  z-index: 2;
`

const ChatToggleButton = styled.button`
  align-items: center;
  background: white;
  border: 1px solid lightgrey;
  border-radius: 4px 0 0 4px;
  border-right: none;
  cursor: pointer;
  display: flex;
  height: 40px;
  justify-content: center;
  position: fixed;
  right: ${({ isCollapsed }) => (isCollapsed ? '0' : '400px')};
  top: 100px;
  transition: right 0.3s ease-in-out;
  width: 40px;
  z-index: 10;

  svg {
    transform: ${({ isCollapsed }) =>
      isCollapsed ? 'rotate(90deg)' : 'rotate(-90deg)'};
    transition: transform 0.3s ease-in-out;
  }

  &:hover {
    background: #f5f5f5;
  }
`

const ToggleTypeWrapper = styled.div`
  display: flex !important;
  width: 150px;
`

const GenerationLoaderWrapper = styled.div`
  display: ${props => (props.showLoader ? 'block' : 'none')};
  left: 42%;
  margin-top: -25px;
  position: absolute;
  top: 50%;
  z-index: 999;
`
// #endregion styled

const MainMenuToolBar = ComponentPlugin('mainMenuToolBar')
const RightArea = ComponentPlugin('rightArea')
const CitationRightArea = ComponentPlugin('citationRightArea')
const CommentTrackToolBar = ComponentPlugin('commentTrackToolBar')
const NotesArea = ComponentPlugin('notesArea')

let surfaceHeight = (window.innerHeight / 5) * 4
let notesHeight = (window.innerHeight / 5) * 1

const onResizeEnd = arr => {
  surfaceHeight = arr[0].size
  notesHeight = arr[1].size
}

const getNotes = main => {
  const notes = DocumentHelpers.findChildrenByType(
    main.state.doc,
    main.state.schema.nodes.footnote,
    true,
  )

  return notes
}

const LuluLayout = ({ customProps, ...rest }) => {
  const {
    onChapterClick,
    onUploadChapter, // WE KEEP FOR DOC UPLOAD
    selectedChapterId,
    viewMetadata,
    setViewMetadata,
    settings,
    getBookSettings,
    bookId,
    bodyDivisionId,
    aiEnabled,
    savedComments,
    deleteResource,
    renameResource,
    addResource,
    reorderResource,
    getDocTreeData,
    setSelectedChapterId,
    setIsCurrentDocumentMine,
    setUploading,
    isUploading,
    deleteFromFileManager,
    getUserFileManager,
    loaded,
    setUserFileManagerFiles,
    handleCloseFileUpload,
    updateFileInManager,
    uploadToFileManager,
    userFileManagerFiles,
    updateFile,
    onSendChatMessage,
    chatMessages,
    currentBookComponentUsers,
    getEditorContent,
    currentBookComponentTitle,
  } = customProps

  const params = useParams()
  const { bookComponentId } = params

  const [lastSelectedChapter, setLastSelectedChapter] = useState(null)
  const [bookPanelCollapsed, setBookPanelCollapsed] = useState(true)
  const [mobileToolbarCollapsed, setMobileToolbarCollapsed] = useState(true)
  const [showComments, setShowComments] = useState(true)
  const [selectedFormat, setSelectedFormat] = useState(undefined)
  const [selectedFormatLabel, setSelectedFormatLabel] = useState(undefined)
  const [isGenerating, setIsGenerating] = useState(false)
  const previousComments = usePrevious(savedComments)
  const { showSpinner } = useContext(YjsContext)
  const { t } = useTranslation(null, { keyPrefix: 'pages.producer' })

  const context = useContext(WaxContext)

  const {
    options,
    pmViews: { main },
  } = context

  const { app } = useContext(ApplicationContext)
  const waxMenuConfig = app.config.get('config.MenuService')
  let fullScreenStyles = {}

  const menuContainsTrackTools = !!waxMenuConfig[0].toolGroups.find(
    menu => menu === 'TrackingAndEditing',
  )

  if (options.fullScreen) {
    fullScreenStyles = {
      backgroundColor: '#fff',
      height: '100%',
      left: '0',
      margin: '0',
      padding: '0',
      position: 'fixed',
      top: '0',
      width: '100%',
      zIndex: '99999',
    }
  }

  const commentsTracksCount =
    main && DocumentHelpers.getCommentsTracksCount(main)

  const trackBlockNodesCount =
    main && DocumentHelpers.getTrackBlockNodesCount(main)

  const showTrackControls =
    menuContainsTrackTools || commentsTracksCount + trackBlockNodesCount > 0

  const notes = main && getNotes(main)
  const areNotes = notes && !!notes.length && notes.length > 0

  const [hasNotes, setHasNotes] = useState(areNotes)
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)

  const showNotes = () => {
    setHasNotes(areNotes)
  }

  const extractUsers = teams => {
    const users = []

    teams.forEach(team => {
      if (Array.isArray(team.members)) {
        team.members.forEach(member => {
          if (member.user) {
            users.push({
              id: member.user.id,
              display: member.user.displayName,
            })
          }
        })
      }
    })

    return users
  }

  useCallback(
    setTimeout(() => showNotes(), 100),
    [],
  )

  useEffect(() => {
    // Re-check on window resize
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [])

  useEffect(() => {
    // make comments visible when adding a new comment and they are hidden
    if (previousComments?.length < savedComments?.length) {
      setShowComments(true)
    }
  }, [savedComments])

  const toggleMetadata = which => {
    if (viewMetadata !== which) {
      setViewMetadata(which)

      if (selectedChapterId) {
        onChapterClick(selectedChapterId)
        setLastSelectedChapter(selectedChapterId)
      }
    } else {
      if (lastSelectedChapter) {
        setLastSelectedChapter(selectedChapterId)
        onChapterClick(lastSelectedChapter)
      }

      setViewMetadata('')
    }

    if (window.innerWidth < 600) {
      setBookPanelCollapsed(true)
    }
  }

  const checkOverflow = () => {
    const toolbar = document.getElementById('toolbar')
    toolbar?.classList.remove('scrollable')

    // Check if the content overflows the container
    if (toolbar?.scrollWidth > toolbar?.clientWidth) {
      toolbar?.classList.add('scrollable') // Add class to align items to the start
    } else {
      toolbar?.classList.remove('scrollable') // Remove class to center items
    }

    if (window.innerWidth > 1400) {
      if (
        document.getElementById('commentToggle')?.classList.contains('hidden')
      ) {
        setShowComments(true)
        document.getElementById('commentToggle')?.classList.remove('hidden')
      }
    } else {
      document.getElementById('commentToggle')?.classList.add('hidden')
    }
  }

  const renderInformationBox = () => {
    switch (viewMetadata) {
      case 'settings':
        return (
          <StyledSettingsForm
            aiEnabled={aiEnabled}
            bookId={bookId}
            bookSettings={settings}
            refetchBookSettings={getBookSettings}
            toggleInformation={toggleMetadata}
            toggleName="settings"
          />
        )

      case 'members':
        return (
          <UserInviteModal
            bookComponentId={bookComponentId}
            toggleInformation={toggleMetadata}
            toggleName="members"
          />
        )

      default:
        return null
    }
  }

  const getFile = async outputType => {
    setIsGenerating(true)
    const editorContent = getEditorContent()

    fetch(`https://wax-staging-pandoc.fly.dev/convert`, {
      // fetch(`http://localhost:4040/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileContent: editorContent,
        fileName: currentBookComponentTitle,
        outputType,
        extension: 'html',
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          // Convert base64 to blob and download
          const byteCharacters = atob(data.fileContent)
          const byteNumbers = new Array(byteCharacters.length)

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }

          const byteArray = new Uint8Array(byteNumbers)

          const blob = new Blob([byteArray], {
            type: data.contentType,
          })

          // Create download link
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = data.fileName
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          setSelectedFormat(undefined)
          setSelectedFormatLabel(undefined)
        } else {
          console.error('Conversion failed:', data.message)
        }

        setIsGenerating(false)
      })
      .catch(error => {
        console.error('Error during conversion:', error)
        setIsGenerating(false)
      })
  }

  return (
    <ThemeProvider theme={theme}>
      {viewMetadata !== '' ? (
        renderInformationBox()
      ) : (
        <Wrapper id="wax-container" style={fullScreenStyles}>
          <TopMenu
            data-expanded={!mobileToolbarCollapsed}
            id="toolbar"
            isHidden={viewMetadata}
          >
            <Button
              icon={
                mobileToolbarCollapsed ? <CaretDownFilled /> : <CaretUpFilled />
              }
              iconPosition="end"
              id="collapse"
              onClick={() => setMobileToolbarCollapsed(!mobileToolbarCollapsed)}
            >
              {mobileToolbarCollapsed ? 'Expand' : 'Collapse'}
            </Button>
            <BookSettings
              bookId={bookId}
              showAiAssistantLink={aiEnabled && settings?.aiPdfDesignerOn}
              showKnowledgeBaseLink={aiEnabled && settings?.knowledgeBaseOn}
              toggleInformation={toggleMetadata}
              viewInformation={viewMetadata}
            />
            <MainMenuToolBar />
            <ToggleTypeWrapper>
              <Select
                onChange={(value, option) => {
                  setSelectedFormat(value)
                  setSelectedFormatLabel(option.label)
                  getFile(value)
                }}
                options={[
                  { value: 'odt', label: 'ODT' },
                  { value: 'docx', label: 'Word' },
                  { value: 'pdf', label: 'PDF' },
                  { value: 'rtf', label: 'RTF' },
                  { value: 'md', label: 'Markdown' },
                  { value: 'tex', label: 'LaTeX' },
                  { value: 'html', label: 'HTML' },
                ]}
                placeholder="Download to..."
                value={selectedFormat}
              />
            </ToggleTypeWrapper>
            <BookInformation
              bookComponentId={bookComponentId}
              bookId={bookId}
              showAiAssistantLink={aiEnabled && settings?.aiPdfDesignerOn}
              showKnowledgeBaseLink={aiEnabled && settings?.knowledgeBaseOn}
              toggleInformation={toggleMetadata}
              viewInformation={viewMetadata}
            />
          </TopMenu>
          <Main>
            {!options.fullScreen && (
              <LeftPanelWrapper>
                <CollapseContainer data-collapsed={bookPanelCollapsed}>
                  <Button
                    aria-label="Collapse"
                    icon={<ToTopOutlined />}
                    onClick={() => setBookPanelCollapsed(!bookPanelCollapsed)}
                    type="text"
                  />
                </CollapseContainer>

                <DocTreeManager
                  addResource={addResource}
                  bodyDivisionId={bodyDivisionId}
                  bookId={bookId}
                  deleteResource={deleteResource}
                  documentTitle={rest.documentTitle}
                  getDocTreeData={getDocTreeData}
                  isUploading={isUploading}
                  onUploadChapter={onUploadChapter}
                  renameResource={renameResource}
                  reorderResource={reorderResource}
                  setIsCurrentDocumentMine={setIsCurrentDocumentMine}
                  setSelectedChapterId={setSelectedChapterId}
                  setUploading={setUploading}
                  currentBookComponentTitle={currentBookComponentTitle}
                />
              </LeftPanelWrapper>
            )}

            <EditorArea isFullscreen={options.fullScreen}>
              <PanelGroup
                direction="column"
                onResizeEnd={onResizeEnd}
                panelWidths={[
                  { size: surfaceHeight, resize: 'stretch' },
                  { size: notesHeight, resize: 'resize' },
                ]}
              >
                <WaxSurfaceScroll id="wax-surface-scroll">
                  <EditorContainer selectedChapterId={selectedChapterId}>
                    {selectedChapterId ? (
                      <WaxView {...rest} />
                    ) : (
                      <NoSelectedChapterWrapper>
                        {t('editor.noChapterSelected')}
                      </NoSelectedChapterWrapper>
                    )}
                    <TrackToolsContainer>
                      {savedComments.length > 0 && (
                        <ToggleComments id="commentToggle">
                          <Checkbox
                            checked={showComments}
                            onChange={e => setShowComments(e.target.checked)}
                          >
                            SHOW COMMENTS
                          </Checkbox>
                        </ToggleComments>
                      )}
                      {showTrackControls && (
                        <TrackTools>
                          {commentsTracksCount + trackBlockNodesCount}{' '}
                          SUGGESTIONS
                          <TrackOptions>
                            <CommentTrackToolBar />
                          </TrackOptions>
                        </TrackTools>
                      )}
                    </TrackToolsContainer>
                    <CitationContainer>
                      <CitationRightArea />
                    </CitationContainer>
                    <CommentsContainer>
                      <RightArea area="main" />
                    </CommentsContainer>
                  </EditorContainer>
                </WaxSurfaceScroll>
                {hasNotes && (
                  <NotesAreaContainer>
                    {/* <NotesInnerContainer> */}
                    <NotesContainer id="notes-container">
                      <NotesArea view={main} />
                    </NotesContainer>
                    <CommentsContainerNotes>
                      <RightArea area="notes" />
                    </CommentsContainerNotes>
                    {/* </NotesInnerContainer> */}
                  </NotesAreaContainer>
                )}
              </PanelGroup>
            </EditorArea>
          </Main>
          <ChatToggleButton
            aria-label={isChatCollapsed ? 'Open chat' : 'Close chat'}
            isCollapsed={isChatCollapsed}
            onClick={() => setIsChatCollapsed(!isChatCollapsed)}
          >
            <VerticalAlignBottomOutlined />
          </ChatToggleButton>
          <ChatThread isCollapsed={isChatCollapsed}>
            <ChatThreadComponent
              announcementText="announcementText"
              hasMore={false}
              isActive
              messages={chatMessages}
              onFetchMore={() => {}}
              onSendMessage={onSendChatMessage}
              participants={extractUsers(currentBookComponentUsers)}
            />
          </ChatThread>
          <SpinnerWrapper showSpinner={showSpinner}>
            <Result
              icon={<Spin size={18} spinning />}
              title="Loading your document"
            />
          </SpinnerWrapper>

          <GenerationLoaderWrapper showLoader={isGenerating}>
            <Result
              icon={<Spin size={18} spinning />}
              title={`Generating your ${selectedFormatLabel} document`}
            />
          </GenerationLoaderWrapper>

          <FileUpload
            deleteFromFileManager={deleteFromFileManager}
            getUserFileManager={getUserFileManager}
            onClose={handleCloseFileUpload}
            open={loaded}
            setUserFileManagerFiles={setUserFileManagerFiles}
            updateFile={updateFile}
            updateFileInManager={updateFileInManager}
            uploadToFileManager={uploadToFileManager}
            userFileManagerFiles={userFileManagerFiles}
            waxApplication={app}
            waxContext={context}
          />
        </Wrapper>
      )}
    </ThemeProvider>
  )
}

LuluLayout.propTypes = {
  customProps: PropTypes.shape().isRequired,
}

export default LuluLayout
