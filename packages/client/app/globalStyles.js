/* stylelint-disable color-hex-length */
/* stylelint-disable max-line-length */
/* stylelint-disable declaration-no-important */
/* stylelint-disable string-quotes */

import { createGlobalStyle } from 'styled-components'
import { th } from '@coko/client'
import printstyles from './printStyles'
import '@fontsource/montserrat'
import '@fontsource/recursive'
import '@fontsource/inter'
import '@fontsource/montserrat/variable.css'
import '@fontsource/inter/variable.css'
import '@fontsource/recursive/variable-full.css'

export default createGlobalStyle`
  #root {
    --color-yellow: #fbcd55;
    --color-yellow-dark: #a27400;
    --color-orange: #fe7b4d;
    --color-orange-dark: #9c4b2e;
    --color-green: #6fab6a;
    --color-green-dark: #558151;
    --color-blue: #21799e;
    --color-blue-dark: #154a61;
    --color-fill: #50737c;
    --color-fill-1: #6a919b;
    --color-fill-2: #fff;
    --color-disabled: #ccc;
    --color-enabled: #21799e;
    --color-yellow-alpha-1: #fbcd55aa;
    --color-orange-alpha-1: #fe7b4daa;
    --color-green-alpha-1: #6fab6aaa;
    --color-blue-alpha-1: #21799eaa;
    --color-yellow-alpha-2: #fbcd5511;
    --color-orange-alpha-2: #fe7b4d11;
    --color-green-alpha-2: #6fab6a11;
    --color-blue-alpha-2: #21799e11;
    --scrollbar: #a34ba160;

    /* Coko colors */

    --color-body: #222222;
    --color-gris: #272727ff;
    --color-pink: #e0387aff;
    --color-purple: #612e61;
    --color-primary: #21b1acff;
    --color-primary-dark: #187f7cff;
    --color-secondary: #e177a2ff;
    --color-secondary-fade: #e0387a0d;
    --color-trois: #a34ba1;

    height: 100dvh;
  }

  html {
    height: 100dvh;
    overflow: hidden;
  }

  * :not(div#assistant-ctx, .ProseMirror) {
    box-sizing: inherit;
    font-family: Arial, Helvetica, sans-serif;

    ::-webkit-scrollbar {
      height: 5px;
      width: 5px;
    }

    ::-webkit-scrollbar-thumb {
      background: var(--scrollbar);
      border-radius: 5px;
      width: 5px;
    }

    ::-webkit-scrollbar-track {
      background: #fff0;
      padding: 5px;
    }
  }

  div#assistant-ctx,
  .Prosemirror * {
    content-visibility: auto;
    font-family: var(--font-family);
  }

  body {
    font-family: '${th('fontInterface')}';
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    -moz-font-smoothing: antialiased;
    -o-font-smoothing: antialiased;
    font-style: normal;
    height: 100%;
    line-height: ${th('lineHeightBase')} !important;
    overflow: auto;

    .ant-select-disabled.ant-select:not(.ant-select-customize-input) .ant-select-selector {
      color: rgb(0 0 0 / 50%);
    }

    .ant-form-item-label > label.ant-form-item-required:not(.ant-form-item-required-mark-optional)::before {
      color: ${th('colorError')};
    }

    .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
      border-color: ${th('colorPrimary')};
      box-shadow: 0 0 0 2px #525e76;
    }

    .ant-select-status-error.ant-select:not(.ant-select-disabled):not(.ant-select-customize-input):not(.ant-pagination-size-changer) .ant-select-selector {
      border-color: ${th('colorError')} !important;
      box-shadow: 0 0 0 2px #d4313122;
    }

    .ant-input:not(.ant-input-status-error):focus,
    .ant-input-focused:not(.ant-input-status-error) {
      border-color: ${th('colorPrimary')};
      box-shadow: 0 0 0 2px #525e76;
    }

    .ant-input-affix-wrapper:focus,
    .ant-input-affix-wrapper-focused {
      border-color: ${th('colorPrimary')};
      box-shadow: 0 0 0 2px #178387;
    }

    .ant-form-item-has-error :not(.ant-input-disabled):not(.ant-input-borderless).ant-input:focus,
    .ant-form-item-has-error :not(.ant-input-affix-wrapper-disabled):not(.ant-input-affix-wrapper-borderless).ant-input-affix-wrapper:focus,
    .ant-form-item-has-error :not(.ant-input-disabled):not(.ant-input-borderless).ant-input-focused,
    .ant-form-item-has-error :not(.ant-input-affix-wrapper-disabled):not(.ant-input-affix-wrapper-borderless).ant-input-affix-wrapper-focused {
      border-color: ${th('colorError')};
      box-shadow: 0 0 0 2px #d4313122;
    }
  }

  ${printstyles}
`
