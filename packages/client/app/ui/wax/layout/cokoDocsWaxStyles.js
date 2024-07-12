/* stylelint-disable string-quotes, value-list-comma-newline-after, declaration-no-important */

import { css } from 'styled-components'
import { th, override } from '@coko/client'

export default css`
  .ProseMirror {
    --mono: 0;
    --casl: 0;
    --wght: 300;
    --slnt: 1;
    --crsv: 0.7;

    font-family: '${th('fontContent')}';
    font-size: 0.95em;
    font-variation-settings: 'MONO' var(--mono), 'CASL' var(--casl),
      'slnt' var(--slnt), 'CSRV' var(--crsv);
    font-weight: 400;
    padding: 3em 10ch;
    width: var(--pm-editor-width, 1000px);

    p {
      font-size: 1.05em;
      line-height: 1.5;
    }

    ol {
      counter-reset: item;
    }

    ol li {
      display: block;
      margin-bottom: 1em;
      margin-top: 1em;
    }

    table p {
      font-size: 1em;
      line-height: 1.2;
      margin: 0;
      margin-bottom: 0.3ch;
    }

    ol li p {
      display: inline;
    }

    ol li::before {
      content: counters(item, '.') '. ';
      counter-increment: item;
    }

    table {
      border: 3px solid ${th('colorContent')};
      font-size: 0.9em;
    }

    table tr {
      border-bottom: 2px solid ${th('colorContent')};
    }

    table tr:nth-of-type(odd) {
      background: ${th('colorLightGrey')};
    }

    table td,
    th {
      border: 1px solid ${th('colorContent')};
      padding: 1em 1ch;
    }

    table th {
      padding-left: 2ch;
      text-align: left;
    }

    table > tbody > tr > th {
      background-color: #e9e9e9;
      border: 1px solid ${th('colorContent')};
      color: ${th('colorContent')};
      font-size: 0.9em;
    }

    table > tbody > tr > td > p {
      margin-bottom: 0.4em;
    }

    table p:empty {
      margin: 0;
    }

    /* stylelint-disable-next-line order/properties-alphabetical-order */
    ${override('Wax.ProseMirror')}
  }

  .ProseMirror > * {
    line-height: 1.4;
    position: relative;
  }

  *:focus:not(.ProseMirror) {
    outline: 1px solid ${th('colorPrimary')};
  }

  .ProseMirror-selectednode {
    outline: 2px solid ${th('colorPrimary')};
  }

  .ProseMirror ::selection {
    background-color: ${th('colorSelection')};
    color: #000;
  }

  /* heading */

  .ProseMirror h1 {
    /* border-bottom: 2px solid ${th('colorPrimary')}; */
    font-size: 2.2em;
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: 1em;
    padding-bottom: 0.4em;
  }

  .ProseMirror h1:first-child {
    margin-top: 2em;
  }

  .ProseMirror h2 {
    font-size: 1.8em;
    font-variation-settings: 'MONO' var(--mono), 'CASL' var(--casl),
      'slnt' var(--slnt), 'CSRV' var(--crsv);
    font-weight: 500;
  }

  .ProseMirror h3 {
    font-size: 1.5em;
    font-variation-settings: 'MONO' var(--mono), 'CASL' var(--casl),
      'slnt' var(--slnt), 'CSRV' var(--crsv);
    font-weight: 400;
  }

  .ProseMirror h4 {
    font-size: 1.2em;
    font-weight: 700;
  }

  .ProseMirror h5 {
    font-size: 1em;
  }

  .ProseMirror h6 {
    font-size: 0.9em;
    text-transform: uppercase;
  }

  .ProseMirror :is(h2, h3, h4, h5, h6) {
    line-height: 1.3;
    margin-bottom: 0.4em;
    margin-top: 1.7em;
  }

  .ProseMirror :is(h1, h2, h3, h4, h5, h6)::before {
    --casl: 1;
    --slnt: 1;

    color: ${th('colorPrimary')};
    display: none;
    font-size: 1rem;
    font-variation-settings: 'MONO' var(--mono), 'CASL' var(--casl),
      'slnt' var(--slnt), 'CSRV' var(--crsv);
    font-weight: 400;
    left: -5ch;
    position: absolute;
    text-transform: lowercase;
    top: 0.4rem;
  }

  .ProseMirror :is(h2 + h3, h3 + h4, h4 + h5, h5 + h6) {
    margin-top: 0.5em;
  }

  .ProseMirror em {
    --slnt: -15;
    font-style: italic;
    font-weight: 450;
    /* font-variation-settings:  "MONO" var(--mono), "CASL" var(--casl),  "slnt" var(--slnt), "CSRV" var(--crsv); */
  }

  .ProseMirror h1::before {
    content: 'h1 ';
  }

  .ProseMirror h2::before {
    content: 'h2 ';
  }

  .ProseMirror h3::before {
    content: 'h3 ';
  }

  .ProseMirror blockquote {
    border-left: 4px solid ${th('colorPrimary')};
    margin: 1em 0;
    padding-left: 2ch;
  }

  .ProseMirror .small-caps {
    --casl: 0;
    font-variant: all-small-caps !important;
    font-weight: 450;
    letter-spacing: 0.05ch;
  }

  .ProseMirror .highlight {
    background: 200%;
  }

  .ProseMirror ul li::marker {
    color: ${th('colorPrimary')};
    content: '—  ';
    margin-left: -1ch;
  }

  .ProseMirror :is(ul, ol) {
    list-style-position: outside;
    margin-left: 0;
    padding-left: 3ch;
  }

  .ProseMirror a {
    color: inherit;
    text-decoration: underline;
    text-decoration-color: ${th('colorPrimary')};
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }

  .ProseMirror a:hover {
    color: ${th('colorPrimary')};
  }
`
