import { getSnippetsByNode } from './helpers'

export const htmlTagNames = {
  a: 'Link',
  abbr: 'Shortened',
  address: 'Location',
  area: 'Area',
  article: 'Article',
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
export const ModelsList = {
  openAi: [{ label: 'GPT-4o', model: 'gpt-4o' }],
  mistral: [
    { label: 'Mistral small', model: 'mistral-small-latest' },
    { label: 'Mistral large', model: 'mistral-large-latest' },
    { label: 'Mistral 8x22b', model: 'open-mixtral-8x22b' },
  ],
}
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


/* To define how the book look on the screen: */
@media screen, pagedjs-ignore {
    body {
        background-color: #fbf8fd;
    }

      * {
        transition: outline 0.5s, outline-offset 0.5s;
        outline: 2px dashed #0000;
        outline-offset: 12px;
      }   
      
      .selected-aidctx {
        outline: 1px dashed #a34ba1;
        outline-offset: 8px;
      }

    .pagedjs_pages {
        display: flex;
        width: calc(var(--pagedjs-width) * 2);
        flex: 0;
        flex-wrap: wrap;
        margin: 0 auto;

    }

    .pagedjs_page {
      box-shadow: 0 0 8px #0004;
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
        box-shadow: 0 0 0 1px transparent;
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

    /* show the margin-box 

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
*/

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

export const finishReasons = {
  content_filter: 'The content was filtered due to violating content policies.',
  length: 'The content exceeded the maximum allowed length.',
  stop_token:
    'The completion was stopped by encountering a specified stop token.',
  system_error:
    'An unexpected system error occurred during the completion process.',
  timeout: 'The completion process timed out before completion.',
  unknown: 'An unknown error occurred during the completion process.',
}

const taskAndRoleDefs = {
  role: `You are a CSS, JS and HTML expert with a vast knowledge on pagedjs library ('https://pagedjs.org').`,
  task: `Your task is to assist 'user' with the design of a article.

'user' will tell you in natural language the changes he wants to make on the article's design.

You must interpret and translate the 'user' request, into css properties/values and html tags or selectors.

Keep in mind that 'user' don't know how to code, so the prompt must be analysed carefully in order to complete the task.

IMPORTANT: 
- You must be aware that 'user' can select elements by click, and currently is no selected element, you must inform 'user' that if he selects a element you can change the content of the selected element and/or create new elements.

- You must never say to user what to code, and never give him instructions.

- The article is designed with pagedjs, so you will need to apply pagedjs css in some cases.
`,
}

const taskAndRoleDefsSE = tag => ({
  role: `You are a CSS and HTML expert and a professional in letters, grammar and language.`,
  task: `Your task is to assist 'user' to style this ${tag}(${htmlTagNames[tag]}) element.
You must interpret and translate the 'user' request, into css properties/values.
Keep in mind that 'user' don't know how to code, so the prompt must be analysed carefully in order to complete the task.

IMPORTANT: 
- You must never say to user what to code, and never give him instructions.

- Your mission and prupose is to style a ${htmlTagNames[tag]}, and help with any modifications required on the html content.

- Your response must be ALWAYS the valid JSON (described below), NEVER text.
`,
})

const cssWriteRules = ({ selectors, waxClass }) => {
  const editorSelector = waxClass || 'div#assistant-ctx'

  return `${`- This are all elements in the context of the artcle, you must change them as needed: ${[
    ...new Set(selectors),
  ].join(', ')}.`}
- All selectors except for pagedjs special selectors must be prefixed with the main container selector, like this: 
  ${editorSelector} [tagname] {
    ...rules
  }
  ${editorSelector} [another Tagname] {
    ..rules
  }
  ... and so on as needed.
`
}

const cssRules = `Consider the following when writing css: 
  - Use hex for colors. 'user' can request to mix colors: for example if the color is #000000 and 'user' asks for a litle more of blue you have to mix the hex values acordingly

  - You cannot use individual properties, like ('background-image', 'background-color', 'border-color', ...etc); use shorthand properties instead.

  - font-family property values can never be with quotes, eg: don't use 'sans-serif' use sans-serif instead`

const cssDescription = `Only if user requested a change on the css: A well formed valid CSS string that will be the complete provided context stylesheet with the following: 
  - You must add, to the provided stylesheet, the required changes that 'user' requested.
  - if a declaration exists on the provided stylesheet apply the changes on that declaration, instead of creating a new one.
  - With this guides in mind you will always return a well formed valid CSS string including line breaks and indentation
`

const contentDescription = `Only in case that user request a change, improvement or replacement that requires to modify element's inner html content: 
- A string with the html of the element in context with the modifications user requested
- In some cases, you must resolve the user request creating new elements, eg: if user request: "paint [x] word/s into a yellow background" you must wrap those words in a span and add or modify a snippet to include the nested declaration for the new span/s styles.
- NEVER remove/add elements or text parts from the original text/html unless 'user' requested to do that.
- You must be precise and carefully with this, if you remove content from the original it may not be recoverable.

Otherwise omit this property
`

const snippetShape = (ctx, marked, snippets) => {
  return `If user request a style change: A object with the following shape(described below).
  Consider this before building the object:
  - This Object is a snippet to create a css class with nested declarations.
${
  marked
    ? `- Based on user's request, you must udpate the following snippet returning the same properties, keeping the same className and updating only the following properties: "description"(if needed) and "classBody", dont remove the properties if user does not specify it. This is the snippet to update: ${JSON.stringify(
        snippets[snippets.findIndex(s => s.className === marked)],
      )}`
    : `- You must create a new snippet from the ground, without mixing the styles requested on previous prompts. this means that the new snippet only must address changes requested on the last prompt only`
}
  This is the expected object properties description:
  {
    className: ${
      marked ||
      `the name of the class, it must be short, in kebab case and it must describe the changes on the element in context, in this case ${
        htmlTagNames[ctx.node.localName] || ctx.node.localName
      }`
    },
    elementType: - The tag name of element in context, in this case: '${
      ctx.node.localName
    }'
    description: - The description of the styles applied, it most be acurate. (use the word snippet instead of class)
    classBody: 
      - A valid and well-formed and formatted(with newlines) css text containing the class body: 
      - It must have nested declarations for childs styling.
      - don't add the either className or the initial and end curly brackets(only add them on the child's nested declarations)
      - if the element in context has childs you must style them within the nested declarations
  }
  `
}

const insertHtmlShape = `if user request to create or add a new element this property must be an object with the following shape: 
"{ 
  "position": - if you could interpret where 'user' wants to create the new dom element this property will be present and its value can be one of the following strings: ["beforebegin","afterbegin","beforeend" or "afterend"]. If user didn't specify a position just dont return this property,
  "html": if you could interpret what type of element or elements 'user' wants to create or add; a valid html string; otherwise omit this property
}" 
Otherwise, omit this property`

const feedBackDescription =
  providedText => `you must provide here a string with the feedback: 
this string can contain:

- In case the user request can be fullfiled: The last changes that where applied, if there is a list, then provide a list.

- If 'user' ask for the value of a property on the css sheet context, respond in natural(non-technical) language, for example: The [property] of the [requested element by user] is [value].

- If user request information about valid css or pagedjs properties or values is expected a list of avaiable values or properties as output.${
    providedText
      ? '\n - If user request it, return the text from the element in context (extract it from the html, and return only the text)'
      : ''
  }
- If 'user' requested image generation (callDallE), always provide feedback providing info about the image that will be generated.

- Allways provide feedback here about the changes made and/or images generated${
    providedText
      ? '.'
      : '. Inform user that his image has been generated succesfully and that he can access to it through the images manager'
  }.

- If none of the above you must ask user to improve his prompt in order to help you to style or modify his article.

- Ensure the text is a well formed and fancy markdown string, add emojis and diferent types of text: headings, strongs, etc.`

const notes = [
  `Your response must always be the expected valid JSON with the expected shape so the changes can be applied, you must not return the object descriptions, have a second thought on this.`,

  `Ensure that each key is a string enclosed in double quotes and that each value is a valid CSS value, also enclosed in double quotes.`,

  `If 'user' requests to change the styles to make the article look "like" or "similar" to a given reference:
    - Your scope must be pagedjs, starting from the @page rule.
    - You must modify all necessary styles and affect all selectors in the context of the article, including pagedjs rules.
    - It needs to be as detailed as possible, style all selectors in context, change colors, fonts, margins, padding, footers and any other pagedjs and css styles to achieve the most similar appearence (add as much details as possible).
`,
  `Always consider the previous prompts tasks completed successfully unless 'user' says the oposite.`,
  `VERY IMPORTANT: Ensure that your response is ALWAYS the expected valid JSON with the escaped quotes and well formatted to be parsed. Never respond with text, if you have something to say it must be on the feedback from the JSON object.
`,
]

const notesSE = [
  `Your response must always be the expected valid JSON with the expected shape so the changes can be applied, you must not return the object descriptions, have a second thought on this.`,
  cssRules,
  `If 'user' requests to change the styles to make the article look "like" or "similar" to a given reference:
    - You must create a new snippet including necessary styles for the element and its childs
    - You must add as much details as possible to achieve the most similar appearence`,
  `Always consider the previous prompts tasks completed successfully unless 'user' says the oposite.`,
  `VERY IMPORTANT: Ensure that your response is ALWAYS the expected valid JSON, never text, if you have something to say it must be on the feedback from the JSON object.
`,
]

const generatedContext = (
  isSingleElement,
  sheet,
  snippets,
  providedText,
  ctx,
  selectors,
  waxClass,
) => {
  return `${
    !isSingleElement && sheet
      ? `This style sheet is the css context:\nBEGIN STYLESHEET:\n${sheet}\nEND STYLESHEET\n`
      : ''
  }${
    isSingleElement && snippets
      ? `\nThis are the classes that affect the styles of the element(and childs) in context: ${snippets}`
      : ''
  }${
    isSingleElement && providedText
      ? `\nThis is the html content of the element in context: "${providedText}"\n`
      : ''
  }${
    !isSingleElement
      ? `\n${cssWriteRules({ ...ctx, selectors, waxClass })}`
      : ''
  }
`
}

const callDallEDescription = `If 'user' requests to create a image, it must be the description of the image to give to dall-e, otherwise omit this property(not present in the response).`

export const AiDesignerSystem = ({
  ctx,
  sheet,
  selectors,
  providedText,
  markedSnippet,
  snippets,
  waxClass,
}) => {
  const isSE = ctx?.aidctx !== 'aid-ctx-main'

  const context = generatedContext(
    isSE,
    sheet,
    !isSE && getSnippetsByNode(ctx.node, snippets),
    providedText,
    ctx,
    selectors,
    waxClass,
  )

  const { role, task } = isSE ? taskAndRoleDefsSE(ctx.tagName) : taskAndRoleDefs

  const shape = {
    feedback: feedBackDescription(providedText, isSE),
    callDallE: callDallEDescription,
    ...(isSE
      ? {
          snippet: snippetShape(ctx, markedSnippet, snippets),
          insertHtml: insertHtmlShape,
          content: contentDescription,
        }
      : {
          css: cssDescription,
        }),
  }

  isSE && !providedText && delete shape.content

  const systemPayload = {
    role,
    task,
    context,
    notes: isSE ? notesSE : notes,
    response: {
      type: 'json_object',
      shape: JSON.stringify(shape),
    },
  }

  return systemPayload
}

export const ragSystem = {
  role: `You are a part of a RAG system, called "Talk to your documents". 'user' will ask questions about documents, users can upload these documents and ask you about them.`,
  task: `user queries will first search for a embeddings vector db and then your context will be augmented, and then you must answer to that query using the following document fragments as context(see below).`,
  response: {
    type: 'text',
    shape: `Your responses must be in markdown format, well structured and fancy`,
  },
  notes: [
    `If 'user' inquieres about your purpose or ask for guidance on how to interact with you, or if you're introducing yourself, you must provide to 'user' the needed information to use the app, so you can be more helpful. Expose the name of this system. Note: The "Talk to your documents" system is not related in any way to the documents provided in the context `,
    `You must never reveal that you are using this context in the background`,
    `You must never inform 'user' that you are using this context in the background`,
  ],
}
