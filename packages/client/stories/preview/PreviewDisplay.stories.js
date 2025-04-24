import React from 'react'
import styled from 'styled-components'

import PreviewDisplay from '../../app/ui/preview/PreviewDisplay'

const Wrapper = styled.div`
  height: 500px;
`

export const Base = () => {
  const handleOptionsChange = vals => {
    /* eslint-disable-next-line no-console */
    console.log('options changed', vals)
  }

  return (
    <Wrapper>
      <PreviewDisplay
        isEpub={false}
        loading={false}
        noPreview={false}
        onOptionsChange={handleOptionsChange}
        previewLink="https://coko.foundation"
        zoom={0.5}
      />
    </Wrapper>
  )
}

export const Epub = () => (
  <Wrapper>
    <PreviewDisplay
      isEpub
      loading={false}
      noPreview={false}
      onOptionsChange={() => {}}
    />
  </Wrapper>
)

export const NoPreview = () => (
  <Wrapper>
    <PreviewDisplay
      isEpub={false}
      loading={false}
      noPreview
      onOptionsChange={() => {}}
    />
  </Wrapper>
)

export const Loading = () => (
  <Wrapper>
    <PreviewDisplay
      isEpub={false}
      loading
      noPreview={false}
      onOptionsChange={() => {}}
    />
  </Wrapper>
)

export default {
  component: PreviewDisplay,
  title: 'Preview/PreviewDisplay',
}
