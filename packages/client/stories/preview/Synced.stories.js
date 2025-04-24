import React from 'react'
// import { lorem } from 'faker'

import Synced from '../../app/ui/preview/Synced'

export const Base = () => <Synced isSynced lastSynced={new Date()} />

export const OutOfSync = () => {
  const d = new Date()
  d.setDate(d.getDate() - 3)

  return <Synced isSynced={false} lastSynced={d} />
}

export default {
  component: Synced,
  title: 'Preview/Synced',
}
