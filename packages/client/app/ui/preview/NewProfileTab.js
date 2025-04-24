/* eslint-disable react/prop-types */
import React from 'react'
import ExportOptionsSection from './ExportOptionsSection'
import FlaxTemplateCustomization from './FlaxTemplateCustomization'
import Footer from './Footer'

const allExportOptions = [
  { label: 'PDF', value: 'pdf' },
  // { label: 'EPUB', value: 'epub' },
  // { label: 'Web', value: 'web' },
]

const NewProfileTab = props => {
  const {
    newProfileOptions,
    handleFormatChange,
    canModify,
    hasCover,
    optionsDisabled,
    isbns,
    handleOptionsChange,
    templates,
    createProfile,
    loadingPreview,
    onClickDownload,
    updateProfileOptions,
    exportsConfig,
    profiles,
  } = props

  const exportOptions = allExportOptions.filter(option => {
    const configEntry = Object.entries(exportsConfig).find(([k, v]) =>
      k.startsWith(option.value),
    )

    return configEntry[1].enabled
  })

  return (
    <>
      <ExportOptionsSection
        disabled={optionsDisabled}
        exportOptions={exportOptions}
        exportsConfig={exportsConfig}
        handleFormatChange={handleFormatChange}
        hasCover={hasCover}
        includeEpub={newProfileOptions.includeEpub}
        includePdf={newProfileOptions.includePdf}
        isbns={isbns}
        newProfile
        onChange={handleOptionsChange}
        previewLoading={loadingPreview}
        profiles={profiles}
        selectedContent={newProfileOptions.content}
        selectedFormat={newProfileOptions.format}
        selectedIsbn={newProfileOptions.isbn}
        selectedSize={newProfileOptions.size}
        selectedTemplate={newProfileOptions.template}
        templates={templates}
      />

      {newProfileOptions.format === 'web' &&
        exportsConfig.webCustomHTML?.enabled && (
          <FlaxTemplateCustomization
            loading={loadingPreview}
            onApplyChanges={handleOptionsChange}
            runningBlocks={{
              header: newProfileOptions.customHeader,
              footer: newProfileOptions.customFooter,
            }}
          />
        )}

      <Footer
        canModify={canModify}
        createProfile={createProfile}
        isNewProfileSelected
        loadingPreview={loadingPreview}
        onClickDownload={onClickDownload}
        selectedFormat={newProfileOptions.format}
        updateProfile={updateProfileOptions}
      />
    </>
  )
}

export default NewProfileTab
