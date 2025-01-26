const fs = require('fs')
const path = require('path')

const cssFilePath = path.join(__dirname, 'css/defaultTemplate.css')
const rawCss = fs.readFileSync(cssFilePath, 'utf8')

module.exports = {
  status: 'public',
  category: 'system',
  displayName: 'Default Template',
  rawCss,
}
