/* stylelint-disable string-quotes */
import styled from 'styled-components'
import { grid, th } from '@coko/client'
import Tabs from './Tabs'

const TabsStyled = styled(Tabs)`
  [role='tablist'] {
    background-color: ${th('colorBackgroundHue')};
    margin: 0;
    padding: 0 ${grid(3)};

    .ant-tabs-tab {
      background: ${th('colorBackgroundHue')};
      font-weight: 700;
      margin: 0;
      padding: ${grid(0.5)};
      text-transform: capitalize;

      &:hover {
        color: inherit;
      }

      &.ant-tabs-tab-active {
        background-color: ${th('colorBackground')};
      }

      [role='tab'] {
        color: inherit;
        padding: ${grid(3)} ${grid(4)};
        transition: none;

        &:focus {
          color: ${th('colorPrimary')};
          outline: 2px solid ${th('colorPrimary')};
        }
      }
    }

    .ant-tabs-ink-bar {
      display: none;
    }
  }
`

export default TabsStyled
