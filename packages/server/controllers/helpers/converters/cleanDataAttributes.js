const cheerio = require('cheerio')

const cleanDataAttributes = content => {
  const $ = cheerio.load(content)
  $('section *').each((i, elem) => {
    const $elem = $(elem)

    if ($elem.attr('data-id')) {
      $elem.removeAttr('data-id')
    }

    if ($elem.attr('data-params')) {
      $elem.removeAttr('data-params')
    }

    if ($elem.attr('data-track')) {
      $elem.removeAttr('data-track')
    }

    if ($elem.attr('data-group')) {
      $elem.removeAttr('data-group')
    }

    if ($elem.attr('data-viewid')) {
      $elem.removeAttr('data-viewid')
    }

    if ($elem.attr('data-type')) {
      $elem.removeAttr('data-type')
    }

    if ($elem.attr('data-user')) {
      $elem.removeAttr('data-user')
    }

    if ($elem.attr('data-username')) {
      $elem.removeAttr('data-username')
    }

    if ($elem.attr('data-date')) {
      $elem.removeAttr('data-date')
    }

    if ($elem.attr('data-before')) {
      $elem.removeAttr('data-before')
    }

    if ($elem.attr('data-after')) {
      $elem.removeAttr('data-after')
    }
  })

  $('ul').each((i, elem) => {
    const $elem = $(elem)

    if ($elem.attr('custom') || $elem.attr('custom', '')) {
      $elem.removeAttr('custom')
    }
  })

  $('ol').each((i, elem) => {
    const $elem = $(elem)

    if ($elem.attr('custom') || $elem.attr('custom', '')) {
      $elem.removeAttr('custom')
    }
  })

  return $.html('body')
}

module.exports = cleanDataAttributes
