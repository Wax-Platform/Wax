/* eslint-disable react/prop-types, react/jsx-no-constructed-context-values */
import React, { useEffect, useState, useMemo, useRef, useContext } from 'react'
import { Wax } from 'wax-prosemirror-core'
import { isEqual } from 'lodash'
import YjsContext from '../provider-yjs/YjsProvider'
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
  deleteResource,
  renameResource,
  addResource,
  reorderResource,
  getDocTreeData,
  setSelectedChapterId,
  isUploading,
  setUploading,
  getUserFileManager,
  uploadToFileManager,
  deleteFromFileManager,
  updateComponentIdInManager,
  updateFile,
}) => {
  const { wsProvider, ydoc } = useContext(YjsContext)
  const [documentTitle, setTitle] = useState(null)

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

  const [userFileManagerFiles, setUserFileManagerFiles] = useState([])
  const [loaded, setLoaded] = useState(false)
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

  const onAssetManager = async () => {
    setLoaded(true)
    const userFiles = await getUserFileManager()
    setUserFileManagerFiles(JSON.parse(userFiles.data.getUserFileManager))
    return userFiles
  }

  const handleCloseFileUpload = () => {
    setLoaded(false)
  }

  useEffect(() => {
    setSelectedWaxConfig({
      ...selectedWaxConfig,
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
      YjsService: {
        content: bookComponentContent,
        provider: () => wsProvider,
        ydoc: () => ydoc,
        yjsType: 'prosemirror',
        cursorBuilder: u => {
          if (u) {
            const cursor = document.createElement('span')
            cursor.classList.add('ProseMirror-yjs-cursor')
            cursor.setAttribute('style', `border-color: ${u.color}`)
            const userDiv = document.createElement('div')
            userDiv.setAttribute('style', `background-color: ${u.color}`)
            userDiv.insertBefore(document.createTextNode(u.displayName), null)
            cursor.insertBefore(userDiv, null)
            return cursor
          }

          return ''
        },
      },
      CustomTagService: {
        tags,
        updateTags: () => true,
      },
      TitleService: {
        updateTitle: t => {
          setTitle(t)
        },
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
      ImageService: {
        handleAssetManager: onAssetManager,
        handleAddedRemovedImages,
        showAlt: true,
      },

      AskAiContentService: {
        AskAiContentTransformation: queryAI,
        FreeTextPromptsOn: freeTextPromptsOn,
        CustomPromptsOn: customPromptsOn,
        CustomPrompts: customPromptsOn ? customPrompts : [],
        AiOn: aiEnabled && aiOn,
        ...(kbOn ? { AskKb: true } : {}),
      },

      services: [new YjsService(), ...selectedWaxConfig.services],
    })
  }, [memoizedProvider])

  const handleAddedRemovedImages = async images => {
    const addedImages = (images?.added || []).map(node => node.attrs.fileid)
    const removedImages = (images?.removed || []).map(node => node.attrs.fileid)

    await updateComponentIdInManager({
      variables: {
        bookComponentId: selectedChapterId,
        input: {
          added: addedImages,
          removed: removedImages,
        },
      },
    })
  }

  useEffect(() => {
    setLuluWax({
      ...luluWax,
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
      isUploading,
      setUploading,
      deleteFromFileManager,
      getUserFileManager,
      handleCloseFileUpload,
      loaded,
      setUserFileManagerFiles,
      uploadToFileManager,
      userFileManagerFiles,
      updateFile,
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
    loaded,
    userFileManagerFiles,
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
      // autoFocus
      config={selectedWaxConfig}
      customProps={luluWax}
      documentTitle={documentTitle}
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
