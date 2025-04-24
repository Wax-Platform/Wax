/* eslint-disable no-console */
import React from 'react'
import { CopyrightLicenseOption, Collapse } from '../../app/ui'

export const Base = props => {
  return (
    <Collapse>
      <CopyrightLicenseOption {...props}>
        This is the panel body.
      </CopyrightLicenseOption>
    </Collapse>
  )
}

Base.args = {
  title: 'title',
  description: 'description',
  link: 'https://google.com',
  linkText: 'Google',
  name: 'SC',
}

export const WithoutLink = props => {
  return (
    <Collapse>
      <CopyrightLicenseOption {...props}>
        This is the panel body.
      </CopyrightLicenseOption>
    </Collapse>
  )
}

WithoutLink.args = {
  title: 'title',
  description: 'description',
  name: 'SC',
}

export default {
  component: CopyrightLicenseOption,
  title: 'BookMetadata/CopyrightLicenseOption',
}
