const csstree = require('css-tree')
const beautifulCSS = require('js-beautify').css
const path = require('path')

module.exports = (content, fonts, where) => {
  const ast = csstree.parse(content)
  const allowedFiles = ['otf', 'woff', 'woff2', 'ttf']

  csstree.walk(ast, node => {
    if (node.type === 'Url') {
      const temp = node.value.value.replace(/['"]+/g, '') // strip single or double quotes
      const ext = path.extname(temp).split('.')[1]

      if (allowedFiles.indexOf(ext) !== -1) {
        for (let i = 0; i < fonts.length; i += 1) {
          const pattern = `\\b${fonts[i].originalFilename}\\b`
          const regExp = new RegExp(pattern, 'g')

          if (regExp.test(temp)) {
            /* eslint-disable no-param-reassign */
            node.value.value = `"${where}/${fonts[i].originalFilename}"`
            /* eslint-enable no-param-reassign */
          }
        }
      }
    }
  })
  return beautifulCSS(csstree.generate(ast))
}
