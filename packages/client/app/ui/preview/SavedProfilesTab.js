/* eslint-disable react/prop-types */
import React from 'react'
import { Divider } from 'antd'
import { useTranslation } from 'react-i18next'
import ProfileRow from './ProfileRow'
import ExportOptionsSection from './ExportOptionsSection'
import Footer from './Footer'
import LuluIntegration from './LuluIntegration'
import FlaxIntegration from './FlaxIntegration'
import FlaxTemplateCustomization from './FlaxTemplateCustomization'
import { Ribbon } from '../common'

const SavedProfilesTab = props => {
  const {
    canModify,
    handleProfileChange,
    renameProfile,
    profiles,
    selectedProfileSelectOption,
    optionsDisabled,
    isbns,
    selectedProfile,
    handleOptionsChange,
    currentOptions,
    templates,
    createProfile,
    loadingPreview,
    hasChanges,
    hasCover,
    onClickDownload,
    updateProfileOptions,
    onClickDelete,
    exportsConfig,
    onPublish,
    onUnpublish,
    // lulu integration
    luluConfig,
    canUploadToProvider,
    isUserConnectedToLulu,
    isProfileSyncedWithLulu,
    projectId,
    projectUrl,
    lastSynced,
    onClickConnectToLulu,
    sendToLulu,
    // end lulu integration
    publishing,
    webPublishInfo,
    selectedProfileLastUpdated,
  } = props

  const profileSelected = selectedProfile && selectedProfile !== 'new-export'

  const { includePdf, includeEpub, pdfProfileId, epubProfileId } =
    currentOptions

  const { t } = useTranslation(null, {
    keyPrefix: 'pages.previewAndPublish.sections.tabs.publishingProfiles',
  })

  return (
    <>
      <div>
        <ProfileRow
          canModifyProfiles={canModify}
          hasChanges={hasChanges}
          loadingPreview={loadingPreview}
          onClickDelete={onClickDelete}
          onProfileChange={handleProfileChange}
          profiles={profiles.map(p => ({ label: p.label, value: p.value }))}
          selectedProfile={profileSelected ? selectedProfileSelectOption : {}}
          updateProfile={updateProfileOptions}
        />
        {profileSelected && canModify && hasChanges && !loadingPreview && (
          <Ribbon hide={!hasChanges || !canModify}>
            {t('profile.information.changes')}
          </Ribbon>
        )}
      </div>
      {profileSelected && (
        <>
          {currentOptions.format === 'web' ? (
            <>
              <FlaxIntegration
                profiles={profiles}
                webPublishInfo={webPublishInfo}
              />
              <Divider />
            </>
          ) : null}
          {!!luluConfig &&
          !luluConfig.disabled &&
          (currentOptions.format === 'pdf' ||
            currentOptions.format === 'epub') ? (
            <>
              <LuluIntegration
                canUploadToProvider={canUploadToProvider}
                isConnected={isUserConnectedToLulu}
                isInLulu={!!projectId}
                isSynced={isProfileSyncedWithLulu}
                lastSynced={lastSynced}
                luluConfig={luluConfig}
                onClickConnect={onClickConnectToLulu}
                projectId={projectId}
                projectUrl={projectUrl}
              />
              <Divider />
            </>
          ) : null}

          <ExportOptionsSection
            canModifyProfiles={canModify}
            disabled={optionsDisabled}
            epubProfileId={currentOptions.epubProfileId}
            exportsConfig={exportsConfig}
            hasCover={hasCover}
            includeEpub={currentOptions.includeEpub}
            includePdf={currentOptions.includePdf}
            isbns={isbns}
            lastUpdated={new Intl.DateTimeFormat('en-GB', {
              dateStyle: 'medium',
              timeStyle: 'long',
            }).format(new Date(selectedProfileLastUpdated))}
            newProfile={!selectedProfile}
            onChange={handleOptionsChange}
            onProfileRename={renameProfile}
            pdfProfileId={currentOptions.pdfProfileId}
            previewLoading={loadingPreview}
            profiles={currentOptions.format === 'web' ? profiles : null}
            selectedContent={currentOptions.content}
            selectedFormat={currentOptions.format}
            selectedIsbn={currentOptions.isbn}
            selectedProfile={selectedProfileSelectOption}
            selectedSize={currentOptions.size}
            selectedTemplate={currentOptions.template}
            templates={templates}
          />

          {currentOptions.format === 'web' &&
            exportsConfig.webCustomHTML?.enabled && (
              <FlaxTemplateCustomization
                loading={loadingPreview}
                onApplyChanges={handleOptionsChange}
                runningBlocks={{
                  header: currentOptions.customHeader,
                  footer: currentOptions.customFooter,
                }}
              />
            )}

          <Footer
            canModify={canModify}
            createProfile={createProfile}
            isNewProfileSelected={false}
            loadingPreview={loadingPreview}
            luluInformation={{
              canUploadToProvider,
              isConnected: isUserConnectedToLulu,
              isInLulu: !!projectId,
              isSynced: isProfileSyncedWithLulu,
              onClickSendToLulu: sendToLulu,
            }}
            onClickDownload={onClickDownload}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
            publishing={publishing}
            publishingAssets={{
              missingPdfProfile: includePdf && !pdfProfileId,
              missingEpubProfile: includeEpub && !epubProfileId,
              includePdf,
              includeEpub,
              publishedBefore: webPublishInfo?.published,
            }}
            selectedFormat={currentOptions.format}
            selectedTemplate={templates.find(
              template => template.id === currentOptions.template,
            )}
          />
        </>
      )}
    </>
  )
}

export default SavedProfilesTab
