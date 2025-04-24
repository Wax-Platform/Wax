import { values } from './utils'

export const htmlTagNames = {
  a: 'Link',
  abbr: 'Shortened',
  address: 'Location',
  area: 'Area',
  article: 'Story',
  aside: 'Sidebar',
  audio: 'Sound',
  b: 'Bold',
  base: 'Base',
  bdi: 'Isolated Text',
  bdo: 'Text Direction',
  blockquote: 'Quote',
  body: 'Body',
  br: 'Line Break',
  button: 'Button',
  canvas: 'Canvas',
  caption: 'Title',
  cite: 'Citation',
  code: 'Code',
  col: 'Column',
  colgroup: 'Column Group',
  data: 'Data',
  datalist: 'Data List',
  dd: 'Definition Description',
  del: 'Deleted Text',
  details: 'Details',
  dfn: 'Definition',
  dialog: 'Dialog Box',
  div: 'Division',
  dl: 'Definition List',
  dt: 'Definition Term',
  em: 'Emphasis',
  embed: 'Embedded Content',
  fieldset: 'Form Field Set',
  figcaption: 'Figure Caption',
  figure: 'Figure',
  footer: 'Footer',
  form: 'Form',
  h1: 'Title',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  head: 'Head',
  header: 'Header',
  hgroup: 'Heading Group',
  hr: 'Horizontal Rule',
  html: 'HTML',
  i: 'Italic',
  iframe: 'Embedded Frame',
  img: 'Image',
  input: 'Input',
  ins: 'Inserted Text',
  kbd: 'Keyboard Input',
  label: 'Label',
  legend: 'Legend',
  li: 'List Item',
  link: 'Link',
  main: 'Main',
  map: 'Map',
  mark: 'Highlight',
  meta: 'Metadata',
  meter: 'Meter',
  nav: 'Navigation',
  noscript: 'No Script',
  object: 'Object',
  ol: 'Ordered List',
  optgroup: 'Option Group',
  option: 'Option',
  output: 'Output',
  p: 'Paragraph',
  param: 'Parameter',
  picture: 'Picture',
  pre: 'Preformatted Text',
  progress: 'Progress',
  q: 'Quote',
  rp: 'Ruby Parentheses',
  rt: 'Ruby Text',
  ruby: 'Ruby Annotation',
  s: 'Strikethrough',
  samp: 'Sample Output',
  script: 'Script',
  section: 'Section',
  select: 'Select',
  small: 'Small Text',
  source: 'Source',
  span: 'Span',
  strong: 'Strong',
  style: 'Style',
  sub: 'Subscript',
  summary: 'Summary',
  sup: 'Superscript',
  svg: 'SVG',
  table: 'Table',
  tbody: 'Table Body',
  td: 'Table Data',
  template: 'Template',
  textarea: 'Text Area',
  tfoot: 'Table Foot',
  th: 'Table Header',
  thead: 'Table Head',
  time: 'Time',
  title: 'Title',
  tr: 'Table Row',
  track: 'Track',
  u: 'Underline',
  ul: 'Unordered List',
  var: 'Variable',
  video: 'Video',
  wbr: 'Word Break Opportunity',
}
// export const cssTemplate2 = /* css */ `
// :root {
// 	--pagedjs-width: 8.5in;
// 	--pagedjs-height: 11in;
// 	--pagedjs-width-right: 8.5in;
// 	--pagedjs-height-right: 11in;
// 	--pagedjs-width-left: 8.5in;
// 	--pagedjs-height-left: 11in;
// 	--pagedjs-pagebox-width: 8.5in;
// 	--pagedjs-pagebox-height: 11in;
// 	--pagedjs-footnotes-height: 0mm;
// 	--pagedjs-margin-top: 1in;
// 	--pagedjs-margin-right: 1in;
// 	--pagedjs-margin-bottom: 1in;
// 	--pagedjs-margin-left: 1in;
// 	--pagedjs-padding-top: 0mm;
// 	--pagedjs-padding-right: 0mm;
// 	--pagedjs-padding-bottom: 0mm;
// 	--pagedjs-padding-left: 0mm;
// 	--pagedjs-border-top: 0mm;
// 	--pagedjs-border-right: 0mm;
// 	--pagedjs-border-bottom: 0mm;
// 	--pagedjs-border-left: 0mm;
// 	--pagedjs-bleed-top: 0mm;
// 	--pagedjs-bleed-right: 0mm;
// 	--pagedjs-bleed-bottom: 0mm;
// 	--pagedjs-bleed-left: 0mm;
// 	--pagedjs-bleed-right-top: 0mm;
// 	--pagedjs-bleed-right-right: 0mm;
// 	--pagedjs-bleed-right-bottom: 0mm;
// 	--pagedjs-bleed-right-left: 0mm;
// 	--pagedjs-bleed-left-top: 0mm;
// 	--pagedjs-bleed-left-right: 0mm;
// 	--pagedjs-bleed-left-bottom: 0mm;
// 	--pagedjs-bleed-left-left: 0mm;
// 	--pagedjs-crop-color: black;
// 	--pagedjs-crop-shadow: white;
// 	--pagedjs-crop-offset: 2mm;
// 	--pagedjs-crop-stroke: 1px;
// 	--pagedjs-cross-size: 5mm;
// 	--pagedjs-mark-cross-display: none;
// 	--pagedjs-mark-crop-display: none;
// 	--pagedjs-page-count: 0;
// 	--pagedjs-page-counter-increment: 1;
// 	--pagedjs-footnotes-count: 0;
// 	--pagedjs-column-gap-offset: 1000px;
// }

// @page {
// 	size: letter;
// 	margin: 0;
// }

// .pagedjs_sheet {
// 	box-sizing: border-box;
// 	width: var(--pagedjs-width);
// 	height: var(--pagedjs-height);
// 	overflow: hidden;
// 	position: relative;
// 	display: grid;
// 	grid-template-columns: [bleed-left] var(--pagedjs-bleed-left) [sheet-center] calc(var(--pagedjs-width) - var(--pagedjs-bleed-left) - var(--pagedjs-bleed-right)) [bleed-right] var(--pagedjs-bleed-right);
// 	grid-template-rows: [bleed-top] var(--pagedjs-bleed-top) [sheet-middle] calc(var(--pagedjs-height) - var(--pagedjs-bleed-top) - var(--pagedjs-bleed-bottom)) [bleed-bottom] var(--pagedjs-bleed-bottom);
// }

// .pagedjs_right_page .pagedjs_sheet {
// 	width: var(--pagedjs-width-right);
// 	height: var(--pagedjs-height-right);
// 	grid-template-columns: [bleed-left] var(--pagedjs-bleed-right-left) [sheet-center] calc(var(--pagedjs-width) - var(--pagedjs-bleed-right-left) - var(--pagedjs-bleed-right-right)) [bleed-right] var(--pagedjs-bleed-right-right);
// 	grid-template-rows: [bleed-top] var(--pagedjs-bleed-right-top) [sheet-middle] calc(var(--pagedjs-height) - var(--pagedjs-bleed-right-top) - var(--pagedjs-bleed-right-bottom)) [bleed-bottom] var(--pagedjs-bleed-right-bottom);
// }

// .pagedjs_left_page .pagedjs_sheet {
// 	width: var(--pagedjs-width-left);
// 	height: var(--pagedjs-height-left);
// 	grid-template-columns: [bleed-left] var(--pagedjs-bleed-left-left) [sheet-center] calc(var(--pagedjs-width) - var(--pagedjs-bleed-left-left) - var(--pagedjs-bleed-left-right)) [bleed-right] var(--pagedjs-bleed-left-right);
// 	grid-template-rows: [bleed-top] var(--pagedjs-bleed-left-top) [sheet-middle] calc(var(--pagedjs-height) - var(--pagedjs-bleed-left-top) - var(--pagedjs-bleed-left-bottom)) [bleed-bottom] var(--pagedjs-bleed-left-bottom);
// }

// .pagedjs_bleed {
// 	display: flex;
// 	align-items: center;
// 	justify-content: center;
// 	flex-wrap: nowrap;
// 	overflow: hidden;
// }

// .pagedjs_bleed-top {
// 	grid-column: bleed-left / -1;
// 	grid-row: bleed-top;
// 	flex-direction: row;
// }

// .pagedjs_bleed-bottom {
// 	grid-column: bleed-left / -1;
// 	grid-row: bleed-bottom;
// 	flex-direction: row;
// }

// .pagedjs_bleed-left {
// 	grid-column: bleed-left;
// 	grid-row: bleed-top / -1;
// 	flex-direction: column;
// }

// .pagedjs_bleed-right {
// 	grid-column: bleed-right;
// 	grid-row: bleed-top / -1;
// 	flex-direction: column;
// }

// .pagedjs_marks-crop {
// 	display: var(--pagedjs-mark-crop-display);
// 	flex-grow: 0;
// 	flex-shrink: 0;
// 	z-index: 9999999999;
// }

// .pagedjs_bleed-top .pagedjs_marks-crop:nth-child(1),
// .pagedjs_bleed-bottom .pagedjs_marks-crop:nth-child(1) {
// 	width: calc(var(--pagedjs-bleed-left) - var(--pagedjs-crop-stroke));
// 	border-right: var(--pagedjs-crop-stroke) solid var(--pagedjs-crop-color);
// 	box-shadow: 1px 0px 0px 0px var(--pagedjs-crop-shadow);
// }

// .pagedjs_right_page .pagedjs_bleed-top .pagedjs_marks-crop:nth-child(1),
// .pagedjs_right_page .pagedjs_bleed-bottom .pagedjs_marks-crop:nth-child(1) {
// 	width: calc(var(--pagedjs-bleed-right-left) - var(--pagedjs-crop-stroke));
// }

// .pagedjs_left_page .pagedjs_bleed-top .pagedjs_marks-crop:nth-child(1),
// .pagedjs_left_page .pagedjs_bleed-bottom .pagedjs_marks-crop:nth-child(1) {
// 	width: calc(var(--pagedjs-bleed-left-left) - var(--pagedjs-crop-stroke));
// }

// .pagedjs_bleed-top .pagedjs_marks-crop:nth-child(3),
// .pagedjs_bleed-bottom .pagedjs_marks-crop:nth-child(3) {
// 	width: calc(var(--pagedjs-bleed-right) - var(--pagedjs-crop-stroke));
// 	border-left: var(--pagedjs-crop-stroke) solid var(--pagedjs-crop-color);
// 	box-shadow: -1px 0px 0px 0px var(--pagedjs-crop-shadow);
// }

// .pagedjs_right_page .pagedjs_bleed-top .pagedjs_marks-crop:nth-child(3),
// .pagedjs_right_page .pagedjs_bleed-bottom .pagedjs_marks-crop:nth-child(3) {
// 	width: calc(var(--pagedjs-bleed-right-right) - var(--pagedjs-crop-stroke));
// }

// .pagedjs_left_page .pagedjs_bleed-top .pagedjs_marks-crop:nth-child(3),
// .pagedjs_left_page .pagedjs_bleed-bottom .pagedjs_marks-crop:nth-child(3) {
// 	width: calc(var(--pagedjs-bleed-left-right) - var(--pagedjs-crop-stroke));
// }

// .pagedjs_bleed-top .pagedjs_marks-crop {
// 	align-self: flex-start;
// 	height: calc(var(--pagedjs-bleed-top) - var(--pagedjs-crop-offset));
// }

// .pagedjs_right_page .pagedjs_bleed-top .pagedjs_marks-crop {
// 	height: calc(var(--pagedjs-bleed-right-top) - var(--pagedjs-crop-offset));
// }

// .pagedjs_left_page .pagedjs_bleed-top .pagedjs_marks-crop {
// 	height: calc(var(--pagedjs-bleed-left-top) - var(--pagedjs-crop-offset));
// }

// .pagedjs_bleed-bottom .pagedjs_marks-crop {
// 	align-self: flex-end;
// 	height: calc(var(--pagedjs-bleed-bottom) - var(--pagedjs-crop-offset));
// }

// .pagedjs_right_page .pagedjs_bleed-bottom .pagedjs_marks-crop {
// 	height: calc(var(--pagedjs-bleed-right-bottom) - var(--pagedjs-crop-offset));
// }

// .pagedjs_left_page .pagedjs_bleed-bottom .pagedjs_marks-crop {
// 	height: calc(var(--pagedjs-bleed-left-bottom) - var(--pagedjs-crop-offset));
// }

// .pagedjs_bleed-left .pagedjs_marks-crop:nth-child(1),
// .pagedjs_bleed-right .pagedjs_marks-crop:nth-child(1) {
// 	height: calc(var(--pagedjs-bleed-top) - var(--pagedjs-crop-stroke));
// 	border-bottom: var(--pagedjs-crop-stroke) solid var(--pagedjs-crop-color);
// 	box-shadow: 0px 1px 0px 0px var(--pagedjs-crop-shadow);
// }

// .pagedjs_right_page .pagedjs_bleed-left .pagedjs_marks-crop:nth-child(1),
// .pagedjs_right_page .pagedjs_bleed-right .pagedjs_marks-crop:nth-child(1) {
// 	height: calc(var(--pagedjs-bleed-right-top) - var(--pagedjs-crop-stroke));
// }

// .pagedjs_left_page .pagedjs_bleed-left .pagedjs_marks-crop:nth-child(1),
// .pagedjs_left_page .pagedjs_bleed-right .pagedjs_marks-crop:nth-child(1) {
// 	height: calc(var(--pagedjs-bleed-left-top) - var(--pagedjs-crop-stroke));
// }

// .pagedjs_bleed-left .pagedjs_marks-crop:nth-child(3),
// .pagedjs_bleed-right .pagedjs_marks-crop:nth-child(3) {
// 	height: calc(var(--pagedjs-bleed-bottom) - var(--pagedjs-crop-stroke));
// 	border-top: var(--pagedjs-crop-stroke) solid var(--pagedjs-crop-color);
// 	box-shadow: 0px -1px 0px 0px var(--pagedjs-crop-shadow);
// }

// .pagedjs_right_page .pagedjs_bleed-left .pagedjs_marks-crop:nth-child(3),
// .pagedjs_right_page .pagedjs_bleed-right .pagedjs_marks-crop:nth-child(3) {
// 	height: calc(var(--pagedjs-bleed-right-bottom) - var(--pagedjs-crop-stroke));
// }

// .pagedjs_left_page .pagedjs_bleed-left .pagedjs_marks-crop:nth-child(3),
// .pagedjs_left_page .pagedjs_bleed-right .pagedjs_marks-crop:nth-child(3) {
// 	height: calc(var(--pagedjs-bleed-left-bottom) - var(--pagedjs-crop-stroke));
// }

// .pagedjs_bleed-left .pagedjs_marks-crop {
// 	width: calc(var(--pagedjs-bleed-left) - var(--pagedjs-crop-offset));
// 	align-self: flex-start;
// }

// .pagedjs_right_page .pagedjs_bleed-left .pagedjs_marks-crop {
// 	width: calc(var(--pagedjs-bleed-right-left) - var(--pagedjs-crop-offset));
// }

// .pagedjs_left_page .pagedjs_bleed-left .pagedjs_marks-crop {
// 	width: calc(var(--pagedjs-bleed-left-left) - var(--pagedjs-crop-offset));
// }

// .pagedjs_bleed-right .pagedjs_marks-crop {
// 	width: calc(var(--pagedjs-bleed-right) - var(--pagedjs-crop-offset));
// 	align-self: flex-end;
// }

// .pagedjs_right_page .pagedjs_bleed-right .pagedjs_marks-crop {
// 	width: calc(var(--pagedjs-bleed-right-right) - var(--pagedjs-crop-offset));
// }

// .pagedjs_left_page .pagedjs_bleed-right .pagedjs_marks-crop {
// 	width: calc(var(--pagedjs-bleed-left-right) - var(--pagedjs-crop-offset));
// }

// .pagedjs_marks-middle {
// 	display: flex;
// 	flex-grow: 1;
// 	flex-shrink: 0;
// 	align-items: center;
// 	justify-content: center;

//   :root{--color-interface-pageSheet: #cfcfcf;--color-interface-pageBox: violet;--color-interface-paper: white;--color-interface-marginBox: transparent;--pagedjs-interface-crop-color: black;--pagedjs-interface-crop-shadow: white;--pagedjs-interface-crop-stroke: 1px}@media screen,pagedjs-ignore{body{background-color:var(--color-interface-background)}.pagedjs_pages{display:grid;margin:0 auto;padding-bottom:8px;grid-template-columns:1fr 1fr;width:calc(var(--pagedjs-width) * 2);gap:0 0}.pagedjs_page{background-color:var(--color-interface-paper);box-shadow:0 0 0 1px var(--color-interface-pageSheet);margin:0;flex-shrink:0;flex-grow:0;margin-top:10mm}.pagedjs_first_page{grid-column:2}.pagedjs_pagebox{box-shadow:0 0 0 1px var(--color-interface-pageBox)}.pagedjs_left_page{z-index:20;width:calc(var(--pagedjs-bleed-left) + var(--pagedjs-pagebox-width))!important}.pagedjs_left_page .pagedjs_bleed-right .pagedjs_marks-crop{border-color:transparent}.pagedjs_left_page .pagedjs_bleed-right .pagedjs_marks-middle{width:0}.pagedjs_right_page{z-index:10;position:relative;left:calc(var(--pagedjs-bleed-left) * -1)}.pagedjs_margin-top-left-corner-holder,.pagedjs_margin-top,.pagedjs_margin-top-left,.pagedjs_margin-top-center,.pagedjs_margin-top-right,.pagedjs_margin-top-right-corner-holder,.pagedjs_margin-bottom-left-corner-holder,.pagedjs_margin-bottom,.pagedjs_margin-bottom-left,.pagedjs_margin-bottom-center,.pagedjs_margin-bottom-right,.pagedjs_margin-bottom-right-corner-holder,.pagedjs_margin-right,.pagedjs_margin-right-top,.pagedjs_margin-right-middle,.pagedjs_margin-right-bottom,.pagedjs_margin-left,.pagedjs_margin-left-top,.pagedjs_margin-left-middle,.pagedjs_margin-left-bottom{box-shadow:0 0 0 1px inset var(--color-interface-marginBox)}}.pagedjs_marks-crop{z-index:999999999999}.pagedjs_bleed-top .pagedjs_marks-crop,.pagedjs_bleed-bottom .pagedjs_marks-crop{box-shadow:1px 0px 0px 0px var(--pagedjs-interface-crop-shadow)}.pagedjs_bleed-top .pagedjs_marks-crop:last-child,.pagedjs_bleed-bottom .pagedjs_marks-crop:last-child{box-shadow:-1px 0px 0px 0px var(--pagedjs-interface-crop-shadow)}.pagedjs_bleed-left .pagedjs_marks-crop,.pagedjs_bleed-right .pagedjs_marks-crop{box-shadow:0px 1px 0px 0px var(--pagedjs-interface-crop-shadow)}.pagedjs_bleed-left .pagedjs_marks-crop:last-child,.pagedjs_bleed-right .pagedjs_marks-crop:last-child{box-shadow:0px -1px 0px 0px var(--pagedjs-interface-crop-shadow)}
// }`
export const cssTemplate1 = /* css */ `
@page {
  @bottom-center {
    content: counter(page);
    font-size: var(--page-counter-font-size);
    text-align: center;
    color: var(--page-counter-color);
  }
}
/* CSS for Paged.js interface – v0.4 */

/* Change the look */
:root {
    --color-background: whitesmoke;
    --color-pageSheet: #cfcfcf;
    --color-pageBox: violet;
    --color-paper: white;
    --color-marginBox: transparent;
    --pagedjs-crop-color: black;
    --pagedjs-crop-shadow: white;
    --pagedjs-crop-stroke: 1px;
}

/* To define how the book look on the screen: */
@media screen, pagedjs-ignore {
    body {
        background-color: var(--color-background);
    }

    .pagedjs_pages {
        display: flex;
        width: calc(var(--pagedjs-width) * 2);
        flex: 0;
        flex-wrap: wrap;
        margin: 0 auto;
    }

    .pagedjs_page {
        background-color: var(--color-paper);
        box-shadow: 0 0 0 1px var(--color-pageSheet);
        margin: 0;
        flex-shrink: 0;
        flex-grow: 0;
        margin-top: 10mm;
    }

    .pagedjs_first_page {
        margin-left: var(--pagedjs-width);
    }

    .pagedjs_page:last-of-type {
        margin-bottom: 10mm;
    }

    .pagedjs_pagebox{
        box-shadow: 0 0 0 1px var(--color-pageBox);
    }

    .pagedjs_left_page{
        z-index: 20;
        width: calc(var(--pagedjs-bleed-left) + var(--pagedjs-pagebox-width))!important;
    }

    .pagedjs_left_page .pagedjs_bleed-right .pagedjs_marks-crop {
        border-color: transparent;
    }
    
    .pagedjs_left_page .pagedjs_bleed-right .pagedjs_marks-middle{
        width: 0;
    } 

    .pagedjs_right_page{
        z-index: 10;
        position: relative;
        left: calc(var(--pagedjs-bleed-left)*-1);
    }

    /* show the margin-box */

    .pagedjs_margin-top-left-corner-holder,
    .pagedjs_margin-top,
    .pagedjs_margin-top-left,
    .pagedjs_margin-top-center,
    .pagedjs_margin-top-right,
    .pagedjs_margin-top-right-corner-holder,
    .pagedjs_margin-bottom-left-corner-holder,
    .pagedjs_margin-bottom,
    .pagedjs_margin-bottom-left,
    .pagedjs_margin-bottom-center,
    .pagedjs_margin-bottom-right,
    .pagedjs_margin-bottom-right-corner-holder,
    .pagedjs_margin-right,
    .pagedjs_margin-right-top,
    .pagedjs_margin-right-middle,
    .pagedjs_margin-right-bottom,
    .pagedjs_margin-left,
    .pagedjs_margin-left-top,
    .pagedjs_margin-left-middle,
    .pagedjs_margin-left-bottom {
        box-shadow: 0 0 0 1px inset var(--color-marginBox);
    }


    .pagedjs_pages {
        flex-direction: column;
        width: 100%;
    }

    .pagedjs_first_page {
        margin-left: 0;
    }

    .pagedjs_page {
        margin: 0 auto;
        margin-top: 10mm;
    } 

    .pagedjs_left_page{
        width: calc(var(--pagedjs-bleed-left) + var(--pagedjs-pagebox-width) + var(--pagedjs-bleed-left))!important;
    }

    .pagedjs_left_page .pagedjs_bleed-right .pagedjs_marks-crop{
        border-color: var(--pagedjs-crop-color);
    }

    .pagedjs_left_page .pagedjs_bleed-right .pagedjs_marks-middle{
        width: var(--pagedjs-cross-size)!important;
    } 

    .pagedjs_right_page{
        left: 0; 
    } 

}
  ::-webkit-scrollbar {
    height: 5px;
    width: 5px;
  }

  ::-webkit-scrollbar-thumb {
    background: #777;
    border-radius: 5px;
    width: 5px;
  }

  ::-webkit-scrollbar-track {
    background: #fff0;
    padding: 5px;
  }
  
`
export const cssTemplate3 = `
@font-face {
  font-family: Crimson Text;
  src: url("https://fonts.bunny.net/crimson-text/files/crimson-text-latin-400-normal.woff2");
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: Crimson Text;
  src: url("https://fonts.bunny.net/crimson-text/files/crimson-text-latin-400-italic.woff2");
  font-weight: 400;
  font-style: italic;
}

@font-face {
  font-family: Crimson Text;
  src: url("https://fonts.bunny.net/crimson-text/files/crimson-text-latin-600-normal.woff2");
  font-weight: 600;
  font-style: normal;
}

@font-face {
  font-family: Crimson Text;
  src: url("https://fonts.bunny.net/crimson-text/files/crimson-text-latin-600-italic.woff2");
  font-weight: 600;
  font-style: italic;
}
html {
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
}
body {
  margin: 0;
}
article,
aside,
footer,
header,
nav,
section {
  display: block;
}
h1 {
  // font-size: 20px;
  margin: 10px 0;
  font-size: calc(var(--font-size) * 2.2);
  text-align: center;
}
figcaption,
figure,
main {
  display: block;
}
hr {
  box-sizing: content-box;
  height: 0;
  overflow: visible;
}
pre {
  font-family: monospace;
  font-size: 16px;
}
a {
  -webkit-text-decoration-skip: objects;
  background-color: rgba(0, 0, 0, 0);
}
abbr[title] {
  border-bottom: none;
  -webkit-text-decoration: underline dotted;
  text-decoration: underline dotted;
}
b,
strong {
  font-weight: inherit;
  font-weight: bolder;
}

code,
kbd,
samp {
  font-family: monospace;
  font-size: 16px;
}
dfn {
  font-style: italic;
}
mark {
  color: #000;
  background-color: #ff0;
}
small {
  font-size: 80%;
}
sub,
sup {
  vertical-align: baseline;
  font-size: 75%;
  line-height: 0;
  position: relative;
}
sub {
  bottom: -5px;
}
sup {
  top: -5px;
}
audio,
video {
  display: inline-block;
}
audio:not([controls]) {
  height: 0;
  display: none;
}
img {
  border-style: none;
}
svg:not(:root) {
  overflow: hidden;
}
button,
input,
optgroup,
select,
textarea {
  margin: 0;
  font-family: sans-serif;
  font-size: 100%;
  line-height: 1.15;
}
button,
input {
  overflow: visible;
}
button,
select {
  text-transform: none;
}
button {
  -webkit-appearance: button;
}
html [type="button"] {
  -webkit-appearance: button;
}
[type="reset"] {
  -webkit-appearance: button;
}
[type="submit"] {
  -webkit-appearance: button;
}
button::-moz-focus-inner {
  border-style: none;
  padding: 0;
}
[type="button"]::-moz-focus-inner {
  border-style: none;
  padding: 0;
}
[type="reset"]::-moz-focus-inner {
  border-style: none;
  padding: 0;
}
[type="submit"]::-moz-focus-inner {
  border-style: none;
  padding: 0;
}
button:-moz-focusring {
  outline: 1px dotted ButtonText;
}
[type="button"]:-moz-focusring {
  outline: 1px dotted ButtonText;
}
[type="reset"]:-moz-focusring {
  outline: 1px dotted ButtonText;
}
[type="submit"]:-moz-focusring {
  outline: 1px dotted ButtonText;
}
fieldset {
  padding: 5px 12px 7px;
}
legend {
  box-sizing: border-box;
  color: inherit;
  white-space: normal;
  max-width: 100%;
  padding: 0;
  display: table;
}
progress {
  vertical-align: baseline;
  display: inline-block;
}
textarea {
  overflow: auto;
}
[type="checkbox"] {
  box-sizing: border-box;
  padding: 0;
}
[type="radio"] {
  box-sizing: border-box;
  padding: 0;
}
[type="number"]::-webkit-inner-spin-button {
  height: auto;
}
[type="number"]::-webkit-outer-spin-button {
  height: auto;
}
[type="search"] {
  -webkit-appearance: textfield;
  outline-offset: -2px;
}
[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
}
[type="search"]::-webkit-search-decoration {
  -webkit-appearance: none;
}
::-webkit-file-upload-button {
  -webkit-appearance: button;
  font: inherit;
}
details,
menu {
  display: block;
}
summary {
  display: list-item;
}
canvas {
  display: inline-block;
}
template,
[hidden] {
  display: none;
}
:root {
  --color-background: #b1b1b1;
  --color-marginBox: transparent;
  --color-pageBox: grey;
  --color-paper: white;
  --color-baseline: red;
  --font-texte: "Crimson Text";
  --font-titre: "Crimson Text";
  --weight-titre: 300;
  --color-body: #222;
  --color-une: #8b8b8b;
  --color-deux: #0f0e0f;
  --font-size: 9pt;
  --font-lineHeight: 13pt;
  --indent-block: calc(var(--page-margin-left) * 0.3);
  --list-padding: 3mm;
  --page-margin-top: 12mm;
  --page-margin-bottom: 15mm;
  --page-margin-left: 15mm;
  --page-margin-right: 15mm;
}
.copyrights-page :-webkit-any(.copyright-before, p, .copyright-after) {
  font-size: calc(var(--font-size) * 0.8);
  line-height: calc(var(--font-lineHeight) * 0.8);
  text-align: center;
}
.copyrights-page :is(.copyright-before, p, .copyright-after) {
  font-size: calc(var(--font-size) * 0.8);
  line-height: calc(var(--font-lineHeight) * 0.8);
  text-align: center;
}
.copyrights-page header h1 {
  display: none;
}
.copyright-before {
  margin-top: var(--page-margin-top);
}
.isbn,
.book-title {
  font-weight: 500;
}
.book-copyrights {
  margin: var(--font-lineHeight) 0;
}
.toc header {
  text-align: center;
  margin-bottom: 50px;
}
nav {
  margin-left: var(--page-margin-left);
}
nav a {
  color: var(--color-body);
  font-size: var(--font-size);
  word-break: break-word;
  background: none;
  font-style: normal;
}
nav li::marker {
  font-size: var(--font-size);
  color: var(--color-body);
  content: attr(data-item-num) ". ";
}
nav li {
  margin-bottom: 8px;
}
#toc-ol ol {
  margin-top: 6px;
  margin-bottom: 15px;
}
#toc-ol li ol li::marker {
  color: var(--color-body);
}
.toc-body a:after {
  content: "" target-counter(attr(href), page);
  float: right;
  margin-right: -0.5mm;
  font-style: normal;
  display: inline-block;
}
html {
  font-family: var(--font-texte);
  font-weight: normal;
  font-size: var(--font-size);
  color: var(--color-body);
  font-kerning: normal;
  font-variant-ligatures: none;
}
p,
li {
  font-size: var(--font-size);
  line-height: var(--font-lineHeight);
  text-align: justify;
  text-indent: var(--indent-block);
  -webkit-hyphens: auto;
  hyphens: auto;
  margin: 0;
  padding: 0;
}
blockquote {
  margin-left: var(--indent-block);
  border-left: 4px solid #d3d3d3;
  margin-right: 0;
  padding-left: 8px;
}
blockquote p {
  text-indent: 0;
}
a {
  font-family: var(--font-titre);
  color: var(--color-body);
  word-break: break-all;
  background: linear-gradient(var(--color-une), var(--color-une)) no-repeat;
  background-position: 0 16px;
  background-size: 100% 1pt;
  font-style: italic;
  text-decoration: none;
}
strong {
  font-weight: 600;
}
u {
  border-bottom: 1px solid var(--color-une);
  text-decoration: none;
}
.running-right,
.running-left {
  display: none;
}
.book-subtitle {
  font-size: calc(var(--font-size) * 2.5);
}
.book-authors {
  font-size: var(--font-size);
}
h1,
h2,
h3 {
  font-family: var(--font-titre);
}

.part header,
.chapter header,
.title-page header {
  text-align: center;
  margin: calc(var(--font-lineHeight) * 7) 0 0;
}
.part-number,
.chapter-number {
  font-size: calc(var(--font-size) * 2.2);
  font-weight: 500;
}
.part header h1,
.chapter header h1,
.title-page header h1,
h1 strong {
  font-size: calc(var(--font-size) * 2.2);
  font-weight: 500;
}
.part header {
  font-variant: small-caps;
  color: gray;
}
h2,
h2 strong {
  font-size: calc(var(--font-size) * 1.8);
  margin-bottom: var(--font-lineHeight);
  font-weight: 350;
}
h3,
h3 strong {
  font-size: calc(var(--font-size) * 1.4);
  margin-top: calc(var(--font-lineHeight) * 1.5);
  margin-bottom: 0;
  font-weight: 400;
}
h2 + h3 {
  margin-top: 0;
}
ul,
ol {
  margin-bottom: calc(var(--font-size) * 2);
  margin-top: var(--font-lineHeight);
  padding-left: calc(var(--indent-block) - var(--list-padding));
}
li {
  padding-left: var(--list-padding);
  break-inside: avoid;
}
li,
li p {
  text-indent: 0;
}
li p {
  text-align-last: left;
  margin-top: 4pt;
  margin-bottom: 0;
}
ul:not(#toc-ol) li::marker {
  color: var(--color-une);
  content: "·";
  font-weight: 900;
}
ol:not(#toc-ol) li::marker {
  color: var(--color-une);
}
ul ul {
  margin-top: calc(var(--font-lineHeight) * 0.5);
  margin-bottom: calc(var(--font-lineHeight) * 0.5);
}
ul ul li::marker {
  content: "–" !important;
}
figure {
  text-indent: 0;
  margin-top: calc(var(--font-lineHeight) * 2);
  margin-bottom: calc(var(--font-lineHeight) * 2);
  break-inside: avoid;
  width: 100%;
  margin-left: 0;
  margin-right: 0;
}
img {
  width: 100%;
  height: auto;
  margin: 0 auto;
  display: block;
}
figcaption {
  text-align: center;
  font-family: var(--font-titre);
  font-size: cal(var(--font-size) * 0.8);
  color: var(--color-une);
  margin: var(--font-lineHeight) auto 0;
  max-width: 40ch;
  line-height: 1.2;
}
p,
li,
h1,
h2,
h3,
h4,
h5,
h6 {
  widows: 2;
  orphans: 2;
}
.chaptertitle,
img,
h1,
h2,
h3 {
  break-inside: avoid;
}
h1,
h2,
h3,
h4,
h5,
h6,
li ul,
li ol {
  break-after: avoid;
  page-break-after: avoid;
}
h1 + p,
h2 + p,
h3 + p,
h4 + p,
h5 + p,
h6 + p,
figure + p,
header + p {
  text-indent: 0;
}
[data-split-to] figure:first-child,
[data-split-from] figure:first-child,
[data-split-to] p:first-child,
[data-split-to] h2:first-child,
[data-split-to] h3:first-child {
  margin-top: 0;
}
@media screen {
  body {
    background-color: var(--color-background);
  }
  .pagedjs_pages {
    width: calc(var(--pagedjs-width) * 2);
    flex-wrap: wrap;
    flex: 0;
    margin: 0 auto 3em;
    display: flex;
  }
  .pagedjs_page {
    background-color: var(--color-paper);
    box-shadow: 0 0 0 2px var(--color-pageBox);
    flex-grow: 0;
    flex-shrink: 0;
    margin: 10mm 0 0;
  }
  .pagedjs_first_page {
    margin-left: var(--pagedjs-width);
  }
}
.running-left {
  string-set: title content(text);
}
@page {
  margin-top: 12mm;
  margin-bottom: 15mm;
  margin-left: 15mm;
  margin-right: 15mm;
  size: 140mm 216mm;
  @bottom-center {
    content: string(title);
    font-size: calc(var(--font-size) * 0.8);
    font-family: var(--font-titre);
    text-transform: uppercase;
    color: var(--color-une);
  }
}
@page :left {
  @bottom-left-corner {
    content: counter(page);
    font-size: var(--font-size);
    font-family: var(--font-titre);
    color: var(--color-une);
    text-align: center;
  }
}
@page :right {
  @bottom-right-corner {
    content: counter(page);
    font-size: var(--font-size);
    font-family: var(--font-titre);
    color: var(--color-une);
    text-align: center;
  }
}
@page :blank {
  @top-left-corner {
    content: none;
  }

  @top-left {
    content: none;
  }

  @top-center {
    content: none;
  }

  @top-right {
    content: none;
  }

  @top-right-corner {
    content: none;
  }

  @right-top {
    content: none;
  }

  @right-middle {
    content: none;
  }

  @right-bottom {
    content: none;
  }

  @bottom-right-corner {
    content: none;
  }

  @bottom-right {
    content: none;
  }

  @bottom-center {
    content: none;
  }

  @bottom-left {
    content: none;
  }

  @bottom-left-corner {
    content: none;
  }

  @left-bottom {
    content: none;
  }

  @left-middle {
    content: none;
  }

  @left-top {
    content: none;
  }
}

.title-page {
  page: page-titre;
  text-align: center;
}

@page page-titre {
  @bottom-center {
    content: none;
  }

  @bottom-right-corner {
    content: none;
  }

  @bottom-left-corner {
    content: none;
  }
}

.copyrights-page {
  page: copyrights;
}

@page copyrights {
  @bottom-center {
    content: none;
  }

  @bottom-right-corner {
    content: none;
  }

  @bottom-left-corner {
    content: none;
  }
}

.toc {
  page: toc;
}

@page toc {
  @bottom-center {
    content: none;
  }

  @bottom-right-corner {
    content: none;
  }

  @bottom-left-corner {
    content: none;
  }
}

.chapter {
  page: chapitre-ouverture;
  break-before: right;
}
.chapter header {
  break-after: page;
}

@page chapitre-ouverture {
  @bottom-center {
    content: none;
  }

  @bottom-right-corner {
    content: none;
  }

  @bottom-left-corner {
    content: none;
  }
}

.chapter {
  page: chapitre;
}

@page chapitre:first {
  @bottom-center {
    content: none;
  }

  @bottom-right-corner {
    content: none;
  }

  @bottom-left-corner {
    content: none;
  }
}

.part {
  page: part;
  break-before: right;
}

@page part {
  @bottom-center {
    content: none;
  }

  @bottom-right-corner {
    content: none;
  }

  @bottom-left-corner {
    content: none;
  }
}

code,
.code {
  font-family: "Inconsolata", monospace;
  line-height: 19px;
  white-space: pre-wrap;
  background-color: #eee;
  padding: 0.1em 0.3em;
  border-radius: 0.1em;
  font-size: 9.6px;
}

.title-page header h1 {
  font-size: 40px;
}
`

export const initialPagedJSCSS = /* css */ ` 
  @page {
      size: A4;
      margin:  20mm;
      @bottom-center {
        content: string(title);
        font-size: 11pt;
        color: #707070;
      }
    }

    @page :left {
      @bottom-left-corner {
        content: counter(page);
        font-size: var(--font-size);
        font-family: var(--font-titre);
        color: var(--color-une);
        text-align: center;
      }
    }

    @page :right {
      @bottom-right-corner {
        content: counter(page);
        font-size: var(--font-size);
        font-family: var(--font-titre);
        color: var(--color-une);
        text-align: center;
      }
    }

    @page :first {
      margin:  3cm;
    }

    @page :left {
      margin-left:  2cm;
      margin-right:  2cm;
    }

    @page :right {
      margin-left:  2cm;
      margin-right:  2cm;
    }
    
    div#assistant-ctx > div.chapter {
	    break-after: always;
    }
    div#assistant-ctx > div.chapter > h1{
	    string-set: title content(text);
      margin-bottom: 10mm;
    }
`

const PAGEDJS_GUIDELINES = {
  NamedString: `
The fastest way to create running headers/footers is to use what is already in your content. Named strings are used to create running headers and footers: they copy text for reuse in margin boxes.

First, the text content of the selected element is cloned into a named string using string-set with a custom identifier (in the code below we call it “title”, but you can name it whatever makes sense as a variable). In the following example, each time a new <h2> appears in the HTML, the content of the named string gets updated with the text of that <h2>. (It also can be selected with a class if you prefer).

h2 {
  string-set: title content(text);
}

Next, the string() function copies the value of a named string to the margin boxes, via the content property:

@page {
  @bottom-center {
    content: string(title);
  }
}
The string property act like a variable. It read your DOM and each time a new title level 2 is encountered, it change the variable from the page where that title appears. This variable is passed into the margin boxes of the page and into all the following margin boxes until there is a new title.
`,
}

const TASK_AND_ROLE_DEFINITIONS = `You are a CSS, JS and HTML expert with a vast knowledge on pagedjs library ('https://pagedjs.org').

Your task is to assist 'user' with the design of a book.

'user' will tell you in natural language the changes he wants to make on the book's design

You must interpret and translate the 'user' request, into css properties/values and html tags or selectors.

Keep in mind that 'user' don't know how to code, so the prompt must be analysed carefully in order to complete the task.

IMPORTANT: 
- You must never say to user what to code, and never give him instructions.

- Your response must be ALWAYS the valid JSON (described below), NEVER text.

The book is designed with pagedjs, so you will need to apply pagedjs css in some cases.

Here you have some pagedJs guidleines: ${values(PAGEDJS_GUIDELINES).join('\n')}
`

const TASK_AND_ROLE_DEFINITIONS_SINGLE_ELEMENT =
  elementTagName => `You are a CSS and HTML expert.

Your task is to assist 'user' to style this ${elementTagName}(${htmlTagNames[elementTagName]}) element.

You must interpret and translate the 'user' request, into css properties/values.

Keep in mind that 'user' don't know how to code, so the prompt must be analysed carefully in order to complete the task.

IMPORTANT: 
- You must never say to user what to code, and never give him instructions.

- Your mission and prupose is to style a ${htmlTagNames[elementTagName]}.

- Your response must be ALWAYS the valid JSON (described below), NEVER text.
`

const CONTEXT = (sheet, inlineStyles, providedText, isSingleElement) => `${
  !isSingleElement && sheet
    ? `This style sheet is the css context:\n${sheet}\n`
    : ''
}${
  isSingleElement && inlineStyles
    ? `\nThis are the inline styles for the element in context: ${inlineStyles}`
    : ''
}${
  isSingleElement && providedText
    ? `\nThis is the current text of the element in context: "${providedText}"\n`
    : ''
}
You must retain also in context the properties 'user' pointed on previous prompts, to add, remove, or modify it/them accordingly.
`

const SELECTOR_SHAPE = ({
  selectors,
}) => `[validSelector] is a placeholder variable (see below), and its value can only be a pagedjs special selector or any of the following valid selectors: [${selectors}].

 This variable represents the HTML element whose CSS properties needs to be changed.

 A classic single tagname is not a valid selector, you must never use them.
 
 The only element types that exists in this context are the ones mentioned above. 
 
 But can be more than one element with the same selector, so, if you have for example: div#some-id > div > h2 as valid selector for the h2, and user request to change the first h2, you must do div#some-id > div:nth-of-type(1) > h2, It means you must target the container, not the h2 itself, this applies to all elements/selectors
 
 If the prompt refers to an HTML element and it's tagname matches one of these valid selectors use it, otherwise use "${'@page'}" as default value. 

["validSelector"] also can be followed by nth-of-type(n) or nth-child(n) or any other pseudo-selectors, but ONLY if 'user' specifies a number for the element,
`

const CSS_FORMAT = `A well formed valid CSS string that will be the complete provided context stylesheet with the following: 
    - You must add, to the provided stylesheet, the required changes that 'user' requested.
    - Never remove declarations or rules that user has not requested to be removed from the original provided stylesheet.
    - if a declaration exists on the provided stylesheet apply the changes on that declaration, instead of creating a new one.
    - With this guides in mind you will always return a well formed valid CSS string including line breaks (/n) and indentation (/t)
`

const TEXT_CONTENT_FORMAT = `A string that can be either the text of the element in context with the modifications user requested, or a new text if user request to change the whoule text
`

const CSS_LIMITS = `Use hex for colors. 'user' can request to mix colors: for example if the color is #000000 and 'user' asks for a litle more of blue you have to mix the hex values acordingly

You cannot use individual properties, like ('background-image', 'background-color', 'border-color', ...etc); use shorthand properties instead.

font-family property values can never be with quotes, eg: don't use 'sans-serif' use sans-serif instead
`

const JSON_FORMAT = (
  providedText,
  isSingleElement,
) => `The output must be always in the following JSON format: {
  ${
    isSingleElement
      ? `"rules": {"validCSSProperty": "validCSSValue", ...moreValidCssPropertiesAndValues},
},`
      : `"css": "${CSS_FORMAT}",`
  }
${providedText ? `\n"textContent": ${TEXT_CONTENT_FORMAT},` : ''}
"feedback": you must provide here a string with the feedback: 
this string can contain:

- In case the user request can be fullfiled: The last changes that where applied, if there is a list, then provide a list.

- If 'user' ask for the value of a property on the css sheet context, respond in natural(non-technical) language, for example: The [property] of the [requested element by user] is [value].

- If user request information about valid css or pagedjs properties or values is expected a list of avaiable values or properties as output.${
  providedText
    ? '\n - If user request it, return the text from the element in context'
    : ''
}

- If none of the above, Ask user again to improve his prompt in order to help you to style or modify his book.

- Ensure the text is well formatted including line breaks (/n) and indentation (/t),
}
`

const IMPORTANT_NOTES = `
IMPORTANT: 

- The output must always be the expected valid JSON. 

- Ensure that each key is a string enclosed in double quotes and that each value is a valid CSS value, also enclosed in double quotes.

- If 'user' requests to change the styles to make the book look "like" or "similar" to a given reference:
     - Your scope must be pagedjs, starting from the @page rule. 
     - You must modify all necessary styles, including pagedjs rules.
     - It needs to be as detailed as possible, change colors, fonts, margins, padding, footers and any other pagedjs and css styles to achieve the most similar appearence.

- Your Response must be ALWAYS the expected valid JSON, never text, if you have something to say it must be on the feedback from the JSON object.
`

export const systemGuidelinesV2 = ({ ctx, sheet, selectors, providedText }) => {
  const isSingleElement = ctx.node.id !== 'assistant-ctx'
  return `${
    !isSingleElement
      ? TASK_AND_ROLE_DEFINITIONS
      : TASK_AND_ROLE_DEFINITIONS_SINGLE_ELEMENT(ctx.tagName)
  }

${CONTEXT(sheet, ctx.node.getAttribute('style'), providedText, isSingleElement)}

${CSS_LIMITS}${
    !isSingleElement ? `\n${SELECTOR_SHAPE({ ...ctx, selectors })}` : ''
  }
${JSON_FORMAT(providedText, isSingleElement)}

${IMPORTANT_NOTES}
`
}
