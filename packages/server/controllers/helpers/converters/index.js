const cleanHTML = require('./cleanHTML')
const cleanDataAttributes = require('./cleanDataAttributes')
// const vivliostyleDecorator = require('./vivliostyleDecorator')
const epubDecorator = require('./epubDecorator')
const fixFontFaceUrls = require('./fixFontFaceUrls')
const convertedContent = require('./texToValidHTML')

module.exports = {
  cleanHTML,
  cleanDataAttributes,
  // vivliostyleDecorator,
  epubDecorator,
  fixFontFaceUrls,
  convertedContent,
}
