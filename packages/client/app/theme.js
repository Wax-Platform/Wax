/* eslint-disable import/no-import-module-exports */

/* stylelint-disable declaration-no-important, string-quotes */

import { css } from 'styled-components'
import { th } from '@coko/client'
import osiTheme from './osiTheme'

const { CLIENT_LOAD_EXTRA_THEME } = process.env

const theme = {
  colorContent: '#111',
  colorBackground: '#eee',
  colorContentBackground: '#f6f6f6',
  colorPrimary: '#525E76',
  colorSecondary: '#E7E7E7',
  colorLightGrey: '#f7f7f7',
  colorReserve: 'white',
  colorLighterGrey: '#f9f9f9',
  colorFurniture: '#CCC',
  colorBorder: '#EBEBF0',
  colorBackgroundHue: '#FFFFFF',
  colorBackgroundTabs: 'gainsboro',
  // colorError: 'indianred',
  colorTextReverse: '#FFF',
  colorTextPlaceholder: '#595959',
  // colorWarning: '#ffc107',
  colorBackgroundToolBar: '#fff',
  colorSelection: '#C5D7FE',
  colorBackgroundButton: '#0042C7',
  colorBody: 'white', // white
  colorTertiary: '#8ac341',
  colorSuccess: '#27AA85',
  colorError: '#d43131',
  colorWarning: '#a65b00',
  colorText: '#525E76',
  colorTextDark: '#222222',
  colorAccept: '#27AA85',

  // font for the interface (menu ,button, etc.)
  fontInterface: 'MontserratVariable',
  fontFallbackInterface: 'Inter',
  // font for the branding (coko, text outside the box, etc.)
  fontBrand: 'MontserratVariable',
  fontFallbackBrand: 'Montserrat',
  //  font fot the Content itself (the editable text)
  // fontContent: 'RecursiveVariable',
  // fontFallbackContent: 'Recursive',

  fontContent: 'MontserratVariable',
  fontFallbackContent: 'Montserrat',

  // font sizes
  fontSizeBase: '16px',
  fontSizeBaseSmall: '14px',
  fontSizeHeading1: '96px',
  fontSizeHeading2: '81px',
  fontSizeHeading3: '54px',
  fontSizeHeading4: '36px',
  fontSizeHeading5: '24px',
  fontSizeHeading6: '18px',

  // line heights
  lineHeightBase: '30px',
  // lineHeightBaseSmall: '32px',
  // lineHeightHeading1: '96px',
  // lineHeightHeading2: '80px',
  // lineHeightHeading3: '59px',
  // lineHeightHeading4: '43px',
  // lineHeightHeading5: '28px',
  // lineHeightHeading6: '31px',

  // fontSizeBase: '1rem', // 16px
  // fontSizeBaseSmall: '0.875rem', // 14px

  gridUnit: '4px',

  borderRadius: '3px',
  borderWidth: '1px',
  borderStyle: 'solid',

  // #region header variables
  mobileLogoHeight: '100px',
  headerPaddingVertical: '16px',
  headerPaddingHorizontal: '24px',
  // #endregion header variables

  mediaQueries: {
    small: '600px',
    medium: '900px',
    mediumPlus: '1024px',
    large: '1200px',
  },
  cssOverrides: {
    Wax: {
      CreateTableWrapper: css`
        position: fixed;
      `,
      FindReplaceWrapper: css`
        position: fixed;
        top: unset;
      `,
      CommentOuterBox: css`
        color: ${th('colorContent')};
        margin-left: ${props => (props.active ? `-150px` : `30px`)};
        padding: 0;
        width: ${props => (props.active ? `400px` : `300px`)};
      `,
      CommentWrapper: css`
        border-radius: 8px;
        padding: 0.8em 1.2ch;
        padding: ${props => (props.active ? `0.8em 1.2ch` : `.3em .5ch`)};
      `,
      CommentResolve: css`
        color: transparent;

        &:hover {
          color: ${th('colorPrimary')};
        }

        &::after {
          color: ${th('colorPrimary')};
          content: '✓';
          font-size: 1.5em;
          line-height: 1em;
          margin-left: 0.7ch;
        }
      `,
      CommentResolveWrapper: css`
        color: transparent;
        position: absolute;
        right: 0.5em;
        top: 0.5em;
      `,
      CommentItemWrapper: css`
        border: none;
        margin-bottom: 1em;
        margin-bottom: ${props => (props.active ? `1em` : `0`)};
      `,
      CommentInfoWrapper: css`
        border-bottom: 1px solid ${th('colorBackgroundTabs')};
        display: block;
        font-size: 0.9em;
        margin-bottom: 0.5em;
        width: max-content;
      `,
      CommentName: css`
        display: inline;
        font-size: 0.9em;
        margin-right: 2ch;

        &::after {
          color: ${th('colorPrimary')};
          content: 'comment';
          padding-left: 10px;
          visibility: visible;
        }
      `,
      CommentTimestamp: css`
        display: ${props => (props.active ? `inline` : `none`)};
        font-size: 0.9em;
        font-style: italic;
      `,
      CommentContent: css`
        font-size: 0.8em;
        height: ${props => (props.active ? `unset` : `1.2em`)};
        line-height: 1.3;
        margin-top: 0.5em;
        overflow: ${props => (props.active ? `unset` : `hidden`)};
        text-overflow: ${props => (props.active ? `unset` : `ellipsis`)};
        white-space: ${props => (props.active ? `unset` : `nowrap`)};

        &:nth-of-type(even) {
          width: auto;
        }
      `,
      CommentReplyWrapper: css`
        border-top: unset;
      `,

      CommentTextArea: css`
        border: 3px solid ${th('colorLightGrey')};
        font-size: 0.9em;
        margin: 0.5em 0;
        padding: 0.5em 1ch;

        &:focus {
          border-color: ${th('colorBorder')};
          outline: none;
        }

        &::before {
          content: 'Reply';
          display: block;
          font-style: italic;
          margin-bottom: 0.4em;
        }
      `,
      CommentButtons: css`
        font-size: 14px;

        &:first-of-type {
          background: ${th('colorAccept')} !important;
        }
      `,
      CommentButtonGroup: css``,
      TransformToolWrapper: css`
        position: fixed;
        top: unset;
      `,
      HighlightToolWrapper: css`
        position: fixed;
        top: unset;
      `,
      SpecialCharacterToolWrapper: css`
        position: fixed;
        top: unset;
      `,
    },
  },
}

export default CLIENT_LOAD_EXTRA_THEME === 'osiTheme.css'
  ? osiTheme(theme)
  : theme
