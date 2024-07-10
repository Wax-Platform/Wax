/* stylelint-disable declaration-no-important, string-quotes, value-list-comma-newline-after */
/* stylelint-disable no-descending-specificity */

import { css } from 'styled-components'
import '@fontsource/montserrat'
import '@fontsource/montserrat/variable.css'

export default css`
  @media print {
    div {
      background: white !important;
    }

    .ProseMirror,
    .layout__EditorContainer,
    body {
      background: white !important;
    }

    :root {
      /* colors  */
      --color-body: black;
      --color-lightgrey: #fafafa;
      --color-grey: #aaa;
      --color-primary: darkblue;

      /* fonts  */
      --font-serif: 'times';
      --font-sans: 'Montserrat';
    }

    @page {
      margin: 13mm 14mm 18mm;

      @bottom-left {
        content: string(documenttitle);
        font-size: 0.8em;
        letter-spacing: 0.05ch;
        overflow: hidden;
        text-overflow: ellipsis;
        text-transform: uppercase;
        white-space: nowrap;
      }

      @bottom-right {
        color: var(--color-grey);
        content: counter(page) '/' counter(pages);
        width: 3ch;
      }
    }

    body {
      color: var(--color-body);
      font-family: var(--font-sans);
      font-size: 0.8em;
      font-weight: 400;
      height: unset !important;
      max-width: unset;
      position: relative;
      width: auto;
    }

    /* list  */

    ol > li p {
      display: inline;
    }

    /* custom styles for the text */

    h1 {
      border-bottom: 2px solid var(--color-primary);
      font-size: 2.2em;
      font-weight: 600;
      line-height: 1.2;
      margin-bottom: 1em;
      padding-bottom: 0.4em;
      string-set: documenttitle content(text);
    }

    h2 {
      font-size: 1.8em;
      font-variation-settings: 'MONO' var(--mono), 'CASL' var(--casl),
        'slnt' var(--slnt), 'CSRV' var(--crsv);
      font-weight: 500;
    }

    h3 {
      font-size: 1.5em;
      font-variation-settings: 'MONO' var(--mono), 'CASL' var(--casl),
        'slnt' var(--slnt), 'CSRV' var(--crsv);
      font-weight: 400;
    }

    h4 {
      font-size: 1.2em;
      font-weight: 700;
    }

    h5 {
      font-size: 1em;
    }

    h6 {
      font-size: 0.9em;
      text-transform: uppercase;
    }

    :is(h2, h3, h4, h5, h6) {
      line-height: 1.3;
      margin-bottom: 0.4em;
      margin-top: 1.7em;
    }

    p {
      font-size: 1.05em;
      line-height: 1.5;
      max-width: 80ch;
    }

    :is(h1, h2, h3, h4, h5, h6)::before {
      color: var(--color-primary);
      display: none;
      font-size: 1rem;
      font-weight: 400;
      left: -5ch;
      position: absolute;
      text-transform: lowercase;
      top: 0.4rem;
    }

    /* :is(h2 + h3, h3 + h4, h4 + h5, h5 + h6) { */
    /*   margin-top: 0.5em; */
    /* } */

    em {
      font-style: italic;
      font-weight: 450;
    }

    h1::before {
      content: 'h1 ';
    }

    h2::before {
      content: 'h2 ';
    }

    h3::before {
      content: 'h3 ';
    }

    blockquote {
      border-left: 4px solid var(--color-primary);
      margin: 1em 0;
      padding-left: 2ch;
    }

    .small-caps {
      font-variant: all-small-caps !important;
      font-weight: 450;
      letter-spacing: 0.05ch;
    }

    ol,
    ul {
      list-style-position: outside;
      margin-bottom: 0.5em;
      margin-left: 0;
      margin-top: 0.5em;
      padding-left: 3ch;
    }

    ul li::marker {
      content: '—  ';
    }

    a {
      color: inherit;
      text-decoration: underline;
      text-decoration-color: var(--color-primary);
      text-decoration-thickness: 2px;
      text-underline-offset: 3px;
    }

    table {
      border: 3px solid var(--color-body);
      border-collapse: collapse;
      font-size: 0.9em;
      /* l content: '—  '; */
    }

    table p {
      font-size: 1em;
      line-height: 1.2;
      margin: 0;
      margin-bottom: 0.3ch;
    }

    table tr {
      border-bottom: 2px solid var(--color-body);
    }

    table tr:nth-of-type(odd) {
      background: var(--color-lightgrey);
    }

    table td,
    th {
      border: 1px solid var(--color-body);
      padding: 1em 1ch;
    }

    table th {
      padding-left: 2ch;
      text-align: left;
    }

    table > tbody > tr > th {
      background-color: #e9e9e9;
      border: 1px solid var(--color-body);
      color: var(--color-body);
      font-size: 0.9em;
    }

    table > tbody > tr > th > p,
    table > tbody > tr > td > p {
      margin-bottom: 0.4em;
    }

    table p:empty {
      margin: 0;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      break-after: avoid;
    }

    figure {
      /* display: flex;flex-direction:column; */
      align-items: space-around;
      /* flex: 1 1 0; */
    }

    figure img {
      margin: 0 auto;
    }

    figure figcaption {
      text-align: center;
    }

    figure figcaption::before {
      color: var(--color-primary);
      content: 'Fig. ';
      margin: 0 auto;
      text-transform: uppercase;
    }
  }
`
