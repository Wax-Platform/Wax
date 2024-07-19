export const snippets = [
  {
    className: 'red-color',
    elementType: 'p',
    description: 'red color',
    classBody: 'color: red;',
  },
  {
    className: 'img-default',
    elementType: 'img',
    description: 'Default styles for images',
    classBody: 'width: 100%; height: auto; object-fit: contain;',
  },
  {
    className: 'excel-table',
    elementType: 'table',
    description:
      'Styles the table to resemble an Excel spreadsheet with professional styling.',
    classBody:
      "border-collapse: collapse; width: 100%;\n  th, td {\n    border: 1px solid #dddddd;\n    text-align: left;\n    padding: 8px;\n  }\n  th {\n    background-color: #f2f2f2;\n    color: #333;\n  }\n  tr:nth-child(even) {\n    background-color: #f9f9f9;\n  }\n  tr:hover {\n    background-color: #f1f1f1;\n  }\n  td {\n    font-family: Arial, sans-serif;\n  }\n  th {\n    font-family: 'Calibri', sans-serif;\n    font-weight: bold;\n  }\n",
  },
  {
    className: 'text-flow-around-image',
    elementType: 'any',
    description: 'Makes the text flow around the images',
    classBody: `img, figure, picture, svg {\n\tfloat: left;\n\tmargin-right: 2ch;\n}\np {\n\ttext-align: justify;\n}`,
  },
  {
    className: 'scale',
    elementType: 'any',
    description: 'scales the element',
    classBody: 'transform: scale(1.1);',
  },
  {
    className: 'grayscale',
    elementType: 'any',
    description: 'grayscale the element',
    classBody: 'filter: grayscale(100%);',
  },
  {
    className: 'quoted-text',
    elementType: 'blockquote',
    description: 'Distinctive styling for quoted text',
    classBody:
      'font-style: italic; font-size: 14px; margin-left: 20px; padding: 10px 15px; border-left: 5px solid #ccc;',
  },
  {
    className: 'heading-styles',
    elementType: 'h1, h2, h3, h4, h5, h6',
    description: 'Standardized heading styles',
    classBody:
      'h1 { font-size: 32px; margin-top: 30px; } h2 { font-size: 28px; margin-top: 25px; } h3 { font-size: 24px; margin-top: 20px; } h4 { font-size: 20px; margin-top: 15px; } h5 { font-size: 18px; margin-top: 10px; } h6 { font-size: 16px; margin-top: 5px; }',
  },
  {
    className: 'subtle-heading-underline',
    elementType: 'h1, h2, h3, h4, h5, h6',
    description: 'Subtle underline for headings',
    classBody:
      'text-decoration: none; border-bottom: 1px solid #000; padding-bottom: 5px;',
  },
  {
    className: 'book-title',
    elementType: 'h1',
    description: 'Styling for book titles',
    classBody: 'font-size: 36px; font-weight: bold; margin-bottom: 20px;',
  },
  {
    className: 'author-name',
    elementType: 'h2',
    description: 'Styling for author names',
    classBody: 'font-size: 24px; font-weight: bold; margin-bottom: 15px;',
  },
  {
    className: 'chapter-title',
    elementType: 'h3',
    description: 'Styling for chapter titles',
    classBody: 'font-size: 22px; font-weight: bold; margin-bottom: 10px;',
  },
  {
    className: 'section-label',
    elementType: 'h4',
    description: 'Styling for section labels',
    classBody: 'font-size: 18px; font-weight: bold; margin-bottom: 5px;',
  },
  {
    className: 'emphasize-word',
    elementType: 'span',
    description: 'Highlighting emphasized words',
    classBody: 'font-weight: bold; color: #007bff;',
  },
  {
    className: 'magazine-article',
    elementType: 'article',
    description: 'General styling for magazine articles',
    classBody: 'max-width: 800px; margin: 0 auto; padding: 20px;',
  },
  {
    className: 'article-paragraph',
    elementType: 'p',
    description: 'Styling for article paragraphs',
    classBody: 'font-size: 16px; line-height: 1.5; margin-bottom: 10px;',
  },
  {
    className: 'academic-paragraph',
    elementType: 'p',
    description: 'Styling for academic paragraphs',
    classBody:
      "font-size: 14px; line-height: 1.6; margin-bottom: 8px; font-family: 'Times New Roman', Times, serif;",
  },
  {
    className: 'highlighted-phrase',
    elementType: 'span',
    description: 'Highlighting phrases within paragraphs',
    classBody: 'background-color: yellow; font-weight: bold; padding: 2px 5px;',
  },
  {
    className: 'cited-reference',
    elementType: 'cite',
    description: 'Styling for cited references',
    classBody: 'font-style: italic; font-size: 13px; color: #666;',
  },
  {
    className: 'list-item',
    elementType: 'li',
    description: 'Styling for list items',
    classBody: 'margin-bottom: 5px; padding-left: 20px; font-size: 14px;',
  },
  {
    className: 'block-quote',
    elementType: 'blockquote',
    description: 'Styling for block quotes',
    classBody:
      'font-style: italic; font-size: 18px; margin-left: 20px; padding: 10px 15px; border-left: 5px solid #ccc;',
  },
  {
    className: 'small-print',
    elementType: 'p',
    description: 'Styling for small print or footnotes',
    classBody:
      'font-size: 11px; color: #888; margin-top: -10px; margin-bottom: 10px;',
  },
  {
    className: 'legal-text',
    elementType: 'p',
    description: 'Styling for legal text',
    classBody:
      'font-size: 12px; line-height: 1.4; margin-bottom: 5px; color: #555;',
  },
  {
    className: 'definition-term',
    elementType: 'dfn',
    description: 'Styling for definition terms',
    classBody: 'font-weight: bold; font-size: 14px; color: #0056b3;',
  },
  {
    className: 'example-code',
    elementType: 'pre',
    description: 'Styling for example code blocks',
    classBody:
      'background-color: #f5f5f5; font-family: monospace; padding: 10px; overflow-x: auto;',
  },
  {
    className: 'responsive-image',
    elementType: 'img',
    description: 'Responsive image scaling',
    classBody: 'max-width: 100%; height: auto;',
  },
  {
    className: 'image-gallery-grid',
    elementType: 'div',
    description: 'Grid layout for image gallery',
    classBody:
      'display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;',
  },
  {
    className: 'polaroid-effect',
    elementType: 'img',
    description: 'Polaroid-style image effect',
    classBody:
      'border: 10px solid white; box-shadow: 5px 5px 15px rgba(0,0,0,0.3);',
  },
  {
    className: 'blur-background',
    elementType: 'img',
    description: 'Background blur effect for images',
    classBody: 'filter: blur(5px);',
  },
  {
    className: 'hover-animation',
    elementType: 'img',
    description: 'Hover animation for images',
    classBody:
      'transition: transform 0.3s ease-in-out; :hover { transform: scale(1.05); }',
  },
  {
    className: 'rounded-corners',
    elementType: 'img',
    description: 'Rounded corners for images',
    classBody: 'border-radius: 15px;',
  },
  {
    className: 'shadow-effect',
    elementType: 'img',
    description: 'Drop shadow effect for images',
    classBody: 'box-shadow: 10px 10px 5px grey;',
  },
  {
    className: 'centered-image',
    elementType: 'img',
    description: 'Centering an image',
    classBody: 'display: block; margin-left: auto; margin-right: auto;',
  },
  {
    className: 'darken-on-hover',
    elementType: 'img',
    description: 'Darken image on hover',
    classBody: ':hover { filter: brightness(50%); }',
  },
  {
    className: 'gradient-border',
    elementType: 'img',
    description: 'Gradient border around images',
    classBody:
      "border: 5px solid transparent; border-image-slice: 1; border-radius: 15px; :after { content: ''; position: absolute; top: -5px; left: -5px; bottom: -5px; right: -5px; border: 5px solid transparent; border-image-source: linear-gradient(to right, red, blue); z-index: -1; }",
  },
  {
    className: 'gradient-heading',
    elementType: 'h1',
    description: 'Text color gradients for headings',
    classBody:
      'background-clip: text; -webkit-background-clip: text; color: transparent; font-size: 36px; line-height: 40px;',
  },
  {
    className: 'shadow-text',
    elementType: 'h1',
    description: 'Adding shadows to text',
    classBody: 'text-shadow: 2px 2px 4px rgba(0,0,0,0.5);',
  },
  {
    className: 'responsive-headings',
    elementType: 'h1',
    description: 'Responsive heading design',
    classBody: 'font-size: clamp(1rem, 5vw, 1.5rem);',
  },
  {
    className: 'multi-shadows',
    elementType: 'h1',
    description: 'Multiple colored text shadows',
    classBody:
      'text-shadow: 2px 2px 4px #ff0000, 4px 4px 6px #00ff00, 6px 6px 8px #0000ff;',
  },
  {
    className: 'uppercase-heading',
    elementType: 'h1',
    description: 'Uppercase text for headings',
    classBody: 'text-transform: uppercase;',
  },
  {
    className: 'italic-heading',
    elementType: 'h1',
    description: 'Italic text for headings',
    classBody: 'font-style: italic;',
  },
  {
    className: 'bold-heading',
    elementType: 'h1',
    description: 'Bold text for headings',
    classBody: 'font-weight: bold;',
  },
  {
    className: 'underlined-heading',
    elementType: 'h1',
    description: 'Underlined text for headings',
    classBody: 'text-decoration: underline;',
  },
]
