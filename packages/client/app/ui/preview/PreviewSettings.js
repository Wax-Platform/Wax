/* stylelint-disable no-descending-specificity, string-quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import pick from 'lodash/pick'
import { isEqualWith, isNil } from 'lodash'
import { VerticalAlignTopOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { grid, th } from '@coko/client'
import { Button, Stack, TabsStyled as Tabs } from '../common'
import NewProfileTab from './NewProfileTab'
import SavedProfilesTab from './SavedProfilesTab'

// #region styled
const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0 ${grid(4)};

  > :nth-child(2) {
    background-color: ${th('colorBackground')};
    padding-block-start: ${grid(2)};
    z-index: 2;

    button {
      width: 34px;
    }
  }
`

const StyledTabs = styled(Tabs)`
  width: 500px;

  .ant-tabs-nav {
    padding-inline: 0;
  }

  &[data-collapsed='true'] {
    .ant-tabs-nav,
    .ant-tabs-content-holder {
      overflow: hidden;
      width: 0;
    }
  }

  .ant-tabs-content {
    position: unset;
  }

  .ant-tabs-content,
  [role='tabpanel'] {
    height: 100%;
  }
`

const StyledStack = styled(Stack)`
  --space: 1em;
`

const CollapseArrow = styled(VerticalAlignTopOutlined)`
  transform: ${props =>
    props.$isCollapsed ? 'rotate(270deg)' : 'rotate(90deg)'};
  transition: transform 0.3s ease-out;
`
// #endregion styled

// #region helpoers
const selectKeys = ['label', 'value']

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

const contentOrder = [
  'includeCoverPage',
  'includeTitlePage',
  // 'includeCopyrights',
  // 'includeTOC',
]

const getProfileSelectOptions = profile => pick(profile, selectKeys)

const sanitizeOptionData = data => {
  const d = { ...data }
  d.content =
    d.content?.sort(
      (a, b) => contentOrder.indexOf(a) - contentOrder.indexOf(b),
    ) || null

  return d
}

const getProfileExportOptions = profile => {
  const p = pick(profile, optionKeys)
  if (p.content === undefined) p.content = null
  return sanitizeOptionData(p)
}
// #endregion helpers

const PreviewSettings = props => {
  const {
    createProfile,
    currentOptions,
    newOptions,
    deleteProfile,
    download,
    isCollapsed,
    canModify,
    canUploadToProvider,
    isUserConnectedToLulu,
    loadingPreview,
    luluConfig,
    onClickCollapse,
    onClickConnectToLulu,
    onOptionsChange,
    onProfileChange,
    optionsDisabled,
    profiles,
    renameProfile,
    selectedProfile,
    sendToLulu,
    templates,
    isbns,
    updateProfileOptions,
    activeTabKey,
    setActiveTabKey,
    exportsConfig,
    onPublish,
    publishing,
    onUnpublish,
    webPublishInfo,
    hasCover,
  } = props

  const { t } = useTranslation(null, {
    keyPrefix: 'pages.previewAndPublish.sections.tabs',
  })

  // #region functions
  const findProfile = profileValue => {
    return profiles?.find(p => p.value === profileValue)
  }

  const handleProfileChange = val => {
    onProfileChange(val)
  }

  const handleOptionsChange = vals => {
    const sanitized = sanitizeOptionData({
      ...currentOptions,
      ...vals,
    })

    onOptionsChange(sanitized)
  }

  const handleClickCollapse = () => {
    onClickCollapse(!isCollapsed)
  }

  const handleFormatChange = format => {
    if (optionsDisabled) return // handle here to prevent flashing
    handleOptionsChange({ format })
  }
  // #endregion functions

  // #region data wrangling
  const fullSelectedProfile = findProfile(selectedProfile) || {}

  const selectedProfileSelectOption =
    getProfileSelectOptions(fullSelectedProfile)

  const selectedProfileExportOptions =
    getProfileExportOptions(fullSelectedProfile)

  const { lastSynced, projectId, projectUrl, synced } = fullSelectedProfile
  const isProfileSyncedWithLulu = synced

  const hasChanges = !isEqualWith(
    selectedProfileExportOptions,
    currentOptions,
    (a, b) => {
      if (isNil(a) && isNil(b)) {
        return true
      }

      return undefined
    },
  )
  // #endregion data wrangling

  return (
    <Wrapper>
      <StyledTabs
        activeKey={activeTabKey}
        data-collapsed={isCollapsed}
        destroyInactiveTabPane
        items={[
          {
            label: t('newPreview.title'),
            key: 'new',
            children: (
              <StyledStack>
                <NewProfileTab
                  canModify={canModify}
                  createProfile={createProfile}
                  exportsConfig={exportsConfig}
                  handleFormatChange={handleFormatChange}
                  handleOptionsChange={handleOptionsChange}
                  hasCover={hasCover}
                  isbns={isbns}
                  isCollapsed={isCollapsed}
                  isNewProfileSelected
                  loadingPreview={loadingPreview}
                  newProfileOptions={newOptions}
                  onClickDownload={download}
                  optionsDisabled={optionsDisabled}
                  profiles={profiles}
                  templates={templates}
                  updateProfileOptions={updateProfileOptions}
                  // updateLoading={updateLoading}
                />
              </StyledStack>
            ),
          },
          {
            label: t('publishingProfiles.title'),
            key: 'saved',
            children: (
              <StyledStack>
                <SavedProfilesTab
                  canModify={canModify}
                  canUploadToProvider={canUploadToProvider}
                  createProfile={createProfile}
                  currentOptions={currentOptions}
                  exportsConfig={exportsConfig}
                  handleOptionsChange={handleOptionsChange}
                  handleProfileChange={handleProfileChange}
                  hasChanges={hasChanges}
                  hasCover={hasCover}
                  isbns={isbns}
                  isCollapsed={isCollapsed}
                  isProfileSyncedWithLulu={isProfileSyncedWithLulu}
                  isUserConnectedToLulu={isUserConnectedToLulu}
                  lastSynced={lastSynced}
                  loadingPreview={loadingPreview}
                  luluConfig={luluConfig}
                  onClickConnectToLulu={onClickConnectToLulu}
                  onClickDelete={deleteProfile}
                  onClickDownload={download}
                  onPublish={onPublish}
                  onUnpublish={onUnpublish}
                  optionsDisabled={optionsDisabled}
                  profiles={profiles}
                  projectId={projectId}
                  projectUrl={projectUrl}
                  publishing={publishing}
                  renameProfile={renameProfile}
                  selectedProfile={selectedProfile}
                  selectedProfileLastUpdated={fullSelectedProfile.updated}
                  selectedProfileSelectOption={selectedProfileSelectOption}
                  sendToLulu={sendToLulu}
                  templates={templates}
                  updateProfileOptions={updateProfileOptions}
                  webPublishInfo={webPublishInfo}
                />
              </StyledStack>
            ),
          },
        ]}
        onChange={setActiveTabKey}
      />
      <div>
        <Button
          aria-label={t('collapse')}
          icon={<CollapseArrow $isCollapsed={isCollapsed} />}
          onClick={handleClickCollapse}
          type="text"
        />
      </div>
    </Wrapper>
  )
}

PreviewSettings.propTypes = {
  createProfile: PropTypes.func.isRequired,
  currentOptions: PropTypes.shape({
    format: PropTypes.oneOf(['pdf', 'epub', 'web']),
    size: PropTypes.oneOf(['8.5x11', '6x9', '5.5x8.5']),
    content: PropTypes.arrayOf(
      PropTypes.oneOf([
        'includeTitlePage',
        // 'includeCopyrights',
        // 'includeTOC',
        'includeCoverPage',
      ]),
    ),
    template: PropTypes.string,
    isbn: PropTypes.string,
    spread: PropTypes.oneOf(['single', 'double']),
    zoom: PropTypes.number,
  }).isRequired,
  newOptions: PropTypes.shape({
    format: PropTypes.oneOf(['pdf', 'epub', 'web']),
    size: PropTypes.oneOf(['8.5x11', '6x9', '5.5x8.5']),
    content: PropTypes.arrayOf(
      PropTypes.oneOf([
        'includeTitlePage',
        // 'includeCopyrights',
        // 'includeTOC',
        'includeCoverPage',
      ]),
    ),
    template: PropTypes.string,
    isbn: PropTypes.string,
    spread: PropTypes.oneOf(['single', 'double']),
    zoom: PropTypes.number,
  }).isRequired,
  deleteProfile: PropTypes.func.isRequired,
  defaultProfile: PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    format: PropTypes.oneOf(['pdf', 'epub', 'web']),
    size: PropTypes.oneOf(['8.5x11', '6x9', '5.5x8.5']),
    content: PropTypes.arrayOf(PropTypes.oneOf(['includeTitlePage'])),
    template: PropTypes.string,
    isbn: PropTypes.string,
  }).isRequired,
  download: PropTypes.func.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  canModify: PropTypes.bool.isRequired,
  canUploadToProvider: PropTypes.bool.isRequired,
  isUserConnectedToLulu: PropTypes.bool.isRequired,
  loadingPreview: PropTypes.bool.isRequired,
  luluConfig: PropTypes.shape(),
  onClickCollapse: PropTypes.func.isRequired,
  onClickConnectToLulu: PropTypes.func.isRequired,
  onOptionsChange: PropTypes.func.isRequired,
  // onProfileChange: PropTypes.func.isRequired,
  optionsDisabled: PropTypes.bool.isRequired,
  profiles: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      format: PropTypes.string.isRequired,
      size: PropTypes.string,
      content: PropTypes.arrayOf(PropTypes.string),
      template: PropTypes.string,
      synced: PropTypes.bool,
      lastSynced: PropTypes.string,
      projectId: PropTypes.string,
      projectUrl: PropTypes.string,
    }),
  ).isRequired,
  // renameProfile: PropTypes.func.isRequired,
  selectedProfile: PropTypes.string,
  sendToLulu: PropTypes.func.isRequired,
  templates: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      imageUrl: PropTypes.string,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  isbns: PropTypes.arrayOf(
    PropTypes.shape({
      isbn: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  updateProfileOptions: PropTypes.func.isRequired,
  onPublish: PropTypes.func,
  publishing: PropTypes.bool,
  webPublishInfo: PropTypes.shape(),
  onUnpublish: PropTypes.func,
}

PreviewSettings.defaultProps = {
  selectedProfile: null,
  luluConfig: null,
  onPublish: null,
  publishing: false,
  onUnpublish: null,
  webPublishInfo: null,
}

export default PreviewSettings
