import React from 'react'
import PropTypes from 'prop-types'

import { Paragraph, Text } from '../common'

const SuccessSubTitle = ({ userEmail }) => {
  return (
    <Paragraph>
      An email has been sent to <Text strong>{userEmail}</Text> containing
      further instructions.
    </Paragraph>
  )
}

SuccessSubTitle.propTypes = {
  userEmail: PropTypes.string.isRequired,
}

export default SuccessSubTitle
