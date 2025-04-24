import { onEntries } from './utils'

export const srcdoc = (scope, css, template, scrollPos) => /* html */ `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js"></script>
      <style>
        ${template}
        ${css.replace('#body', 'body') || ''}
      </style>
    </head>
    <body>
      ${scope.outerHTML.replace('contenteditable="true"', '')}
      <script>
        document.addEventListener("DOMContentLoaded", () => {
          const scopeIsReady = document.getElementById("css-assistant-scope")

          try {
            scopeIsReady && PagedPolyfill.preview(scopeIsReady);
          }
          catch (e) { console.log(e) }
          setTimeout(() => document.documentElement.scrollTo(0, ${scrollPos}), 100)
        });
          document.addEventListener("scroll", () => {
            if(document.documentElement.scrollTop < 10) {
              document.documentElement.scrollTo(0, 10)
            }
          })
      </script>
    </body>
    </html>
`

export const removeStyleAttribute = node => {
  if (!node) return
  const childs = [...node.children]
  node.removeAttribute('style')
  childs.length > 0 && childs.forEach(removeStyleAttribute)
}

// can be useful for setting the inlinestyles
export const cssStringToObject = cssString => {
  const cssObject = {}
  const ruleSets = cssString.split('}')

  ruleSets.forEach(ruleSet => {
    if (!ruleSet) return
    const [selector = '', rules = ''] = ruleSet.split('{')

    const trimmedSelector = selector.trim()
    const trimmedRules = rules.trim().slice(0, -1)

    const declarations = trimmedRules.split(';')

    cssObject[trimmedSelector] = {}

    declarations.forEach(declaration => {
      const [property = '', value = ''] = declaration.split(':')

      if (property && value) {
        cssObject[trimmedSelector][property.trim()] = value.trim()
      }
    })
  })
  return cssObject
}

export const setInlineStyle = (node, styles) => {
  const nodeRef = node
  onEntries(styles, (k, v) => {
    nodeRef.style[k] = v
  })
}

export const setImagesDefaultStyles = node => {
  ;['picture', 'img', 'figure'].includes(node.localName) &&
    setInlineStyle(node, {
      objectFit: 'contain',
      width: '100%',
      height: 'auto',
    })
}

export const getScrollPercent = node =>
  (node.scrollTop / (node.scrollHeight - node.offsetHeight)) * 100

export const setScrollFromPercent = (node, percentage) =>
  (percentage * node.scrollHeight) / 100
