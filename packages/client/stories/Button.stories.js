import React from 'react'

import { Button } from '../app/ui/common'

export const Base = () => <Button>Base</Button>

export const Danger = () => <Button status="danger">Danger</Button>

export const PrimaryDanger = () => (
  <Button status="error" type="primary">
    Primary
  </Button>
)

export default {
  component: Button,
  title: 'Common/Button',
}
