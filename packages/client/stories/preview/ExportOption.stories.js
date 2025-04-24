import React from 'react'
import styled, { css } from 'styled-components'
// import { lorem } from 'faker'

import { th, grid } from '@coko/client'

import ExportOption from '../../app/ui/preview/ExportOption'

const common = css`
  background: ${th('colorPrimary')};
  border-radius: ${th('borderRadius')};
  color: ${th('colorTextReverse')};
  padding: ${grid(2)};
`

const InlineChild = styled.span`
  ${common}
`

const BlockChild = styled.div`
  ${common}
`

const labelText = 'Lorem'

export const Base = () => (
  <ExportOption label={labelText}>
    <BlockChild>I am a block</BlockChild>
  </ExportOption>
)

export const Inline = () => (
  <ExportOption inline label={labelText}>
    <InlineChild>I am inline</InlineChild>
  </ExportOption>
)

export default {
  component: ExportOption,
  title: 'Preview/ExportOption',
}
