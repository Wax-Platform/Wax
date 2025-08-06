import React, { useState, useEffect, useRef, useContext } from 'react'

// import useWebSocket from 'react-use-websocket'
import { useHistory, useParams } from 'react-router-dom'
import {
  useQuery,
  useLazyQuery,
  useMutation,
  useSubscription,
} from '@apollo/client'
import find from 'lodash/find'
import debounce from 'lodash/debounce'
import { uuid, useCurrentUser, serverUrl } from '@coko/client'

import styled from 'styled-components'
import {
  GET_ENTIRE_BOOK,
  GET_BOOK_SETTINGS,
  RENAME_BOOK_COMPONENT,
  // UPDATE_BOOK_COMPONENT_CONTENT,
  // UPDATE_BOOK_COMPONENT_TYPE,
  // DELETE_BOOK_COMPONENT,
  // CREATE_BOOK_COMPONENT,
  INGEST_WORD_FILES,
  UPDATE_BOOK_POD_METADATA,
  // UPDATE_BOOK_COMPONENTS_ORDER,
  UPLOAD_FILES,
  // LOCK_BOOK_COMPONENT_POD,
  RENAME_BOOK,
  BOOK_UPDATED_SUBSCRIPTION,
  BOOK_SETTINGS_UPDATED_SUBSCRIPTION,
  GET_BOOKS,
  GET_BOOK_COMPONENT,
  USE_CHATGPT,
  APPLICATION_PARAMETERS,
  SET_BOOK_COMPONENT_STATUS,
  // UPDATE_BOOK_COMPONENT_PARENT_ID,
  RAG_SEARCH,
  GET_COMMENTS,
  ADD_COMMENTS,
  NOTIFY_MENTIONS,
  GET_BOOK_TEAMS,
  UPLOAD_BOOK_COVER,
  UPDATE_COVER_ALT,
  // BOOK_SETTINGS_UPDATED_SUBSCRIPTION,
  GET_TREE_MANAGER_AND_SHARED_DOCS,
  ADD_RESOURCE,
  RENAME_RESOURCE,
  DELETE_RESOURCE,
  REORDER_RESOURCE,
  GET_USER_FILEMANAGER,
  UPLOAD_TO_FILEMANAGER,
  DELETE_FROM_FILEMANAGER,
  UPDATE_COMPONENT_ID_IN_FILEMANAGER,
  UPDATE_FILE,
  // GET_CHAT_CHANNEL,
  // CREATE_CHAT_CHANNEL,
  SEND_MESSAGE,
  FILTER_CHAT_CHANNELS,
  MESSAGE_CREATED_SUBSCRIPTION,
} from '../graphql'

import {
  isOwner,
  hasEditAccess,
  isAdmin,
  isCollaborator,
} from '../helpers/permissions'
import {
  showUnauthorizedActionModal,
  showUnauthorizedAccessModal,
  showGenericErrorModal,
  showChangeInPermissionsModal,
  onInfoModal,
  showOpenAiRateLimitModal,
  showErrorModal,
  showDeletedBookModal,
} from '../helpers/commonModals'

import { Editor, Modal, Paragraph, Spin } from '../ui'
import { waxAiToolRagSystem, waxAiToolSystem } from '../helpers/openAi'
import YjsContext from '../ui/provider-yjs/YjsProvider'

const StyledSpin = styled(Spin)`
  display: grid;
  height: 100vh;
  place-content: center;
`

const calculateEditorMode = (lock, canModify, currentUser, tabId) => {
  if (
    (lock && lock.userId !== currentUser.id) ||
    (lock && lock.userId === currentUser.id && tabId !== lock.tabId) ||
    !canModify
  ) {
    return 'preview'
  }

  if (!lock && canModify) {
    return 'full'
  }

  return lock && lock.userId === currentUser.id && tabId === lock.tabId
    ? 'full'
    : 'preview'
}

const constructMetadataValues = (title, podMetadata, cover) => {
  return {
    title,
    coverUrl: cover?.length ? cover[0].coverUrl : '',
    coverAlt: cover?.length ? cover[0].altText : '',
    ...podMetadata,
  }
}

// let issueInCommunicationModal

// eslint-disable-next-line react/prop-types
const ProducerPage = ({ bookId }) => {
  // #region INITIALIZATION SECTION START
  const { createYjsProvider, wsProvider } = useContext(YjsContext)
  const history = useHistory()
  const { bookComponentId } = useParams()
  const { currentUser } = useCurrentUser()
  const [tabId] = useState(uuid())

  const [selectedChapterId, setSelectedChapterId] = useState(
    () => bookComponentId || undefined,
  )

  const [isUploading, setUploading] = useState(false)

  // TreeFileManager
  const { refetch: getDocTreeData } = useQuery(
    GET_TREE_MANAGER_AND_SHARED_DOCS,
    { skip: true },
  )

  const [addResource] = useMutation(ADD_RESOURCE)
  const [renameResource] = useMutation(RENAME_RESOURCE)
  const [deleteResource] = useMutation(DELETE_RESOURCE)
  const [reorderResource] = useMutation(REORDER_RESOURCE)
  const [updateFile] = useMutation(UPDATE_FILE)

  // const [reconnecting, setReconnecting] = useState(false)
  const reconnecting = false
  const [customTags, setCustomTags] = useState([])
  const [aiOn, setAiOn] = useState(false)
  const [customPrompts, setCustomPrompts] = useState([])
  const [freeTextPromptsOn, setFreeTextPromptsOn] = useState(false)
  const [customPromptsOn, setCustomPromptsOn] = useState(false)
  // const [editorLoading, setEditorLoading] = useState(false)
  const [savedComments, setSavedComments] = useState()
  // const [key, setKey] = useState()
  const [viewMetadata, setViewMetadata] = useState('')
  const [isCurrentDocumentMine, setIsCurrentDocumentMine] = useState(null)
  const [canModify, setCanModify] = useState(true)

  const [currentBookComponentContent, setCurrentBookComponentContent] =
    useState(null)

  // const token = localStorage.getItem('token')

  useEffect(() => {
    setCanModify(
      isCurrentDocumentMine
        ? true
        : isAdmin(currentUser) || hasEditAccess(selectedChapterId, currentUser),
    )
  }, [selectedChapterId, isCurrentDocumentMine])

  const hasMembership =
    isOwner(bookId, currentUser) || isCollaborator(bookId, currentUser)

  // #endregion INITIALIZATION SECTION
  // QUERIES SECTION START
  const {
    loading: applicationParametersLoading,
    data: applicationParametersData,
  } = useQuery(APPLICATION_PARAMETERS, {
    fetchPolicy: 'network-only',
  })

  const hasRendered = useRef(false)
  const canUpdateTitle = useRef()
  const currentChapterTitle = useRef()

  const {
    loading,
    error,
    data: bookQueryData,
    refetch: refetchBook,
  } = useQuery(GET_ENTIRE_BOOK, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    variables: {
      id: bookId,
    },
    onCompleted: data => {
      setAiOn(data?.getBook?.bookSettings?.aiOn)
      setCustomPrompts(data?.getBook?.bookSettings?.customPrompts)
      setFreeTextPromptsOn(data?.getBook?.bookSettings?.freeTextPromptsOn)
      setCustomPromptsOn(data?.getBook?.bookSettings?.customPromptsOn)
      setCustomTags(data?.getBook?.bookSettings?.customTags)

      // if loading page the first time and no chapter is preselected, select the first one
      if (selectedChapterId === undefined) {
        const firstChapter = data?.getBook?.divisions[1].bookComponents[0]

        if (!firstChapter.uploading) {
          setSelectedChapterId(data?.getBook?.divisions[1].bookComponents[0].id)
        }
      }
    },
  })

  const { loading: bookComponentLoading, refetch: refetchBookComponent } =
    useQuery(GET_BOOK_COMPONENT, {
      fetchPolicy: 'network-only',
      skip: !selectedChapterId || !bookQueryData,
      variables: { id: selectedChapterId },
      onError: () => {
        if (!reconnecting) {
          if (hasMembership) {
            showGenericErrorModal()
          }
        }
      },
      onCompleted: data => {
        if (wsProvider) {
          wsProvider.disconnect()
        }

        if (
          data.getBookComponent.content &&
          data.getBookComponent.yState === null
        ) {
          setCurrentBookComponentContent(data.getBookComponent.content)
        } else {
          setCurrentBookComponentContent('')
        }

        createYjsProvider({
          currentUser,
          identifier: selectedChapterId,
          object: {
            bookComponentId: selectedChapterId,
          },
        })

        getComments({
          variables: {
            bookId,
            chapterId: selectedChapterId,
          },
        })
      },
    })

  const { refetch: getUserFileManager } = useQuery(GET_USER_FILEMANAGER, {
    skip: true,
  })

  const [uploadToFileManager] = useMutation(UPLOAD_TO_FILEMANAGER)
  const [deleteFromFileManager] = useMutation(DELETE_FROM_FILEMANAGER)

  const [updateComponentIdInManager] = useMutation(
    UPDATE_COMPONENT_ID_IN_FILEMANAGER,
  )

  const [getComments] = useLazyQuery(GET_COMMENTS, {
    skip: !bookId || !selectedChapterId,
    fetchPolicy: 'network-only',
    variables: {
      bookId,
      chapterId: selectedChapterId,
    },
    onCompleted: data => {
      if (data && data.getChapterComments) {
        setSavedComments(data.getChapterComments.content)
      }
    },
  })

  const [chatGPT] = useLazyQuery(USE_CHATGPT, {
    fetchPolicy: 'network-only',
    onError: err => {
      if (err.toString().includes('Missing access key')) {
        onInfoModal('Access key is missing or invalid')
      } else if (
        err.toString().includes('Request failed with status code 429')
      ) {
        showOpenAiRateLimitModal()
      } else {
        showGenericErrorModal()
      }
    },
  })

  const {
    data: chatChannel,
    loading: chatLoading,
    refetch: refetchChatChannels,
  } = useQuery(FILTER_CHAT_CHANNELS, {
    variables: {
      filter: { relatedObjectId: selectedChapterId },
    },
    fetchPolicy: 'network-only',
  })

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    refetchQueries: [
      {
        query: FILTER_CHAT_CHANNELS,
        variables: {
          filter: { relatedObjectId: selectedChapterId },
        },
      },
    ],
  })

  const onSendChatMessage = async (content, mentions, attachments) => {
    console.log('attachments', attachments)
    return handleSendChatMessage(
      content,
      mentions,
      attachments,
      chatChannel?.chatChannels?.result[0].id,
    )
  }

  const handleSendChatMessage = async (
    content,
    mentions,
    attachments,
    chatChannelId,
  ) => {
    const fileObjects = attachments.map(attachment => attachment.originFileObj)

    const mutationData = {
      variables: {
        input: {
          content,
          chatChannelId,
          userId: currentUser.id,
          mentions,
          attachments: fileObjects,
        },
      },
    }

    return sendMessage(mutationData)
  }

  const [ragSearch] = useLazyQuery(RAG_SEARCH)

  const [getBookSettings] = useLazyQuery(GET_BOOK_SETTINGS, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    variables: {
      id: bookId,
    },
  })

  const { data: { getObjectTeams: { result: bookMembers } = {} } = {} } =
    useQuery(GET_BOOK_TEAMS, {
      variables: {
        objectId: bookId,
        objectType: 'book',
      },
    })

  const editorRef = useRef(null)

  // QUERIES SECTION END

  // only owner or collaborators with edit access can comment or see comments
  const canInteractWithComments =
    isOwner(bookId, currentUser) ||
    (isCollaborator(bookId, currentUser) && hasEditAccess(bookId, currentUser))

  useEffect(() => {
    const hash = window.location.hash.substring(1)

    if (hash) {
      if (hash === 'metadata') {
        setViewMetadata(true)
        setSelectedChapterId(null)
      } else {
        setSelectedChapterId(hash)
      }

      window.history.replaceState('', document.title, window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if (currentUser && !hasRendered.current) {
      hasRendered.current = true
    } else if (hasRendered.current) {
      const stillMember =
        isAdmin(currentUser) ||
        isOwner(bookId, currentUser) ||
        isCollaborator(bookId, currentUser)

      if (stillMember) {
        showChangeInPermissionsModal()
      }
    }
  }, [currentUser])

  const bookComponent =
    !loading &&
    selectedChapterId &&
    find(bookQueryData?.getBook?.divisions[1].bookComponents, {
      id: selectedChapterId,
    })

  const editorMode =
    !loading &&
    selectedChapterId &&
    calculateEditorMode(bookComponent?.lock, canModify, currentUser, tabId)

  const isReadOnly =
    !selectedChapterId || (editorMode && editorMode === 'preview') || !canModify

  const bookMetadataValues = constructMetadataValues(
    bookQueryData?.getBook.title,
    bookQueryData?.getBook?.podMetadata,
    bookQueryData?.getBook?.cover,
  )

  useEffect(() => {
    if (
      !loading &&
      !hasMembership &&
      !error?.message?.includes('does not exist')
    ) {
      const redirectToDashboard = () => history.push('/dashboard')
      showUnauthorizedAccessModal(redirectToDashboard)
    }
  }, [hasMembership])

  useEffect(() => {
    // if (!selectedChapterId) {
    //   localStorage.removeItem(`${bookId}-selected-chapter`)
    // } else {
    //   localStorage.setItem(`${bookId}-selected-chapter`, selectedChapterId)
    // }
    setSavedComments(null)
  }, [selectedChapterId])

  // useEffect(() => {
  //   if (!bookComponentLoading) {
  //     setKey(uuid())
  //   }
  // }, [editorLoading, bookComponentLoading, isReadOnly])

  // SUBSCRIPTIONS SECTION START

  // useSubscription(YJS_CONTENT_UPDATED_SUBSCRIPTION, {
  //   variables: { id: bookComponentId },
  //   fetchPolicy: 'network-only',
  //   onData: (id) => {
  //     console.log(id)
  //     console.log('updated content')
  //   },
  // })

  useSubscription(BOOK_UPDATED_SUBSCRIPTION, {
    variables: { id: bookId },
    fetchPolicy: 'network-only',
    onData: () => {
      if (hasMembership) {
        refetchBook({ id: bookId })
      }
    },
  })

  useSubscription(BOOK_SETTINGS_UPDATED_SUBSCRIPTION, {
    variables: { id: bookId },
    fetchPolicy: 'network-only',
    onData: async () => {
      const { data } = await refetchBook({ id: bookId })
      setAiOn(data?.getBook?.bookSettings?.aiOn)
      setCustomPrompts(data?.getBook?.bookSettings?.customPrompts)
      setFreeTextPromptsOn(data?.getBook?.bookSettings?.freeTextPromptsOn)
      setCustomPromptsOn(data?.getBook?.bookSettings?.customPromptsOn)
      setCustomTags(data?.getBook?.bookSettings?.customTags)

      if (selectedChapterId) {
        await refetchBookComponent()
      }

      // setKey(uuid())
    },
  })

  // Subscribe to new chat messages

  useSubscription(MESSAGE_CREATED_SUBSCRIPTION, {
    variables: {
      chatChannelId: chatChannel?.chatChannels?.result?.[0]?.id,
    },
    skip: !chatChannel?.chatChannels?.result?.[0]?.id,
    onData: ({ data }) => {
      if (data?.data?.messageCreated) {
        // Refetch the chat channels to get the updated messages
        refetchChatChannels()
      }
    },
  })
  // SUBSCRIPTIONS SECTION END

  useEffect(() => {
    if (isOwner(bookId, currentUser)) {
      // if (selectedChapterId) {
      //   setCurrentBookComponentContent(editorRef?.current?.getContent())
      // }

      refetchBook({ id: bookId })
    }
  }, [bookQueryData?.getBook.bookSettings?.aiOn])

  const [addComments] = useMutation(ADD_COMMENTS)

  const [
    setBookComponentStatus,
    { loading: setBookComponentStatusInProgress },
  ] = useMutation(SET_BOOK_COMPONENT_STATUS, {
    onError: err => {
      if (err.toString().includes('Not Authorised')) {
        showUnauthorizedActionModal(false)
      } else if (!reconnecting) showGenericErrorModal()
    },
  })

  const [renameBook] = useMutation(RENAME_BOOK, {
    onError: err => {
      if (err.toString().includes('Not Authorised')) {
        showUnauthorizedActionModal(false)
      } else if (!reconnecting) showGenericErrorModal()
    },
  })

  const [updateCoverAlt] = useMutation(UPDATE_COVER_ALT, {
    onError: err => {
      if (err.toString().includes('Not Authorised')) {
        showUnauthorizedActionModal(false)
      } else if (!reconnecting) showGenericErrorModal()
    },
  })

  const [renameBookComponent] = useMutation(RENAME_BOOK_COMPONENT, {
    variables: {
      id: selectedChapterId,
    },
    onError: err => {
      if (err.toString().includes('Not Authorised')) {
        showUnauthorizedActionModal(false)
      } else if (!reconnecting && !err.toString().includes('NotFoundError'))
        // added the second clause to avoid weird race condition trying to rename deleted chapter
        showGenericErrorModal()
    },
  })

  const [ingestWordFile, { loading: ingestWordFileInProgress }] = useMutation(
    INGEST_WORD_FILES,
    {
      refetchQueries: [GET_ENTIRE_BOOK],
      onError: err => {
        if (err.toString().includes('Not Authorised')) {
          showUnauthorizedActionModal(false)
        } else if (!reconnecting) showGenericErrorModal()
      },
    },
  )

  const [updatePODMetadata] = useMutation(UPDATE_BOOK_POD_METADATA, {
    onError: err => {
      if (err.toString().includes('Not Authorised')) {
        showUnauthorizedActionModal(false)
      } else if (!reconnecting) showGenericErrorModal()
    },
  })

  // const [lockBookComponent] = useMutation(LOCK_BOOK_COMPONENT_POD, {
  //   refetchQueries: [GET_ENTIRE_BOOK],
  //   onError: () => {},
  // })

  const [upload] = useMutation(UPLOAD_FILES)

  const [notifyMentions] = useMutation(NOTIFY_MENTIONS)

  const [uploadBookCover] = useMutation(UPLOAD_BOOK_COVER)
  // MUTATIONS SECTION END

  // HANDLERS SECTION START

  const handleUploadBookCover = file => {
    if (!canModify) {
      return showUnauthorizedActionModal(false)
    }

    return uploadBookCover({
      variables: {
        id: bookId,
        file,
      },
    })
  }

  const messagesApiToUi = (messages, currentUserId = null) => {
    return messages
      ? messages.map(
          ({
            id,
            created,
            content,
            user: { id: userId, displayName } = {},
            attachments,
          }) => {
            return {
              id,
              content,
              date: created,
              own: userId === currentUserId,
              user: displayName,
              attachments,
            }
          },
        )
      : []
  }

  const getBodyDivisionId = () => {
    if (bookQueryData) {
      const { getBook } = bookQueryData
      const { divisions } = getBook
      const bodyDivision = find(divisions, { label: 'Body' })
      return bodyDivision.id
    }

    return undefined
  }

  canUpdateTitle.current =
    selectedChapterId &&
    canModify &&
    !(applicationParametersLoading || loading || bookComponentLoading)

  currentChapterTitle.current = find(
    bookQueryData?.getBook?.divisions[1].bookComponents,
    {
      id: selectedChapterId,
    },
  )?.title

  const onBookComponentTitleChange = title => {
    // only fire if new title !== current title to avoid unnecessary call
    if (canUpdateTitle.current && title !== currentChapterTitle.current) {
      renameBookComponent({
        variables: {
          input: {
            id: selectedChapterId,
            title,
          },
          title,
        },
      })
    }
  }

  const onPeriodicTitleChange = debounce(title => {
    onBookComponentTitleChange(title)
  }, 50)

  const onSubmitBookMetadata = debounce(data => {
    const { title, subtitle, coverAlt, ...rest } = data

    if (!canModify) {
      showUnauthorizedActionModal(false)
      return
    }

    if (title) {
      renameBook({ variables: { id: bookId, title } })
    }

    if (typeof coverAlt === 'string') {
      updateCoverAlt({ variables: { id: bookId, coverAlt } })
    }

    updatePODMetadata({ variables: { bookId, metadata: rest } })
  }, 1000)

  const showUploadingModal = () => {
    const warningModal = Modal.warn()
    return warningModal.update({
      title: 'Warning',
      content: (
        <Paragraph>
          You can not start editing this component as it is in uploading state.
          This means that we are converting your provided .docx file in order to
          create the content of this chapter. Please try again in a moment.
        </Paragraph>
      ),
      maskClosable: false,
      onOk() {
        warningModal.destroy()
      },
      okButtonProps: { style: { backgroundColor: 'black' } },
      width: 570,
      bodyStyle: {
        marginRight: 38,
        textAlign: 'justify',
      },
    })
  }

  const showConversionErrorModal = chapterId => {
    const errorModal = Modal.error()
    return errorModal.update({
      title: 'Error',
      content: (
        <Paragraph>
          Unfortunately, something went wrong while trying to convert your docx
          file. Please inform your admin about this issue. In the meantime, you
          could manually insert your content via using our editor, or delete
          this chapter and re-upload it if your admin informs you that this
          issue is resolved.
        </Paragraph>
      ),
      maskClosable: false,
      onOk() {
        setBookComponentStatus({
          variables: { id: chapterId, status: 200 },
        })
        errorModal.destroy()
      },
      okButtonProps: { style: { backgroundColor: 'black' } },
      width: 570,
      bodyStyle: {
        marginRight: 38,
        textAlign: 'justify',
      },
    })
  }

  const showAiUnavailableModal = () => {
    const errorModal = Modal.error()
    return errorModal.update({
      title: 'Error',
      content: (
        <Paragraph>AI use has been disabled by the book owner</Paragraph>
      ),
      onOk() {
        refetchBook()
      },
      okButtonProps: { style: { backgroundColor: 'black' } },
      maskClosable: false,
      width: 570,
      bodyStyle: {
        marginRight: 38,
        textAlign: 'justify',
      },
    })
  }

  const queryAI = async (input, { askKb }) => {
    const settings = await getBookSettings()
    const [userInput, highlightedText] = input.text

    const formattedInput = {
      text: [`${userInput}.\nHighlighted text: ${highlightedText}`],
    }

    let response = 'hello'

    if (!askKb) {
      const {
        data: { openAi },
      } = await chatGPT({
        variables: {
          system: waxAiToolSystem,
          input: formattedInput,
        },
      })

      const {
        message: { content },
      } = JSON.parse(openAi)

      response = content
    } else {
      const { data } = await ragSearch({
        variables: {
          bookId,
          input: formattedInput,
          system: waxAiToolRagSystem,
        },
      })

      const {
        message: { content },
      } = JSON.parse(data.ragSearch)

      response = content
    }

    if (settings?.data.getBook.bookSettings.aiOn) {
      return new Promise((resolve, reject) => {
        resolve(response)
      })
    }

    showAiUnavailableModal()
    return new Promise((resolve, reject) => {
      reject()
    })
  }

  const onChapterClick = chapterId => {
    const found = find(bookQueryData?.getBook?.divisions[1].bookComponents, {
      id: chapterId,
    })

    const isAlreadySelected =
      selectedChapterId && chapterId === selectedChapterId

    if (isAlreadySelected) {
      setSelectedChapterId(null)
      return
    }

    if (found?.status === 300) {
      showConversionErrorModal(chapterId)
      return
    }

    if (found?.uploading) {
      showUploadingModal()
      return
    }

    setSelectedChapterId(chapterId)
  }

  const onUploadChapter = () => {
    if (!canModify) {
      showUnauthorizedActionModal(false)
      return
    }

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.docx'

    input.onchange = event => {
      const selectedFile = event.target.files[0]

      setUploading(true)
      ingestWordFile({
        variables: {
          bookComponentFiles: [
            {
              file: selectedFile,
              bookId,
              componentType: 'chapter',
              divisionLabel: 'Body',
            },
          ],
        },
      })
    }

    input.click()
  }

  const handleImageUpload = async file => {
    if (!canModify) {
      return showUnauthorizedActionModal(false)
    }

    const mutationVariables = {
      variables: {
        files: [file],
        entityId: selectedChapterId,
        entityType: 'bookComponent',
      },
    }

    let uploadedFile

    await upload(mutationVariables)
      .then(res => {
        /* eslint-disable-next-line prefer-destructuring */
        uploadedFile = res.data.uploadFiles[0]
      })
      .catch(e => console.error(e))

    // wax expects a promise here
    return new Promise((resolve, reject) => {
      if (uploadedFile) {
        const { id: fileId } = uploadedFile

        resolve({
          url: `${serverUrl}/file/${fileId}`,
          extraData: {
            fileId,
          },
        })
      } else {
        reject()
      }
    })
  }

  const handleAddingComments = content => {
    if (isOwner(bookId, currentUser) || isCollaborator(bookId, currentUser)) {
      // update local copy of comments to show comment box
      setSavedComments(JSON.stringify(content))

      if (savedComments !== null && JSON.stringify(content) !== savedComments) {
        debouncedSaveComments({
          commentData: {
            bookId,
            chapterId: selectedChapterId,
            content: JSON.stringify(content),
          },
        })
      }
    }
  }

  const handleMentions = (users, text) => {
    notifyMentions({
      variables: {
        mentionsData: {
          ids: users.map(u => u.id),
          bookId,
          chapterId: selectedChapterId,
          text,
        },
      },
    })
  }

  const debouncedSaveComments = debounce(variables => {
    addComments({
      variables,
    })
  }, 1000)

  // HANDLERS SECTION END

  // WEBSOCKET SECTION START
  // useWebSocket(
  //   `${webSocketServerUrl}/locks`,
  //   {
  //     onOpen: () => {
  //       if (editorMode && editorMode !== 'preview') {
  //         if (!reconnecting) {
  //           onBookComponentLock()
  //         }

  //         if (reconnecting) {
  //           if (selectedChapterId) {
  //             const tempChapterId = selectedChapterId
  //             setSelectedChapterId(null)
  //             setSelectedChapterId(tempChapterId)
  //           }

  //           if (issueInCommunicationModal) {
  //             issueInCommunicationModal.destroy()
  //             issueInCommunicationModal = undefined
  //           }

  //           setReconnecting(false)
  //         }
  //       }
  //     },
  //     onError: () => {
  //       if (!reconnecting) {
  //         issueInCommunicationModal = communicationDownModal()
  //         setReconnecting(true)
  //       }
  //     },
  //     shouldReconnect: () => {
  //       return selectedChapterId && editorMode && editorMode !== 'preview'
  //     },
  //     onReconnectStop: () => {
  //       showOfflineModal()
  //     },
  //     queryParams: {
  //       token,
  //       bookComponentId: selectedChapterId,
  //       tabId,
  //     },
  //     share: true,
  //     reconnectAttempts: 5000,
  //     reconnectInterval: (heartbeatInterval?.config || 5000) + 500,
  //   },
  //   selectedChapterId !== undefined && editorMode && editorMode !== 'preview',
  // )

  // useEffect(() => {
  //   if (wsProvider) {
  //     wsProvider?.disconnect()
  //   }

  //   if (selectedChapterId) {
  //     setShowSpinner(true)
  //     setTimeout(() => {
  //       createYjsProvider({
  //         currentUser,
  //         identifier: selectedChapterId,
  //         object: {
  //           bookComponentId: selectedChapterId,
  //         },
  //       })
  //     }, 500)

  //     setTimeout(() => {
  //       setShowSpinner(false)
  //     }, 1200)
  //   }

  //   return () => wsProvider?.disconnect()
  // }, [selectedChapterId])

  // WEBSOCKET SECTION END

  if (!loading && error?.message?.includes('does not exist')) {
    showErrorModal(() => history.push('/dashboard'))
  }

  if (!loading && error?.message?.includes('has been deleted')) {
    showDeletedBookModal(() => history.push('/dashboard'))
  }

  if (reconnecting) {
    return <StyledSpin spinning />
  }

  const chaptersActionInProgress =
    ingestWordFileInProgress || setBookComponentStatusInProgress

  const isAIEnabled = find(
    applicationParametersData?.getApplicationParameters,
    { area: 'aiEnabled' },
  )

  const members = bookMembers
    ?.map(team => {
      if (team.members.length > 0) {
        return team.members.map(
          member =>
            member.status !== 'read' &&
            member.user.id !== currentUser.id && {
              id: member.user.id,
              displayName: member.user.displayName,
            },
        )
      }

      return false
    })
    .flat()
    .filter(member => !!member)

  if (!wsProvider || currentBookComponentContent === null) return null

  console.log(chatChannel, chatLoading)

  return (
    <Editor
      addComments={handleAddingComments}
      addResource={addResource}
      aiEnabled={isAIEnabled?.config}
      aiOn={aiOn}
      bodyDivisionId={getBodyDivisionId()}
      bookComponentContent={currentBookComponentContent}
      bookId={bookId}
      bookMembers={members}
      bookMetadataValues={bookMetadataValues}
      canEdit={canModify}
      canInteractWithComments={canInteractWithComments}
      chapters={bookQueryData?.getBook?.divisions[1].bookComponents}
      chaptersActionInProgress={chaptersActionInProgress}
      chatChannel={chatChannel?.chatChannels?.result[0]}
      chatLoading={chatLoading}
      chatMessages={messagesApiToUi(
        chatChannel?.chatChannels?.result[0]?.messages || [],
        currentUser?.id,
      )}
      comments={savedComments ? JSON.parse(savedComments) : []}
      configurableEditorConfig={
        bookQueryData?.getBook.bookSettings.configurableEditorConfig
      }
      configurableEditorOn={
        bookQueryData?.getBook.bookSettings.configurableEditorOn
      }
      customPrompts={customPrompts}
      customPromptsOn={customPromptsOn}
      customTags={customTags}
      deleteFromFileManager={deleteFromFileManager}
      deleteResource={deleteResource}
      // editorKey={key}
      // editorLoading={editorLoading}
      editorRef={editorRef}
      freeTextPromptsOn={freeTextPromptsOn}
      getBookSettings={getBookSettings}
      getDocTreeData={getDocTreeData}
      getUserFileManager={getUserFileManager}
      isReadOnly={isReadOnly}
      isUploading={isUploading}
      kbOn={bookQueryData?.getBook.bookSettings.knowledgeBaseOn}
      onChapterClick={onChapterClick}
      onImageUpload={handleImageUpload}
      onMention={handleMentions}
      onPeriodicTitleChange={onPeriodicTitleChange} // WE KEEP
      onSendChatMessage={onSendChatMessage}
      onSubmitBookMetadata={onSubmitBookMetadata}
      onUploadBookCover={handleUploadBookCover}
      onUploadChapter={onUploadChapter}
      queryAI={queryAI}
      renameResource={renameResource}
      reorderResource={reorderResource}
      selectedChapterId={selectedChapterId}
      setIsCurrentDocumentMine={setIsCurrentDocumentMine}
      setSelectedChapterId={setSelectedChapterId}
      settings={bookQueryData?.getBook.bookSettings}
      setUploading={setUploading}
      setViewMetadata={setViewMetadata}
      title={bookQueryData?.getBook.title}
      updateComponentIdInManager={updateComponentIdInManager}
      updateFile={updateFile}
      uploadToFileManager={uploadToFileManager}
      user={currentUser}
      viewMetadata={viewMetadata}
    />
  )
}

// eslint-disable-next-line react/function-component-definition
export default props => {
  const { loading, data: dataBooks } = useQuery(GET_BOOKS, {
    fetchPolicy: 'network-only',
    variables: {
      options: {
        archived: false,
        orderBy: {
          column: 'title',
          order: 'asc',
        },
        page: 0,
        pageSize: 10,
      },
    },
  })

  if (loading) return null

  const [book] = dataBooks.getBooks.result

  return <ProducerPage {...props} bookId={book.id} />
}
