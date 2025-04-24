/* eslint-disable react/prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

import { Button } from '../common'

const FlaxIntegration = props => {
  const { webPublishInfo, profiles } = props

  const { t } = useTranslation(null, {
    keyPrefix: 'pages.previewAndPublish.sections.tabs.publishingProfiles',
  })

  return (
    <div>
      <h3 style={{ marginBlock: 0 }}>{t('flax.heading')}</h3>
      {webPublishInfo?.published ? (
        <>
          <p>
            {t('flax.status.published.yes')}{' '}
            {new Intl.DateTimeFormat('en-GB', {
              dateStyle: 'medium',
              timeStyle: 'long',
            }).format(new Date(webPublishInfo?.lastUpdated))}
          </p>
          <p>
            {t('flax.status.published.profile')}{' '}
            {profiles.find(p => p.value === webPublishInfo.profileId)?.label}
          </p>
          <div style={{ display: 'flex', gap: '2em' }}>
            <Button
              onClick={() =>
                window.open(webPublishInfo?.publicUrl, '_blank', 'noreferrer')
              }
            >
              {t('flax.actions.open')}
            </Button>
          </div>
        </>
      ) : (
        <p>{t('flax.status.published.no')}</p>
      )}
    </div>
  )
}

FlaxIntegration.propTypes = {
  webPublishInfo: PropTypes.shape(),
  profiles: PropTypes.arrayOf(PropTypes.shape()),
}

FlaxIntegration.defaultProps = {
  webPublishInfo: null,
  profiles: null,
}

export default FlaxIntegration
