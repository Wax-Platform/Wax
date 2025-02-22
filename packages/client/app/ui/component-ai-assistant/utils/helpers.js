import { merge } from 'lodash'
// import LanguageDetect from 'languagedetect'

// import DetectLanguage from 'detectlanguage'
import { onEntries, safeCall } from './utils'

// const detectlanguage = new DetectLanguage('16d59c67b2a8538c31bbd7c129fe0f2d')

// const lngDetector = new LanguageDetect()

export const srcdoc = (htmlSrc, css, template, scrollPos) => /* html */ `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js"></script>
            <script>

        window.PagedConfig || {
		auto: true,
    before: window.parent.postMessage({loaded:false}, '*'),
		after: window.parent.postMessage({loaded:true}, '*'),
	};

      </script>
      <style>
        ${template}
        ${css.replace('#body', 'body') || ''}
      </style>
    </head>
    <body>
      ${htmlSrc}

    </body>
    </html>
`

export const copyTextContent = async element => {
  if (!element) return
  await navigator.clipboard.writeText(element.textContent)
}

export function parseContent(htmlString, cb) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlString, 'text/html')

  doc.querySelectorAll('*').forEach(element => {
    const text = element.textContent

    if (text) {
      const isTibetan = /[\u0F00-\u0FFF]/.test(text)
      //   const lng = text && lngDetector.detect(text)[0]
      //   const lngFound = lng && lngDetector.getLanguages().includes(`${lng[0]}`)
      //   lngFound && element.classList.add(`${lng[0]}`)
      isTibetan && element.classList.add('tibetan')
    }

    // text && console.log(detectlanguage.detect(text))
    // detectlanguage.detect(text).then(function (result) {
    // 	console.log(
    // 		`${ansi("yellow")}${result[0].language} ${ansi("white")}${text}`
    // 	);
    // });
    element.removeAttribute('style')
  })

  safeCall(cb)(doc)

  const serializer = new XMLSerializer()
  const cleanedHtmlString = serializer.serializeToString(doc)

  return cleanedHtmlString
}

// can be useful for setting the inlinestyles
export const cssStringToObject = cssString => {
  const cssObject = {}

  if (cssString.includes('{')) {
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
  } else {
    cssString.split(';').forEach(rule => {
      const [ruleName, value] = rule.split(':')
      if (!ruleName || !value) return
      cssObject[ruleName.trim()] = value.trim()
    })
  }

  return cssObject
}

export const setInlineStyle = (node, styles) => {
  if (typeof styles === 'object' && !Array.isArray(styles)) {
    const nodeRef = node
    onEntries(styles, (k, v) => {
      nodeRef.style[k] = v
    })
  }
}

export const setImagesDefaultStyles = node => {
  ;['picture', 'img', 'figure'].includes(node.localName) &&
    setInlineStyle(node, {
      objectFit: 'contain',
      width: '100%',
      height: 'auto',
    })
}

// #region SNIPPETS
export const getNodes = (src, selector, prop) =>
  [...src.querySelectorAll(selector)]?.map(el => el[prop] ?? el)
export const snippetsToCssText = (snippets, prefix = 'div#assistant-ctx ') =>
  snippets
    .map(({ className, description, classBody }) =>
      className
        ? `
    /* ${description} */
    ${prefix + className} {
      ${classBody}
    }
    `
        : '',
    )
    .join('\n')

export const getSnippetsByNode = (node, snippets) => {
  if (!node) return
  const classList = [...node.classList].map(c => c)

  const snips = snippets
    .map(s => classList.includes(s.className) && s)
    .filter(Boolean)

  //   console.log(snips)
  return snippetsToCssText(snips)
}

export const getSnippetsByElementType = (snippets, elementType = '*') =>
  Object.entries(snippets).reduce((acc, [k, v]) => {
    if (v.elementType === elementType || elementType === '*') {
      acc[k] = v
    }

    return acc
  }, {})

export const newSnippet = (snippet, snippetsKeys) => {
  const { className, ...rest } = snippet
  const snippetName = safeId(className, snippetsKeys)

  return { className: snippetName, ...rest }
}

export const updateSnippet = (snippet, allSnippets) =>
  merge({}, allSnippets, snippet)

export const addElement = (parentElement, options) => {
  const { position = 'afterend', html } = options
  parentElement.insertAdjacentHTML(position, html)
}

// #endregion SNIPPETS

export const safeId = (prefix, existingIds) => {
  let proposedId = 1

  while ([...existingIds].includes(`${prefix}-${proposedId}`)) {
    proposedId = Number(proposedId + 1)
  }

  return `${prefix}-${proposedId}`
}

export const toSnake = key =>
  key
    .split(/(?=[A-Z])/)
    .map(word => word?.toLowerCase())
    .join('-')

export const getScrollPercent = node =>
  (node.scrollTop / (node.scrollHeight - node.offsetHeight)) * 100

export const setScrollFromPercent = (node, percentage) =>
  (percentage * node.scrollHeight) / 100

export const safeIndex = (index, direction, list, min = 0) => {
  let finalIndex
  const max = list.length - 1

  const options = {
    down: () => (index > max ? (finalIndex = min) : (finalIndex = index)),
    up: () => (index < min ? (finalIndex = max) : (finalIndex = index)),
    'up-stop': () => (index < min ? (finalIndex = min) : (finalIndex = index)),
    'down-stop': () =>
      index > max ? (finalIndex = max) : (finalIndex = index),
  }

  safeCall(options[direction])
  return finalIndex
}

export const saveToLs = (save, name) => {
  window.localStorage.setItem(name, JSON.stringify(save))
}

export const loadFromLs = name => {
  const item = window.localStorage.getItem(name)
  return JSON.parse(item)
}

export const handleImgElementSelection = async ({
  target,
  setUserImages,
  getImageUrl,
  imageKey,
}) => {
  let src = ''
  const imgkey = target?.dataset?.imgkey ?? imageKey

  if (target) {
    const { src: baseSrc } = target
    src = baseSrc
  }

  if (imgkey) {
    await getImageUrl(imgkey, ({ data: { getImageUrl: url } }) => {
      src = url
      target && target.setAttribute('src', url)
    })
  }

  if (!setUserImages) return src

  const ext = src?.split('.')?.pop()

  if (!ext || !['svg'].includes(ext)) {
    const response = await fetch(src)
    const blob = await response.blob()

    const file = new File([blob], src, {
      type: blob.type,
    })

    if (file) {
      const reader = new FileReader()

      reader.onload = ({ target: { result: base64Img } }) => {
        setUserImages({ base64Img, src })
      }

      reader.readAsDataURL(file)
    }
  }

  return src
}

export const formatDate = date => new Date(date).toLocaleString()

export const ansi = color => {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    underline: '\x1b[4m',
    blink: '\x1b[5m',
    invert: '\x1b[7m',
  }

  return typeof color === 'string'
    ? colors[color]
    : color.map(c => ansi(c)).join('')
}

export const safeParse = (str, fallbackKey) => {
  try {
    const parsed = JSON.parse(str)
    return parsed
  } catch (e) {
    return { [fallbackKey]: str }
  }
}

export const getPreviewIframe = () =>
  document.querySelector('#pagedjs-preview-iframe')
export const getSnippetsStyleTag = () =>
  getPreviewIframe()?.contentDocument?.body?.querySelector('#snippets')

export const createOrUpdateStyleSheet = content => {
  if (!content || !getPreviewIframe()) return
  const cssContent = content.map(snippet => snippet.classBody).join('\n')
  if (getSnippetsStyleTag()) {
    getSnippetsStyleTag().textContent = cssContent
    return
  }
  const style = document.createElement('style')
  style.id = 'snippets'
  style.textContent = cssContent
  getPreviewIframe()?.contentDocument?.body?.appendChild(style)
}
