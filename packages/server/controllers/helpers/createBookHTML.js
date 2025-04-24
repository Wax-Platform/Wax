const cheerio = require('cheerio')

const { generatePagedjsContainer } = require('./htmlGenerators')

const createBookHTML = async book => {
  book.divisions.forEach(division => {
    division.bookComponents.forEach(bookComponent => {
      const { content } = bookComponent
      const $ = cheerio.load(content)

      $('img').each((_, node) => {
        const $node = $(node)
        const dataFileId = $node.attr('data-fileid')
        const srcExists = $node.attr('src')

        if (dataFileId) {
          if (srcExists) {
            $node.removeAttr('src') // remove src as it is irrelevant/volatile info
          }
        }
      })

      $('figure').each((_, node) => {
        const $node = $(node)
        const srcExists = $node.attr('src')

        if (srcExists) {
          $node.removeAttr('src')
        }
      })
      /* eslint-disable no-param-reassign */
      bookComponent.content = $.html('body')
      /* eslint-enable no-param-reassign */
    })
  })

  const output = cheerio.load(generatePagedjsContainer(book.title))
  book.divisions.forEach(division => {
    division.bookComponents.forEach(bc => {
      const { content } = bc
      output('body').append(content)
    })
  })

  return output.html()
}

module.exports = createBookHTML
