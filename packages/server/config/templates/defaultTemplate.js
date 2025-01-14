const fs = require('fs')
const path = require('path')

const cssFilePath = path.join(__dirname, 'css/defaultTemplate.css')
const pagedJsCss = fs.readFileSync(cssFilePath, 'utf8')

module.exports = {
  displayName: 'Default Template',
  root: {
    colorBackground: '#fff',
    colorMarginBox: 'transparent',
    pagedjsCropColor: 'black',
    pagedjsCropShadow: 'white',
    pagedjsCropStroke: '1px',
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
  pagedJsCss,
}
