/* eslint-disable no-console */

import React from 'react'

import PreviewDisplayOptions from '../../app/ui/preview/PreviewDisplayOptions'

export const Base = () => (
  <PreviewDisplayOptions
    onOptionsChange={v => console.log(v)}
    spread="double"
    zoom={1}
  />
)

export const Disabled = () => (
  <PreviewDisplayOptions
    disabled
    onOptionsChange={() => {}}
    spread="single"
    zoom={0.7}
  />
)

export default {
  component: PreviewDisplayOptions,
  title: 'Preview/PreviewDisplayOptions',
}
