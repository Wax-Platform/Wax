/* eslint-disable no-await-in-loop */
const cheerio = require('cheerio')
const mathJaxAPI = require('mathjax-node')

const convertTexToValidForm = async (tex, target) => {
  try {
    return mathJaxAPI.typeset({
      math: tex,
      format: 'TeX', // or "inline-TeX", "MathML"
      svg: target === 'svg', // or svg:true, or html:true
      mml: target === 'mml',
    })
  } catch (e) {
    throw new Error(e)
  }
}

const convertedContent = async (content, target) => {
  try {
    mathJaxAPI.start()
    const $ = cheerio.load(content)
    const mathInline = $('math-inline').toArray()
    const mathDisplay = $('math-display').toArray()

    for (let i = 0; i < mathInline.length; i += 1) {
      const $elem = $(mathInline[i])
      let span

      if (target === 'svg') {
        const { svg } = await convertTexToValidForm($elem.text(), target)

        span = $('<span/>').attr('class', 'math-node').html(svg)
      } else {
        const { mml } = await convertTexToValidForm($elem.text(), target)
        span = $('<span/>').attr('class', 'math-node').html(mml)
      }

      $elem.replaceWith(span)
    }

    for (let i = 0; i < mathDisplay.length; i += 1) {
      const $elem = $(mathDisplay[i])

      let div

      if (target === 'svg') {
        const { svg } = await convertTexToValidForm($elem.text(), target)

        div = $('<div/>').attr('class', 'math-node').html(svg)
      } else {
        const { mml } = await convertTexToValidForm($elem.text(), target)
        div = $('<div/>').attr('class', 'math-node').html(mml)
      }

      $elem.replaceWith(div)
    }

    return $('body').html()
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = convertedContent
