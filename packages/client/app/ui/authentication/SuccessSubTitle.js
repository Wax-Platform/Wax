import React from 'react'
import PropTypes from 'prop-types'

import { Trans } from 'react-i18next'
import { Paragraph, Text } from '../common'

const SuccessSubTitle = ({ userEmail }) => {
  return (
    <Paragraph>
      <Trans i18nKey="pages.passwordReset.success.details">
        An email has been sent to <Text strong>{{ userEmail }}</Text> containing
        further instructions.
      </Trans>
    </Paragraph>
  )
}

SuccessSubTitle.propTypes = {
  userEmail: PropTypes.string.isRequired,
}

export default SuccessSubTitle
