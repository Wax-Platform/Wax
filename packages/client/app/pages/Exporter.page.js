/* eslint-disable react/prop-types */

// #region import
import React, { useState, useContext } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import styled from 'styled-components'
import {
  useQuery,
  useMutation,
  useLazyQuery,
  useSubscription,
} from '@apollo/client'
import isEqual from 'lodash/isEqual'
import pick from 'lodash/pick'
import sortBy from 'lodash/sortBy'

import { useCurrentUser } from '@coko/client'

import {
  GET_BOOKS,
  APPLICATION_PARAMETERS,
  BOOK_UPDATED_SUBSCRIPTION,
  CREATE_EXPORT_PROFILE,
  DELETE_EXPORT_PROFILE,
  GET_BOOK_COMPONENT_IDS,
  GET_SPECIFIC_TEMPLATES,
  GET_EXPORT_PROFILES,
  GET_PAGED_PREVIEWER_LINK,
  EXPORT_BOOK,
  RENAME_EXPORT_PROFILE,
  UPLOAD_TO_LULU,
  UPDATE_EXPORT_PROFILE_OPTIONS,
  UPDATE_BOOK_COMPONENT_CONTENT,
  PUBLISH_ONLINE,
  UNPUBLISH_ONLINE,
  GET_BOOK_WEB_PUBLISH_INFO,
} from '../graphql'

import YjsContext from '../ui/provider-yjs/YjsProvider'

import { isOwner, hasEditAccess } from '../helpers/permissions'
import {
  showErrorModal,
  showDeletedBookModal,
  showFlaxPreviewErrorModal,
  showFlaxPublishErrorModal,
} from '../helpers/commonModals'
import { Preview, Spin } from '../ui'
// #endregion import

const StyledSpin = styled(Spin)`
  display: grid;
  height: 100vh;
  place-content: center;
`

// #region helpers
// exported for stories
export const defaultProfile = {
  label: 'New export',
  value: 'new-export',
  format: 'pdf',
  size: '8.3x11.7',
  content: ['includeTitlePage'],
  template: null,
  isbn: null,
}

const contentOrder = ['includeCoverPage', 'includeTitlePage']

const sanitizeProfileData = input => {
  const res = { ...input }
  if (res.format === 'epub') res.trimSize = null
  return res
}

const getFormatTarget = format => (format === 'pdf' ? 'pagedjs' : format)

const sanitizeOptionData = data => {
  const d = { ...data }
  d.content =
    d.format !== 'web'
      ? d.content.sort(
          (a, b) => contentOrder.indexOf(a) - contentOrder.indexOf(b),
        )
      : null

  d.includePdf = !!d.includePdf
  d.includeEpub = !!d.includeEpub
  return d
}

const optionKeys = [
  'format',
  'size',
  'content',
  'template',
  'isbn',
  'includePdf',
  'includeEpub',
  'pdfProfileId',
  'epubProfileId',
  'customHeader',
  'customFooter',
]

const getProfileExportOptions = profile => {
  const p = pick(profile, optionKeys)
  return sanitizeOptionData(p)
}

const chooseZoom = screenWidth => {
  if (screenWidth <= 1600 && screenWidth >= 1470) return 0.8
  if (screenWidth <= 1469 && screenWidth >= 1281) return 0.6
  if (screenWidth <= 1280) return 0.5
  return 1.0
}
// #endregion helpers

const PreviewerPage = ({ bookId }) => {
  // #region init
  const params = useParams()
  const history = useHistory()
  const { bookComponentId } = params
  const { currentUser } = useCurrentUser()
  const [previewLink, setPreviewLink] = useState(null)
  const [creatingPreview, setCreatingPreview] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [activeTabKey, setActiveTabKey] = useState('new')

  const { ydoc } = useContext(YjsContext)

  const [updateContent] = useMutation(UPDATE_BOOK_COMPONENT_CONTENT)

  React.useEffect(() => {
    if (!localStorage.getItem('zoomPercentage')) {
      localStorage.setItem('zoomPercentage', chooseZoom(window.innerWidth))
    }

    if (!localStorage.getItem('pageSpread')) {
      localStorage.setItem('pageSpread', 'single')
    }
  }, [])
  // #endregion init

  // #region queries
  const {
    data: profilesData,
    loading: profilesLoading,
    refetch: refetchProfiles,
  } = useQuery(GET_EXPORT_PROFILES, {
    fetchPolicy: 'network-only',
    variables: {
      bookId,
    },
  })

  const {
    data: book,
    loading: bookLoading,
    error,
  } = useQuery(GET_BOOK_COMPONENT_IDS, {
    variables: {
      bookId,
    },
  })

  const { data: { getBook: { webPublishInfo } = {} } = {} } = useQuery(
    GET_BOOK_WEB_PUBLISH_INFO,
    {
      variables: {
        id: bookId,
      },
    },
  )

  const { data: { getApplicationParameters } = {}, loading: paramsLoading } =
    useQuery(APPLICATION_PARAMETERS, {
      onCompleted: ({ getApplicationParameters: applicationParams }) => {
        const exportsConfig = applicationParams?.find(
          p => p.area === 'exportsConfig',
        ).config

        if (!exportsConfig.pdfDownload.enabled) {
          if (exportsConfig.epubDownload.enabled) {
            defaultProfile.format = 'epub'
            defaultProfile.size = null
          } else if (exportsConfig.webPublish.enabled) {
            defaultProfile.format = 'web'
            defaultProfile.size = null
          } else {
            defaultProfile.format = 'Preview disabled'
          }
        }

        setNewProfileOptions({
          ...newProfileOptions,
          includePdf: exportsConfig.webPdfDownload?.enabled,
          includeEpub: exportsConfig.webEpubDownload?.enabled,
        })
      },
    })

  const {
    data: templatesData,
    loading: templatesLoading,
    refetch: refetchTemplates,
  } = useQuery(GET_SPECIFIC_TEMPLATES, {
    fetchPolicy: 'network-only',
    skip: !getApplicationParameters,
    variables: {
      where: {
        target: getFormatTarget(defaultProfile.format),
        trimSize: defaultProfile.size,
      },
    },
  })

  const [getPagedLink, { loading: previewIsLoading }] = useLazyQuery(
    GET_PAGED_PREVIEWER_LINK,
    {
      onCompleted: ({ getPagedPreviewerLink: { link } }) => {
        setPreviewLink(link)
      },
    },
  )

  const [createPreview, { called: createPreviewCalled }] = useMutation(
    EXPORT_BOOK,
    {
      onCompleted: ({ exportBook }, { variables: { input } }) => {
        const { path } = exportBook
        const hash = path.split('/')

        const previewerOptions = {
          ...(localStorage.getItem('pageSpread') &&
            localStorage.getItem('pageSpread') === 'double' && {
              doublePageSpread: true,
            }),
          ...(localStorage.getItem('zoomPercentage') &&
            parseFloat(localStorage.getItem('zoomPercentage')) !== 1.0 && {
              zoomPercentage: parseFloat(
                localStorage.getItem('zoomPercentage'),
              ),
            }),
        }

        if (input.previewer === 'web') {
          // preview the url returned by the server
          setPreviewLink(path)
        } else {
          getPagedLink({
            variables: {
              hash: hash[0],
              previewerOptions,
            },
          })
        }

        setCreatingPreview(false)
      },
      onError: (previewError, { variables }) => {
        if (variables.input.previewer === 'web') {
          const code = previewError.message.substring(
            previewError.message.length - 3,
          )

          setCreatingPreview(true)

          showFlaxPreviewErrorModal(code, () => {
            setPreviewLink(null)
            setCreatingPreview(false)
          })
        }
      },
    },
  )

  const [createProfile] = useMutation(CREATE_EXPORT_PROFILE, {
    refetchQueries: [
      {
        query: GET_EXPORT_PROFILES,
        variables: { bookId },
      },
    ],
    awaitRefetchQueries: true,
    onCompleted: res => {
      const created = res.createExportProfile
      const { id, includedComponents } = created
      setSelectedProfile(id)

      setCurrentOptions({
        format: created.format,
        size: created.trimSize,
        content:
          created.format !== 'web'
            ? Array.from(Object.keys(includedComponents))
                .map(e => {
                  if (includedComponents[e]) {
                    switch (e) {
                      case 'titlePage':
                        return 'includeTitlePage'
                      case 'cover':
                        return 'includeCoverPage'
                      default:
                        return false
                    }
                  }

                  return false
                })
                .filter(e => !!e)
                .sort(
                  (a, b) => contentOrder.indexOf(a) - contentOrder.indexOf(b),
                )
            : null,
        isbn: created.isbn,
        template: created.templateId,
        includePdf: created.downloadableAssets.pdf,
        includeEpub: created.downloadableAssets.epub,
        pdfProfileId: created.downloadableAssets.pdfProfileId,
        epubProfileId: created.downloadableAssets.epubProfileId,
        customHeader: created.runningBlocks.customHeader,
        customFooter: created.runningBlocks.customFooter,
      })

      setActiveTabKey('saved')
    },
  })

  const [renameProfile] = useMutation(RENAME_EXPORT_PROFILE)

  const [updateProfileOptions] = useMutation(UPDATE_EXPORT_PROFILE_OPTIONS, {
    refetchQueries: [
      {
        query: GET_EXPORT_PROFILES,
        variables: { bookId },
      },
    ],
  })

  const [deleteProfile] = useMutation(DELETE_EXPORT_PROFILE, {
    refetchQueries: [
      {
        query: GET_EXPORT_PROFILES,
        variables: { bookId },
      },
    ],
  })

  const [download] = useMutation(EXPORT_BOOK, {
    onCompleted: ({ exportBook }, { variables: { input } }) => {
      const { fileExtension } = input
      const { path } = exportBook

      if (fileExtension === 'epub') return window.location.replace(path)
      return window.open(path, '_blank', 'noreferrer')
    },
  })

  const [publish, { loading: publishing }] = useMutation(PUBLISH_ONLINE, {
    onCompleted: ({ publishOnline }) => {
      const { path } = publishOnline

      return window.open(path, '_blank', 'noreferrer')
    },
    onError: publishingError => {
      const code = publishingError.message.substring(
        publishingError.message.length - 3,
      )

      showFlaxPublishErrorModal(code)
    },
    refetchQueries: [
      {
        query: GET_BOOK_WEB_PUBLISH_INFO,
        variables: { id: bookId },
      },
    ],
  })

  const [unpublish, { loading: unpublishing }] = useMutation(UNPUBLISH_ONLINE, {
    refetchQueries: [
      {
        query: GET_BOOK_WEB_PUBLISH_INFO,
        variables: { id: bookId },
      },
    ],
  })

  const [uploadToLulu] = useMutation(UPLOAD_TO_LULU)

  useSubscription(BOOK_UPDATED_SUBSCRIPTION, {
    variables: { id: bookId },
    fetchPolicy: 'network-only',
    onData: () => {
      refetchProfiles({ id: bookId })
    },
  })
  // #endregion queries

  // #region handlers
  const getLuluConfigValue = value => {
    const config = getApplicationParameters?.find(
      p => p.area === 'integrations',
    ).config.lulu

    return config && config[value]
  }

  const handleConnectToLulu = () => {
    const baseLuluURL = getLuluConfigValue('loginUrl')
    const clientId = getLuluConfigValue('clientId')
    const redirectURL = getLuluConfigValue('redirectUri')
    const encodedRedirectURL = encodeURIComponent(redirectURL)
    const luluURLParams = `?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectURL}`

    window.open(`${baseLuluURL}${luluURLParams}`, null, 'width=600, height=600')
  }

  const handleSendToLulu = () => {
    return uploadToLulu({
      variables: { id: selectedProfile },
    })
  }

  const handleCreateProfile = displayName => {
    const {
      size: trimSize,
      format,
      content,
      template: templateId,
      isbn,
      includeEpub,
      includePdf,
      pdfProfileId,
      epubProfileId,
      customHeader,
      customFooter,
    } = newProfileOptions
    // } = activeTabKey === 'saved' ? currentOptions : newProfileOptions

    const data = {
      bookId,
      displayName,
      format,
      includedComponents: {
        toc: content?.includes('includeTOC') || false,
        copyright: content?.includes('includeCopyrights') || false,
        titlePage: content?.includes('includeTitlePage') || false,
        cover: content?.includes('includeCoverPage') || false,
      },
      templateId,
      trimSize,
      isbn,
      downloadableAssets: {
        epub: includeEpub,
        pdf: includePdf,
        pdfProfileId,
        epubProfileId,
      },
      runningBlocks: {
        customHeader,
        customFooter,
      },
    }

    return createProfile({
      variables: {
        input: sanitizeProfileData(data),
      },
    })
  }

  // TODO: fix this, differentiate between currentOptions and newProfileOptions
  const handleDeleteProfile = () => {
    setSelectedProfile(defaultProfile.value)

    const defaultTemplate = templatesData?.getSpecificTemplates.find(
      t => t.default,
    )

    setCurrentOptions({
      ...currentOptions,
      ...getProfileExportOptions({
        ...defaultProfile,
        template: defaultTemplate.id,
      }),
    })

    return deleteProfile({
      variables: {
        id: selectedProfile,
      },
    })
  }

  const handleRenameProfile = (id, newName) => {
    return renameProfile({
      variables: {
        id,
        displayName: newName,
      },
    })
  }

  const handleUpdateProfileOptions = () => {
    const {
      size: trimSize,
      format,
      content,
      template: templateId,
      isbn,
      includePdf,
      includeEpub,
      pdfProfileId,
      epubProfileId,
      customHeader,
      customFooter,
    } = activeTabKey === 'saved' ? currentOptions : newProfileOptions

    const data = {
      format,
      includedComponents: {
        toc: !!content?.includes('includeTOC'),
        copyright: !!content?.includes('includeCopyrights'),
        titlePage: !!content?.includes('includeTitlePage'),
        cover: !!content?.includes('includeCoverPage'),
      },
      templateId,
      trimSize,
      isbn,
      downloadableAssets: {
        pdf: includePdf,
        epub: includeEpub,
        pdfProfileId: includePdf ? pdfProfileId : null,
        epubProfileId: includeEpub ? epubProfileId : null,
      },
      runningBlocks: {
        customHeader,
        customFooter,
      },
    }

    return updateProfileOptions({
      variables: {
        id: selectedProfile,
        input: sanitizeProfileData(data),
      },
    })
  }

  const handleDownload = () => {
    const { format, template, content, isbn } =
      activeTabKey === 'saved' ? currentOptions : newProfileOptions

    return download({
      variables: {
        input: {
          bookId,
          bookComponentId,
          templateId: template,
          fileExtension: format,
          additionalExportOptions: {
            includeTOC: content.includes('includeTOC'),
            includeCopyrights: content.includes('includeCopyrights'),
            includeTitlePage: content.includes('includeTitlePage'),
            includeCoverPage: content.includes('includeCoverPage'),
            isbn,
          },
        },
      },
    })
  }

  const handlePublish = () => {
    const {
      template,
      includePdf,
      includeEpub,
      pdfProfileId,
      epubProfileId,
      customHeader,
      customFooter,
    } = currentOptions

    return publish({
      variables: {
        input: {
          bookId,
          bookComponentId,
          templateId: template,
          additionalExportOptions: {
            includePdf,
            includeEpub,
            pdfProfileId,
            epubProfileId,
            customHeader,
            customFooter,
          },
        },
        profileId: selectedProfile,
      },
    })
  }

  const handleUnpublish = () => {
    return unpublish({
      variables: {
        bookId,
      },
    })
  }

  const handleCreatePreview = async (templates, options, target) => {
    const newTemplates = templates

    const optionsToApply = { ...options }

    const existingTemplateStillThere = newTemplates.find(
      t => t.id === options.template,
    )

    if (!existingTemplateStillThere) {
      const newTemplateWithSameName = newTemplates.find(
        t => t.name.toLowerCase() === selectedTemplate.name.toLowerCase(),
      )

      const newDefaultTemplate = newTemplates.find(t => t.default)

      const templateToApply =
        newTemplateWithSameName || newDefaultTemplate || null

      optionsToApply.template = templateToApply?.id || null
      setSelectedTemplate(templateToApply)
    } else if (selectedTemplate.id !== optionsToApply.template) {
      const newTemplate = newTemplates.find(
        t => t.id === optionsToApply.template,
      )

      setSelectedTemplate(newTemplate)
    }

    if (options.zoom) localStorage.setItem('zoomPercentage', options.zoom)
    if (options.spread) localStorage.setItem('pageSpread', options.spread)

    const previewData = {
      bookId,
      bookComponentId,
      previewer: target,
      templateId: optionsToApply.template,
      additionalExportOptions: {
        ...(target === 'web'
          ? {
              includePdf: options.includePdf,
              includeEpub: options.includeEpub,
              customHeader: options.customHeader,
              customFooter: options.customFooter,
            }
          : {
              includeTOC: options.content.includes('includeTOC'),
              includeCopyrights: options.content.includes('includeCopyrights'),
              includeTitlePage: options.content.includes('includeTitlePage'),
              includeCoverPage: options.content.includes('includeCoverPage'),
            }),
      },
    }

    if (activeTabKey === 'saved') {
      setCurrentOptions({
        ...currentOptions,
        ...getProfileExportOptions(optionsToApply),
        zoom: options.zoom,
        spread: options.spread,
        includePdf: options.includePdf,
        includeEpub: options.includeEpub,
        pdfProfileId: options.pdfProfileId,
        epubProfileId: options.epubProfileId,
        customHeader: options.customHeader,
        customFooter: options.customFooter,
      })
    } else {
      setNewProfileOptions({
        ...newProfileOptions,
        ...getProfileExportOptions(optionsToApply),
        zoom: options.zoom,
        spread: options.spread,
        includePdf: options.includePdf,
        includeEpub: options.includeEpub,
        pdfProfileId: options.pdfProfileId,
        epubProfileId: options.epubProfileId,
        customHeader: options.customHeader,
        customFooter: options.customFooter,
      })
    }

    if ((target === 'pagedjs' || target === 'web') && !previewIsLoading) {
      if (ydoc) {
        const content = ydoc.getText('html').toString()
        
        await updateContent({
          variables: {
            input: {
              id: bookComponentId,
              content,
            },
          },
        })
      }

      createPreview({
        variables: {
          input: previewData,
        },
      })
    } else {
      setCreatingPreview(false)
    }
  }

  const handleRefetchTemplates = options => {
    const templateTarget = getFormatTarget(options.format)
    const templateTrimSize = templateTarget === 'pagedjs' ? options.size : null

    setCreatingPreview(true)

    refetchTemplates({
      where: {
        target: templateTarget,
        trimSize: templateTrimSize,
      },
    }).then(res => {
      handleCreatePreview(
        res.data.getSpecificTemplates,
        options,
        templateTarget,
      )
    })
  }

  const handleOptionsChange = newOptions => {
    const current =
      activeTabKey === 'saved' ? currentOptions : newProfileOptions

    const options = { ...current, ...newOptions }

    if (options.format === 'pdf' && !options.size) {
      options.size = defaultProfile.size
    }

    if (options.format === 'epub' || options.format === 'web') {
      options.size = null
    }

    if (options.format === 'web') {
      options.content = null
    }

    if (activeTabKey === 'new' && newProfileOptions.format !== options.format) {
      if (options.format === 'epub') {
        options.content = [...contentOrder]
      } else if (options.format === 'pdf') {
        options.content = [...contentOrder].splice(1, 3)
      }
    }

    if (isEqual(current, options)) return

    if (options.format === 'web' && current.format === 'web') {
      setCreatingPreview(true)

      handleCreatePreview(templatesData.getSpecificTemplates, options, 'web')
    } else {
      handleRefetchTemplates(options)
    }
  }

  const handleProfileChange = profileId => {
    setSelectedProfile(profileId)
    // localStorage.setItem(`exportProfileId-${bookId}`, profileId)

    if (profileId) {
      const newProfile = [defaultProfileWithTemplate, ...profiles].find(
        p => p.value === profileId,
      )

      handleOptionsChange(getProfileExportOptions(newProfile))
    }
  }

  const handleTabChange = activeKey => {
    if (activeKey) {
      setActiveTabKey(activeKey)
    }
  }
  // #endregion handlers

  // #region data wrangling

  const luluConfig = getApplicationParameters?.find(
    p => p.area === 'integrations',
  ).config.lulu

  const exportsConfig = getApplicationParameters?.find(
    p => p.area === 'exportsConfig',
  ).config

  const luluIdentity = currentUser?.identities?.find(
    id => id.provider === 'lulu',
  )

  const isUserConnectedToLulu =
    luluIdentity && luluIdentity.hasValidRefreshToken

  const storedZoom = localStorage.getItem('zoomPercentage')
  const initialZoom = storedZoom ? parseFloat(storedZoom) : 1

  const storedSpread = localStorage.getItem('pageSpread')
  const initialSpread = storedSpread || undefined

  const sortedTemplates = sortBy(
    templatesData?.getSpecificTemplates,
    i => !i.default,
  )

  const templates =
    sortedTemplates.length > 0
      ? sortedTemplates.map(t => {
          return {
            id: t.id,
            imageUrl: t.thumbnail?.url,
            name: t.name,
          }
        })
      : undefined

  const defaultTemplate =
    templatesData?.getSpecificTemplates.find(t => t.default) ||
    templatesData?.getSpecificTemplates[0]

  const defaultProfileWithTemplate = {
    ...defaultProfile,
    template: defaultTemplate?.id,
  }

  const [selectedProfile, setSelectedProfile] = useState()

  const [newProfileOptions, setNewProfileOptions] = useState({
    ...getProfileExportOptions(defaultProfileWithTemplate),
    zoom: initialZoom,
    spread: initialSpread,
  })

  const [currentOptions, setCurrentOptions] = useState({
    ...getProfileExportOptions(defaultProfileWithTemplate),
    zoom: initialZoom,
    spread: initialSpread,
  })

  // initial preview
  React.useEffect(() => {
    if (!bookLoading && !error) {
      if (!selectedTemplate && !createPreviewCalled) {
        setSelectedTemplate(defaultTemplate)
      }

      if (templatesData && selectedTemplate && !createPreviewCalled) {
        // const options =
        //   activeTabKey === 'saved' ? currentOptions : newProfileOptions

        const options = {
          ...getProfileExportOptions(defaultProfileWithTemplate),
          zoom: initialZoom,
          spread: initialSpread,
        }

        handleCreatePreview(
          templatesData.getSpecificTemplates,
          options,
          getFormatTarget(options.format),
        )
      }
    }
  }, [templatesData, selectedTemplate, bookLoading, error])

  const isbns = (book?.getBook?.podMetadata?.isbns || []).map(item => {
    return { isbn: item?.isbn, label: item?.label }
  })

  const hasCover = book?.getBook?.cover && book.getBook.cover[0].coverUrl

  const profiles =
    getApplicationParameters &&
    exportsConfig &&
    profilesData?.getBookExportProfiles.result
      .map(p => {
        const luluProfile = p.providerInfo.find(x => x.providerLabel === 'lulu')
        const projectId = luluProfile ? luluProfile.externalProjectId : null

        const luluProjectUrl = projectId
          ? `${getLuluConfigValue('projectBaseUrl')}/${projectId}`
          : null

        const content = []

        if (p.includedComponents.copyright) content.push('includeCopyrights')
        if (p.includedComponents.titlePage) content.push('includeTitlePage')
        if (p.includedComponents.toc) content.push('includeTOC')
        if (p.includedComponents.cover) content.push('includeCoverPage')

        return {
          updated: p.updated,
          format: p.format,
          content: p.format !== 'web' ? content : null,
          label: p.displayName,
          lastSynced: luluProfile ? luluProfile.lastSync : null,
          projectId,
          projectUrl: luluProjectUrl,
          size: p.format === 'pdf' ? p.trimSize : null,
          synced: luluProfile ? luluProfile.inSync : null,
          template: p.templateId,
          value: p.id,
          // Require that p.isbn is a valid option from podMetadata.isbns
          isbn: p.isbn && isbns.find(i => i.isbn === p.isbn) ? p.isbn : null,
          includePdf: !!p.downloadableAssets?.pdf,
          includeEpub: !!p.downloadableAssets?.epub,
          pdfProfileId: p.downloadableAssets?.pdfProfileId,
          epubProfileId: p.downloadableAssets?.epubProfileId,
          customHeader: p.runningBlocks?.customHeader,
          customFooter: p.runningBlocks?.customFooter,
        }
      })
      .filter(p => {
        switch (p.format) {
          case 'pdf':
            return exportsConfig.pdfDownload.enabled
          case 'epub':
            return exportsConfig.epubDownload.enabled
          case 'web':
            return exportsConfig.webPublish.enabled
          default:
            return false
        }
      })

  const allProfiles = profiles // && [defaultProfileWithTemplate, ...profiles]

  const userIsOwner = isOwner(bookId, currentUser)
  const canEdit = hasEditAccess(bookId, currentUser)
  // #endregion data wrangling

  if (
    templatesLoading ||
    profilesLoading ||
    !currentUser ||
    paramsLoading ||
    bookLoading
  ) {
    return <StyledSpin spinning />
  }

  if (!bookLoading && error?.message?.includes('does not exist')) {
    showErrorModal(() => history.push('/dashboard'))
  }

  if (!bookLoading && error?.message?.includes('has been deleted')) {
    showDeletedBookModal(() => history.push('/dashboard'))
  }

  return (
    <Preview
      activeTabKey={activeTabKey}
      canModify={userIsOwner || canEdit}
      canUploadToProvider={luluConfig && !luluConfig?.disabled && userIsOwner}
      connectToLulu={handleConnectToLulu}
      createProfile={handleCreateProfile}
      currentOptions={currentOptions}
      defaultProfile={defaultProfileWithTemplate}
      deleteProfile={handleDeleteProfile}
      download={handleDownload}
      exportsConfig={exportsConfig}
      hasCover={!!hasCover}
      isbns={isbns}
      isUserConnectedToLulu={isUserConnectedToLulu}
      loadingExport={false}
      loadingPreview={creatingPreview}
      luluConfig={luluConfig}
      newProfileOptions={newProfileOptions}
      // onCustomHTMLChanges={onCustomHTMLChanges}
      onOptionsChange={handleOptionsChange}
      onProfileChange={handleProfileChange}
      onPublish={userIsOwner ? handlePublish : null}
      onUnpublish={userIsOwner ? handleUnpublish : null}
      previewLink={previewLink}
      profiles={allProfiles}
      publishing={publishing}
      renameProfile={handleRenameProfile}
      selectedProfile={selectedProfile}
      sendToLulu={handleSendToLulu}
      setActiveTabKey={handleTabChange}
      templates={templates}
      unpublishing={unpublishing}
      updateProfileOptions={handleUpdateProfileOptions}
      webPublishInfo={webPublishInfo}
    />
  )
}

/* eslint-disable-next-line func-names, react/function-component-definition */
export default function (props) {
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

  return <PreviewerPage {...props} bookId={book.id} />
}
