import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { Page, Spin } from '../common'

import PreviewDisplay from './PreviewDisplay'
import PreviewSettings from './PreviewSettings'

// #region styled
const Wrapper = styled.div`
  display: flex;
  height: 100%;
  overflow-y: hidden;

  > div {
    transition: width 0.3s;
  }

  > div:first-child {
    border-right: 2px solid gainsboro;
    flex-grow: 1;
  }

  > div:last-child {
    min-width: 50px;
    width: ${({ $showSettings }) => ($showSettings ? '550px' : '0')};
  }
`

const StyledSpin = styled(Spin)`
  /* stylelint-disable-next-line declaration-no-important */
  max-height: 80% !important;
`

// #endregion styled

const Preview = props => {
  const {
    activeTabKey,
    setActiveTabKey,
    connectToLulu,
    createProfile,
    currentOptions,
    newProfileOptions,
    deleteProfile,
    defaultProfile,
    download,
    canModify,
    canUploadToProvider,
    isUserConnectedToLulu,
    loadingExport,
    loadingPreview,
    luluConfig,
    onOptionsChange,
    onProfileChange,
    previewLink,
    profiles,
    renameProfile,
    selectedProfile,
    sendToLulu,
    templates,
    isbns,
    updateProfileOptions,
    exportsConfig,
    onPublish,
    publishing,
    onUnpublish,
    webPublishInfo,
    hasCover,
  } = props

  const [showSettings, setShowSettings] = useState(true)

  const handleClickCollapse = () => {
    setShowSettings(!showSettings)
  }

  const handleOptionsChange = newOptions => {
    onOptionsChange(newOptions)
  }

  const options = activeTabKey === 'saved' ? currentOptions : newProfileOptions

  const { spread, zoom, ...exportOptions } = options

  console.log(loadingPreview, previewLink , 'preview')
  return (
    <Page>
      <Wrapper $showSettings={showSettings}>
        <StyledSpin spinning={previewLink === null}>
          <PreviewDisplay
            isEpub={options.format === 'epub'}
            isPdf={options.format === 'pdf'}
            loading={loadingPreview}
            noPreview={!loadingPreview && !previewLink}
            onOptionsChange={handleOptionsChange}
            previewLink={previewLink}
            spread={spread}
            zoom={zoom}
          />
        </StyledSpin>

        <PreviewSettings
          activeTabKey={activeTabKey}
          canModify={canModify}
          canUploadToProvider={canUploadToProvider}
          createProfile={createProfile}
          currentOptions={exportOptions}
          defaultProfile={defaultProfile}
          deleteProfile={deleteProfile}
          download={download}
          exportsConfig={exportsConfig}
          hasCover={hasCover}
          isbns={isbns}
          isCollapsed={!showSettings}
          isUserConnectedToLulu={isUserConnectedToLulu}
          loadingPreview={loadingPreview}
          luluConfig={luluConfig}
          newOptions={newProfileOptions}
          onClickCollapse={handleClickCollapse}
          onClickConnectToLulu={connectToLulu}
          onOptionsChange={handleOptionsChange}
          onProfileChange={onProfileChange}
          onPublish={onPublish}
          onUnpublish={onUnpublish}
          optionsDisabled={loadingExport || loadingPreview}
          profiles={profiles}
          publishing={publishing}
          renameProfile={renameProfile}
          selectedProfile={selectedProfile}
          sendToLulu={sendToLulu}
          setActiveTabKey={setActiveTabKey}
          templates={templates}
          updateProfileOptions={updateProfileOptions}
          webPublishInfo={webPublishInfo}
        />
      </Wrapper>
    </Page>
  )
}

Preview.propTypes = {
  activeTabKey: PropTypes.string.isRequired,
  setActiveTabKey: PropTypes.func.isRequired,
  connectToLulu: PropTypes.func.isRequired,
  createProfile: PropTypes.func.isRequired,
  currentOptions: PropTypes.shape({
    format: PropTypes.oneOf(['pdf', 'web']),
    size: PropTypes.oneOf(['8.5x11', '6x9', '5.5x8.5','5.8x8.3','8.3x11.7']),
    content: PropTypes.arrayOf(
      PropTypes.oneOf([
        'includeTitlePage',
        // 'includeCopyrights',
        // 'includeTOC',
        'includeCoverPage',
      ]),
    ),
    template: PropTypes.string,
    spread: PropTypes.oneOf(['single', 'double']),
    zoom: PropTypes.number,
  }).isRequired,
  newProfileOptions: PropTypes.shape({
    format: PropTypes.oneOf(['pdf', 'epub', 'web']),
    size: PropTypes.oneOf(['8.5x11', '6x9', '5.5x8.5','5.8x8.3','8.3x11.7']),
    content: PropTypes.arrayOf(
      PropTypes.oneOf([
        'includeTitlePage',
        // 'includeCopyrights',
        // 'includeTOC',
        'includeCoverPage',
      ]),
    ),
    template: PropTypes.string,
    spread: PropTypes.oneOf(['single', 'double']),
    zoom: PropTypes.number,
  }).isRequired,
  defaultProfile: PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    format: PropTypes.oneOf(['pdf', 'epub', 'web']),
    size: PropTypes.oneOf(['8.5x11', '6x9', '5.5x8.5','5.8x8.3','8.3x11.7']),
    content: PropTypes.arrayOf(
      PropTypes.oneOf([
        'includeTitlePage',
        'includeCopyrights',
        'includeTOC',
        'includeCover',
      ]),
    ),
    template: PropTypes.string,
  }).isRequired,
  deleteProfile: PropTypes.func.isRequired,
  download: PropTypes.func.isRequired,
  canModify: PropTypes.bool.isRequired,
  canUploadToProvider: PropTypes.bool.isRequired,
  isUserConnectedToLulu: PropTypes.bool.isRequired,
  loadingExport: PropTypes.bool.isRequired,
  loadingPreview: PropTypes.bool.isRequired,
  luluConfig: PropTypes.shape(),
  onOptionsChange: PropTypes.func.isRequired,
  onProfileChange: PropTypes.func.isRequired,
  previewLink: PropTypes.string,
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
  renameProfile: PropTypes.func.isRequired,
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
  exportsConfig: PropTypes.shape(),
  webPublishInfo: PropTypes.shape(),
  onPublish: PropTypes.func,
  onUnpublish: PropTypes.func,
  publishing: PropTypes.bool,
  hasCover: PropTypes.bool,
}

Preview.defaultProps = {
  selectedProfile: null,
  luluConfig: null,
  previewLink: null,
  exportsConfig: null,
  onPublish: null,
  onUnpublish: null,
  publishing: false,
  webPublishInfo: null,
  hasCover: false,
}

export default Preview
