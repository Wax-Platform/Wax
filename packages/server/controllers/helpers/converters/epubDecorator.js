const cheerio = require('cheerio')
const config = require('config')

const ketidaToEPUBPropertiesMapper = {
  front: 'frontmatter',
  back: 'backmatter',
  body: 'bodymatter',
  chapter: 'chapter',
  part: 'part',
  toc: 'toc',
  introduction: 'introduction',
  preface: 'preface',
  appendix: 'appendix',
  endnotes: 'endnotes',
  cover: 'cover',
}

const ketidaExtra = {
  halftitle: 'halftitlepage',
  titlepage: 'titlepage',
}

const featureBookStructureEnabled =
  config.has('featureBookStructure') &&
  ((config.get('featureBookStructure') &&
    JSON.parse(config.get('featureBookStructure'))) ||
    false)

module.exports = (
  bookComponent,
  bookTitle,
  stylesheet,
  hasEndnotes,
  endNotesComponentId,
) => {
  const { content, componentType, division } = bookComponent
  const $ = cheerio.load(content)

  $('html').attr({
    xmlns: 'http://www.w3.org/1999/xhtml',
    'xmlns:epub': 'http://www.idpf.org/2007/ops',
    'xml:lang': 'en',
    lang: 'en',
  })
  $('<link/>')
    .attr('href', `../Styles/${stylesheet.originalFilename}`)
    .attr('type', 'text/css')
    .attr('rel', 'stylesheet')
    .appendTo('head')
  $('<title/>')
    .text(bookTitle || 'Untitled')
    .prependTo('head')
  $('body').attr({
    'xml:lang': 'en',
    'epub:type': ketidaToEPUBPropertiesMapper[division],
    lang: 'en',
  })
  $('nav').attr({
    'epub:type': ketidaToEPUBPropertiesMapper[componentType],
    role: `doc-${ketidaToEPUBPropertiesMapper[componentType]}`,
  })

  if (componentType !== 'toc') {
    if (ketidaToEPUBPropertiesMapper[componentType]) {
      $('section').attr({
        'epub:type': ketidaToEPUBPropertiesMapper[componentType],
        ...(componentType !== 'cover'
          ? {
              role: `doc-${ketidaToEPUBPropertiesMapper[componentType]}`,
            }
          : {}),
      })
    }

    if (ketidaExtra[componentType]) {
      $('section').attr({
        'epub:type': ketidaToEPUBPropertiesMapper[componentType],
      })
    }
  }

  $('.note-callout').each((i, elem) => {
    const $elem = $(elem)
    $elem.attr('epub:type', 'noteref')
    $elem.attr('role', 'doc-noteref')

    if (hasEndnotes) {
      const link = $elem.attr('href')

      $elem.attr('href', `comp-number-${endNotesComponentId}.xhtml${link}`)
    }
  })

  $('.footnote').each((i, elem) => {
    const $elem = $(elem)
    $elem.attr('epub:type', 'footnote')
  })
  $('.footnotes').each((i, elem) => {
    const $elem = $(elem)
    $elem.attr('epub:type', 'endnote')
  })

  $('.running-left').each((i, elem) => {
    const $elem = $(elem)
    $elem.remove()
  })
  $('.running-right').each((i, elem) => {
    const $elem = $(elem)
    $elem.remove()
  })

  if (componentType === 'toc') {
    $('li > a').each((i, elem) => {
      const $elem = $(elem)
      const link = $elem.attr('href')
      const clearedLink = link.substr(1)
      const nestedLink = clearedLink.split('_')

      // Check if there is a structure that represents nested element link
      if (nestedLink[1] && featureBookStructureEnabled) {
        $elem.attr('href', `../Text/${nestedLink[0]}.xhtml${link}`)
      } else {
        $elem.attr('href', `../Text/${clearedLink}.xhtml`)
      }
    })
  }

  return $.html()
}
