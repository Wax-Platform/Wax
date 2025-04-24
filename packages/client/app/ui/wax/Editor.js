/* eslint-disable react/prop-types, react/jsx-no-constructed-context-values */
import React, { useEffect, useState, useMemo, useRef } from 'react'
import { Wax } from 'wax-prosemirror-core'
import { isEqual } from 'lodash'
import { LuluLayout } from './layout'
import configWithAi from './config/configWithAI'
import YjsService from './config/YjsService'

const EditorWrapper = ({
  bookId,
  bodyDivisionId,
  bookComponentContent,
  title,
  onPeriodicTitleChange, // WE KEEP
  isReadOnly,
  setIsCurrentDocumentMine,
  onImageUpload,
  onChapterClick,
  queryAI,
  aiEnabled,
  chaptersActionInProgress,
  onUploadChapter,
  onSubmitBookMetadata,
  bookMetadataValues,
  selectedChapterId,
  canEdit,
  customTags,
  configurableEditorOn,
  configurableEditorConfig,
  aiOn,
  editorRef,
  freeTextPromptsOn,
  customPrompts,
  customPromptsOn,
  editorLoading,
  kbOn,
  canInteractWithComments,
  comments: savedComments,
  editorKey,
  user,
  bookMembers,
  onMention,
  onUploadBookCover,
  viewMetadata,
  setViewMetadata,
  settings,
  getBookSettings,
  wsProvider,
  ydoc,
  deleteResource,
  renameResource,
  addResource,
  reorderResource,
  getDocTreeData,
  setSelectedChapterId,
}) => {
  const [luluWax, setLuluWax] = useState({
    onChapterClick,
    selectedChapterId,
    onUploadChapter,
    canEdit,
    chaptersActionInProgress,
    title,
    onSubmitBookMetadata,
    bookMetadataValues,
    editorLoading,
    savedComments,
    onUploadBookCover,
    viewMetadata,
    setViewMetadata,
    settings,
    getBookSettings,
    bookId,
    aiEnabled,
    deleteResource,
    renameResource,
    addResource,
    reorderResource,
    getDocTreeData,
    setSelectedChapterId,
    setIsCurrentDocumentMine,
  })

  const [selectedWaxConfig, setSelectedWaxConfig] = useState(configWithAi)

  const waxMenuConfig =
    configurableEditorOn && configurableEditorConfig?.length
      ? JSON.parse(configurableEditorConfig)
      : configWithAi

  const tags = customTags?.length > 0 ? JSON.parse(customTags) : []

  const previousRefEditorConfig = useRef(configurableEditorConfig)
  const previousRefEditorTags = useRef(tags)
  const memoizedProvider = useMemo(() => wsProvider)

  // Used For Editor's reconfiguration
  useEffect(() => {
    if (!isEqual(previousRefEditorTags.current, tags)) {
      previousRefEditorTags.current = tags
      setSelectedWaxConfig({
        ...selectedWaxConfig,
        CustomTagService: {
          tags,
          updateTags: () => true,
        },
      })
    }
  }, [JSON.stringify(tags)])

  useEffect(() => {
    if (!isEqual(previousRefEditorConfig.current, configurableEditorConfig)) {
      previousRefEditorConfig.current = configurableEditorConfig
      setSelectedWaxConfig({
        ...selectedWaxConfig,
        MenuService: selectedWaxConfig.MenuService.map(service => {
          // Find the matching service in waxMenuConfig based on templateArea
          const matchingConfig = waxMenuConfig.MenuService.find(
            config => config.templateArea === service.templateArea,
          )

          return {
            ...service,
            toolGroups: matchingConfig
              ? matchingConfig.toolGroups
              : service.toolGroups,
          }
        }),
      })
    }
  }, [configurableEditorConfig])

  useEffect(() => {
    setSelectedWaxConfig({
      ...selectedWaxConfig,
      editorKey,
      MenuService: selectedWaxConfig.MenuService.map(service => {
        // Find the matching service in waxMenuConfig based on templateArea
        const matchingConfig = waxMenuConfig.MenuService.find(
          config => config?.templateArea === service.templateArea,
        )

        return {
          ...service,
          toolGroups: matchingConfig
            ? matchingConfig.toolGroups
            : service.toolGroups,
        }
      }),
      AskAiContentService: {
        AskAiContentTransformation: queryAI,
        FreeTextPromptsOn: freeTextPromptsOn,
        CustomPromptsOn: customPromptsOn,
        CustomPrompts: customPromptsOn ? customPrompts : [],
        AiOn: aiEnabled && aiOn,
        ...(kbOn ? { AskKb: true } : {}),
      },
    })
  }, [aiOn])

  useEffect(() => {
    console.log(bookComponentContent,'useEffect bookComponentContent')
    setSelectedWaxConfig({
      ...selectedWaxConfig,
      YjsService: {
        content: bookComponentContent,
        provider: () => wsProvider,
        ydoc: () => ydoc,
        yjsType: 'prosemirror',
        cursorBuilder: (user) => {
          if (user) {
            const cursor = document.createElement('span')
            cursor.classList.add('ProseMirror-yjs-cursor')
            cursor.setAttribute('style', `border-color: ${user.color}`)
            const userDiv = document.createElement('div')
            userDiv.setAttribute('style', `background-color: ${user.color}`)
            userDiv.insertBefore(
              document.createTextNode(user.displayName),
              null,
            )
            cursor.insertBefore(userDiv, null)
            return cursor
          }

          return ''
        },
      },
      TitleService: {
        updateTitle: onPeriodicTitleChange,
      },
      CommentsService: {
        // readOnly: !canInteractWithComments,
        readOnlyPost: false,
        readOnlyResolve: !canInteractWithComments,
        // getComments: addComments,
        readOnly: !canInteractWithComments,
        setComments: () => {
          return []
        },
        userList: bookMembers,
        getMentionedUsers: onMention,
      },

      services: [new YjsService(), ...selectedWaxConfig.services],
    })
  }, [memoizedProvider])

  useEffect(() => {
    setLuluWax({
      title,
      selectedChapterId,
      chaptersActionInProgress,
      onChapterClick,
      onUploadChapter,
      onSubmitBookMetadata,
      bookMetadataValues,
      canEdit,
      editorLoading,
      savedComments,
      onUploadBookCover,
      viewMetadata,
      setViewMetadata,
      getBookSettings,
      settings,
      bookId,
      bodyDivisionId,
      aiEnabled,
      deleteResource,
      renameResource,
      addResource,
      reorderResource,
      getDocTreeData,
      setSelectedChapterId,
      setIsCurrentDocumentMine,
    })
  }, [
    title,
    selectedChapterId,
    bookMetadataValues,
    chaptersActionInProgress,
    canEdit,
    editorLoading,
    savedComments,
    viewMetadata,
    settings,
    bookId,
    aiEnabled,
  ])

  const userObject = {
    userId: user.id,
    userColor: {
      addition: 'royalblue',
      deletion: 'indianred',
    },
    username: user.displayName,
  }

  if (!selectedWaxConfig || canInteractWithComments === null) return null

  return (
    <Wax
      autoFocus
      config={selectedWaxConfig}
      customProps={luluWax}
      fileUpload={onImageUpload}
      layout={LuluLayout}
      readonly={isReadOnly}
      ref={editorRef}
      user={userObject}
    />
  )
}

EditorWrapper.defaultProps = {
  comments: [],
  bookMembers: [],
  canInteractWithComments: null,
  onMention: null,
}

export default EditorWrapper
