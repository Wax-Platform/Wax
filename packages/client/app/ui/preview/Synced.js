import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { CheckCircleFilled, WarningFilled } from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { grid, th } from '@coko/client'
import { useTranslation } from 'react-i18next'

dayjs.extend(relativeTime)

const Wrapper = styled.div`
  color: ${props => (props.synced ? th('colorSuccess') : th('colorWarning'))};
  /* font-weight: bold; */
`

const IconWrapper = styled.span`
  margin-right: ${grid(3)};
`

const Message = styled.div`
  /* capitalize breaks without this */
  display: inline-block;

  &::first-letter {
    text-transform: capitalize;
  }
`

const DateText = styled.span`
  font-style: italic;
  margin-left: ${grid(3)};
`

const Synced = props => {
  const { className, isSynced, lastSynced } = props
  const dateString = dayjs(lastSynced).fromNow()

  const { t } = useTranslation(null, {
    keyPrefix: 'pages.previewAndPublish.sections.tabs.publishingProfiles',
  })

  return (
    <Wrapper className={className} synced={isSynced}>
      <IconWrapper>
        {isSynced ? <CheckCircleFilled /> : <WarningFilled />}
      </IconWrapper>

      <Message>
        {isSynced
          ? t('lulu.status.states.synced')
          : t('lulu.status.states.notSynced')}{' '}
      </Message>

      <DateText>
        ({t('lulu.status.syncTime')} {dateString})
      </DateText>
    </Wrapper>
  )
}

Synced.propTypes = {
  isSynced: PropTypes.bool.isRequired,
  lastSynced: PropTypes.string.isRequired,
}

Synced.defaultProps = {}

export default Synced
