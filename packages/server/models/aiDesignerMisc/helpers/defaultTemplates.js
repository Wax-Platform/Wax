module.exports = docId => [
  {
    name: 'default',
    relatedDocuments: [docId ?? '*'],
    css: /* css */ `
:root {
    --color-background: #fff;
    --color-marginBox: transparent;
    --pagedjs-crop-color: black;
    --pagedjs-crop-shadow: white;
    --pagedjs-crop-stroke: 1px;
    --font-family: Arial, Helvetica, sans-serif;
}

  @page {
      background: var(--color-background);
      font-family: var(--font-family);
      margin:  20mm;
      size: A4;

      @bottom-center {
        content: string(title);
        font-size: 11pt;
        color: #707070;
      }
    }

    @page :left {
      @bottom-left-corner {
        content: counter(page);
        text-align: center;
      }
    }

    @page :right {
      @bottom-right-corner {
        content: counter(page);
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
`,
  },
]
