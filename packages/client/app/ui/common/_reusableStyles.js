import { css } from 'styled-components'

import { th } from '@coko/client'

/* eslint-disable-next-line import/prefer-default-export */
export const inputShadow = css`
  input {
    &:focus {
      box-shadow: 0 0 2px ${th('colorPrimary')};
    }
  }
`
