import React from 'react'
import styled from 'styled-components'
// import { lorem } from 'faker'

import LuluIntegration from '../../app/ui/preview/LuluIntegration'

const Wrapper = styled.div`
  height: 200px;

  > div {
    height: 100%;
  }
`

export const Base = () => (
  <Wrapper>
    <LuluIntegration
      isConnected
      isInLulu
      isSynced
      lastSynced={new Date()}
      onClickConnect={() => {}}
      onClickSendToLulu={() => {}}
      projectId="zkjf7843"
      projectUrl="https://www.lulu.com"
    />
  </Wrapper>
)

export const ConnectedButProjectNotInLulu = () => (
  <LuluIntegration
    isConnected
    isInLulu={false}
    onClickConnect={() => {}}
    onClickSendToLulu={() => {}}
  />
)

export const NotConnected = () => (
  <LuluIntegration
    isConnected={false}
    onClickConnect={() => {}}
    onClickSendToLulu={() => {}}
  />
)

export default {
  component: LuluIntegration,
  title: 'Preview/LuluIntegration',
}
