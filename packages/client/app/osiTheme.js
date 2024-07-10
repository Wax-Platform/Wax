/* eslint-disable import/no-import-module-exports */

/* stylelint-disable string-quotes, declaration-no-important */

import { css } from 'styled-components'
import { th } from '@coko/client'

export default theme => {
  // eslint-disable-next-line no-param-reassign
  theme.cssOverrides.Wax = {
    ...theme.cssOverrides.Wax,
    ProseMirror: css`
      padding: 3em 2ch 2em;
    `,
    WaxSurfaceScroll: css`
      margin-left: 2%;
    `,
    CommentOuterBox: css`
      color: ${th('colorContent')};
      margin-left: 20px;
      margin-right: 10px;
      padding: 0;
      width: 600px;

      > div {
        margin-right: 20px;
      }
    `,
    CommentName: css`
      display: inline;
      font-size: 11px;
      margin-right: 2ch;

      &::after {
        color: ${th('colorPrimary')};
        content: '';
        padding-left: 10px;
        visibility: visible;
      }
    `,
    CommentItemTitle: css`
      font-size: 0.9em !important;
    `,
    CommentItemWrapper: css`
      border: none;
      margin-bottom: 1em;
      margin-bottom: ${props => (props.active ? `1em` : `0`)};

      > div:not(:first-of-type) {
        margin-left: 16px;
      }
    `,
  }

  return theme
}
