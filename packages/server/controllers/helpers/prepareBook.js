/* eslint-disable array-callback-return */
/* eslint-disable no-case-declarations */
const cheerio = require('cheerio')
const config = require('config')
const findIndex = require('lodash/findIndex')
const isEmpty = require('lodash/isEmpty')

const {
  generateContainer,
  generateTitlePage,
  generateCopyrightsPage,
} = require('./htmlGenerators')

const {
  cleanHTML,
  cleanDataAttributes,
  convertedContent,
} = require('./converters')

const bookConstructor = require('./bookConstructor')

const levelMapper = { 0: 'one', 1: 'two', 2: 'three' }

const scriptsRunner = require('./scriptsRunner')

const prepareBook = async (bookId, bookComponentId, template, options) => {
  let notesType
  let templateHasEndnotes

  const {
    icmlNotes,
    fileExtension,
    includeTOC,
    includeCopyrights,
    includeTitlePage,
    includeCoverPage,
    isbn,
  } = options

  const featureBookStructure =
    config.has('featureBookStructure') &&
    ((config.get('featureBookStructure') &&
      JSON.parse(config.get('featureBookStructure'))) ||
      false)

  const featurePODEnabled =
    config.has('featurePOD') &&
    ((config.get('featurePOD') && JSON.parse(config.get('featurePOD'))) ||
      false)

  if (fileExtension !== 'icml') {
    const { notes } = template
    notesType = notes
    templateHasEndnotes = notesType === 'endnotes'
  } else {
    notesType = icmlNotes
  }

  // The produced representation of the book holds two Map data types one
  // for the division and one for the book components of each division to
  // ensure the order of things
  const book = await bookConstructor(bookId, bookComponentId, {
    templateHasEndnotes,
    forceISBN: isbn,
    isEPUB: fileExtension === 'epub',
  })

  const frontDivision = book.divisions.get('front')
  const backDivision = book.divisions.get('back')
  // const bodyDivision = book.divisions.get('body')

  const tocComponent = frontDivision.bookComponents.get('toc') || {}

  if (featureBookStructure) {
    tocComponent.content = !isEmpty(tocComponent.content)
      ? generateContainer(tocComponent, false, 'one')
      : ''
  } else {
    tocComponent.content = !isEmpty(tocComponent.content)
      ? generateContainer(tocComponent, false)
      : ''
  }

  if (featurePODEnabled) {
    if (includeTitlePage) {
      const titlePageComponent =
        frontDivision.bookComponents.get('title-page') || {}

      titlePageComponent.content = generateTitlePage(
        titlePageComponent,
        book.title,
        book.metadata.authors,
        book.subtitle,
      )
    } else {
      frontDivision.bookComponents.delete('title-page')
    }

    if (!includeTOC) {
      frontDivision.bookComponents.delete('toc')
    }

    if (!includeCoverPage) {
      frontDivision.bookComponents.delete('cover')
    }

    if (includeCopyrights) {
      const copyrightComponent =
        frontDivision.bookComponents.get('copyrights-page') || {}

      copyrightComponent.content = generateCopyrightsPage(
        book.title,
        copyrightComponent,
        book.podMetadata,
      )
    } else {
      frontDivision.bookComponents.delete('copyrights-page')
    }
  }

  let endnotesComponent

  if (
    templateHasEndnotes ||
    (fileExtension === 'icml' && icmlNotes === 'endnotes')
  ) {
    endnotesComponent = backDivision.bookComponents.get('endnotes')

    if (featureBookStructure) {
      endnotesComponent.content = generateContainer(
        endnotesComponent,
        false,
        'one',
      )
    } else {
      endnotesComponent.content = generateContainer(endnotesComponent, false)
    }
  }

  const bookComponentsWithMath = []
  const shouldMathML = fileExtension === 'epub'
  let tocAfterFrontmatter
  book.divisions.forEach(division => {
    let counter = 0
    let chapterCounter = 1
    division.bookComponents.forEach(bookComponent => {
      const { componentType } = bookComponent

      const isTheFirstInBody = division.type === 'body' && counter === 0

      const isChapter = division.type === 'body' && componentType === 'chapter'

      if (isChapter) {
        chapterCounter += 1
      }

      // restore previously save toc content, if it exists
      if (isTheFirstInBody && tocAfterFrontmatter) {
        tocComponent.content = tocAfterFrontmatter
      }

      if (componentType === 'toc' && fileExtension !== 'epub') return

      let container
      let cleanedContent

      if (featureBookStructure) {
        const levelIndex = findIndex(book.bookStructure.levels, {
          type: componentType,
        })

        if (levelIndex !== -1) {
          container = generateContainer(
            bookComponent,
            isTheFirstInBody,
            levelMapper[levelIndex],
          )
          cleanedContent = cleanHTML(
            container,
            bookComponent,
            notesType,
            tocComponent,
            bookComponentsWithMath,
            endnotesComponent,
            levelMapper[levelIndex],
          )
        } else {
          container = generateContainer(bookComponent, isTheFirstInBody)
          cleanedContent = cleanHTML(
            container,
            bookComponent,
            notesType,
            tocComponent,
            bookComponentsWithMath,
            endnotesComponent,
          )
        }
      } else {
        const levelIndex = bookComponent.parentComponentId ? 2 : 1
        container = generateContainer(
          bookComponent,
          isTheFirstInBody,
          levelIndex,
        )
        cleanedContent = cleanHTML(
          container,
          bookComponent,
          notesType,
          tocComponent,
          bookComponentsWithMath,
          endnotesComponent,
          levelIndex,
          chapterCounter,
          isTheFirstInBody,
        )
      }

      // HACK: store a copy of TOC after finishing the frontmatter
      // the link to the TOC gets unexplicably deleted, i can't solve it otherwise
      if (bookComponent.componentType === 'toc' && fileExtension === 'epub') {
        tocAfterFrontmatter = tocComponent.content
      }

      const { content, hasMath } = cleanedContent
      /* eslint-disable no-param-reassign */
      bookComponent.hasMath = hasMath
      bookComponent.content = cleanDataAttributes(content)
      /* eslint-enable no-param-reassign */
      counter += 1
    })
  })

  await Promise.all(
    bookComponentsWithMath.map(async item => {
      const division = book.divisions.get(item.division)

      const bookComponentWithMath = division.bookComponents.get(
        item.bookComponentId,
      )

      const target = shouldMathML ? 'mml' : 'svg'

      const contentAfter = await convertedContent(
        bookComponentWithMath.content,
        target,
      )

      bookComponentWithMath.content = contentAfter
    }),
  )

  if (fileExtension === 'epub') {
    if (template.exportScripts.length > 0) {
      const bbWithConvertedContent = await scriptsRunner(book, template)
      book.divisions.forEach(division => {
        division.bookComponents.forEach(bookComponent => {
          const { id } = bookComponent

          if (bbWithConvertedContent[id]) {
            /* eslint-disable no-param-reassign */
            bookComponent.content = bbWithConvertedContent[id]
            /* eslint-enable no-param-reassign */
          }
        })
      })
    }
  }

  // Check if notes exist, else remove the book component
  if (templateHasEndnotes && tocComponent) {
    const $endnotes = cheerio.load(endnotesComponent.content)
    const $toc = cheerio.load(tocComponent.content)

    if ($endnotes('ol').length === 0) {
      backDivision.bookComponents.delete('endnotes')

      $toc('.toc-endnotes').remove()

      tocComponent.content = $toc('body').html()
    }
  }

  book.divisions.forEach(division => {
    division.bookComponents.forEach(bookComponent => {
      const { content } = bookComponent
      const $ = cheerio.load(content)

      const questionTypes = $(
        `.multiple-choice[id], 
        .multiple-choice-single-correct[id], 
        .true-false[id], 
        .true-false-single-correct[id],
        .multiple-drop-down-container, 
        .fill-the-gap[feedback],
        .matching-container[id], 
        .essay, 
        .numerical-answer`,
      )

      if (questionTypes.length) {
        const questions = []
        questionTypes.map((i, element) => {
          const className = element.attribs.class
          const { id } = element.attribs
          const $node = $(element)

          const data = {
            type: null,
            question: null,
            answers: [],
          }

          switch (className) {
            case 'multiple-choice':
              data.type = 'multiple-choice'
              data.question = $node.find('.multiple-choice-question').html()

              $node.find('.multiple-choice-option').map((_j, op) => {
                data.answers.push({
                  option: $(op).html(),
                  correct: op.attribs.correct,
                  feedback: op.attribs.feedback,
                })
              })

              $(`#${id}`).replaceWith(
                `<div>Question ${i + 1}: ${data.question}<ul>${data.answers
                  .map(a => `<li>${a.option}</li>`)
                  .join('')}</ul></div>`,
              )

              questions.push(data)
              break
            case 'multiple-choice-single-correct':
              data.type = 'multiple-choice-single-correct'
              data.question = $node
                .find('.multiple-choice-question-single')
                .html()

              $node
                .find('.multiple-choice-option-single-correct')
                .map((_j, op) => {
                  data.answers.push({
                    option: $(op).html(),
                    correct: op.attribs.correct,
                    feedback: op.attribs.feedback,
                  })
                })

              $(`#${id}`).replaceWith(
                `<div>Question ${i + 1}: ${data.question}<ul>${data.answers
                  .map(a => `<li>${a.option}</li>`)
                  .join('')}</ul></div>`,
              )
              questions.push(data)
              break
            case 'true-false':
              data.type = 'true-false'
              data.question = $node.find('.true-false-question').html()

              $node.find('.true-false-option').map((_j, op) => {
                data.answers.push({
                  option: $(op).html(),
                  correct: op.attribs.correct,
                  feedback: op.attribs.feedback,
                })
              })

              $(`#${id}`).replaceWith(
                `<div>Question ${i + 1}: ${data.question}<ul>${data.answers
                  .map(a => `<li>${a.option}</li>`)
                  .join('')}</ul></div>`,
              )
              questions.push(data)
              break
            case 'true-false-single-correct':
              data.type = 'true-false-single-correct'
              data.question = $node.find('.true-false-question-single').html()

              $node.find('.true-false-single-correct-option').map((_j, op) => {
                data.answers.push({
                  option: $(op).html(),
                  correct: op.attribs.correct,
                  feedback: op.attribs.feedback,
                })
              })

              $(`#${id}`).replaceWith(
                `<div>Question ${i + 1}: ${data.question}<ul>${data.answers
                  .map(a => `<li>${a.option}</li>`)
                  .join('')}</ul></div>`,
              )
              questions.push(data)
              break
            case 'multiple-drop-down-container':
              data.type = 'multiple-drop-down-container'
              data.answers = $node.clone()

              $node.find('.multiple-drop-down-option').map((_i, op) => {
                const dropdownOptions = JSON.parse(op.attribs.options)
                $node
                  .find(
                    `.multiple-drop-down-option[correct="${op.attribs.correct}"]`,
                  )
                  .replaceWith(
                    `<span>___________ (${dropdownOptions
                      .map(o => o.label)
                      .join('; ')})</span> `,
                  )

                data.answers
                  .find(
                    `.multiple-drop-down-option[correct="${op.attribs.correct}"]`,
                  )
                  .replaceWith(
                    `<u>${
                      dropdownOptions.find(o => o.value === op.attribs.correct)
                        .label
                    }</u> `,
                  )
              })
              data.question = $node.html()
              data.answers = [
                {
                  correct: data.answers.html(),
                  feedback: $node.attr('feedback'),
                },
              ]

              $(`#${id}`).replaceWith(
                `<div>Question ${i + 1}: ${data.question}</div>`,
              )
              questions.push(data)
              break
            case 'fill-the-gap':
              data.type = 'fill-the-gap'
              data.answers = $node.clone()

              $node.find('.fill-the-gap').map((_i, a) => {
                data.answers
                  .find(`.fill-the-gap[id="${a.attribs.id}"]`)
                  .replaceWith(`<u>${$(a).text()}</u> `)
              })

              $node.find('.fill-the-gap').replaceWith('_________ ')
              data.question = $node.html()
              data.answers = [
                {
                  correct: data.answers.html(),
                  feedback: $node.attr('feedback'),
                },
              ]

              $(`#${id}`).replaceWith(
                `<div>Question ${i + 1}: 
                <p>Fill in the gaps:</p>
                ${data.question}</div>`,
              )
              questions.push(data)
              break
            case 'essay':
              data.type = 'essay'
              data.question = $node.find('.essay-question').html()
              data.answers = [{ correct: $node.find('.essay-prompt').html() }]

              $(`#${id}`).replaceWith(
                `<div>Question ${i + 1}:
                ${data.question}</div>`,
              )
              questions.push(data)
              break
            case 'matching-container':
              data.type = 'matching-container'
              data.question = $('<ul></ul>')
              const opts = JSON.parse($node.attr('options'))
              $node.find('.matching-option').map((_j, op) => {
                const statement = $(
                  `<li>${$(op).html()}_______ (${opts
                    .map(o => o.label)
                    .join('; ')})</li>`,
                )

                data.question.append(statement)
                data.answers.push(
                  $(
                    `<li>${$(op).html()} <u>${
                      opts.find(o => o.value === op.attribs.correct)?.label
                    }</u> </li>`,
                  ),
                )
              })
              data.feedback = $node.attr('feedback')

              $(`#${id}`).replaceWith(
                `<div>Question ${i + 1}:
                ${data.question}</div>`,
              )
              questions.push(data)
              break
            case 'numerical-answer':
              data.type = 'numerical-answer'
              data.question = $node.html()
              data.feedback = $node.attr('feedback')

              switch ($node.attr('answertype')) {
                case 'rangeAnswer':
                  const answersrange = JSON.parse($node.attr('answersrange'))
                  data.answers = `${answersrange?.minAnswer} - ${answersrange?.maxAnswer}`
                  break
                case 'preciseAnswer':
                  data.answers = JSON.parse(
                    $node.attr('answersprecise'),
                  )?.preciseAnswer
                  break
                case 'exactAnswer':
                  const answersexact = JSON.parse($node.attr('answersexact'))

                  if (
                    answersexact?.exactAnswer &&
                    answersexact?.marginError &&
                    typeof answersexact?.exactAnswer === 'number' &&
                    typeof answersexact.marginError === 'number'
                  ) {
                    data.answers = `${
                      Number(answersexact.exactAnswer) -
                      (answersexact.exactAnswer * answersexact.marginError) /
                        100
                    } - ${
                      Number(answersexact.exactAnswer) +
                      Number(
                        answersexact.exactAnswer * answersexact.marginError,
                      ) /
                        100
                    }`
                  }

                  break
                default:
                  break
              }

              $(`#${id}`).replaceWith(
                `<div>Question ${i + 1}:
                ${data.question}</div>`,
              )
              questions.push(data)
              break
            default:
              break
          }
        })

        $('body').append(
          `<aside><h2>Answers</h2>
          <ul style="list-style-type: none;padding-inline-start: 0;" id="question-answers"></ul>
          </aside>`,
        )

        questions.forEach((question, i) => {
          switch (question.type) {
            case 'multiple-choice':
              $('#question-answers').append(`
                <li>
                  <p>Question ${i + 1}:</p>
                  <ul>
                    ${question.answers
                      .map(a => {
                        return `<li>
                        <div>${$(a.option).text()}, ${
                          a.correct === 'true' ? 'CORRECT' : 'INCORRECT'
                        }</div>
                        <p>${a.feedback}</p>
                      </li>`
                      })
                      .join('')}
                  </ul>
                  <br/>
                </li>
              `)
              break
            case 'multiple-choice-single-correct':
              $('#question-answers').append(`
                <li>
                  <p>Question ${i + 1}:</p>
                  <ul>
                    ${question.answers
                      .map(a => {
                        return `<li>
                        <div>${$(a.option).text()}, ${
                          a.correct === 'true' ? 'CORRECT' : 'INCORRECT'
                        }</div>
                        <p>${a.feedback}</p>
                      </li>`
                      })
                      .join('')}
                  </ul>
                  <br/>
                </li>
              `)
              break
            case 'true-false':
              $('#question-answers').append(`
                <li>
                  <p>Question ${i + 1}:</p>
                  <ul>
                    ${question.answers
                      .map(a => {
                        return `<li>
                        <div>${$(a.option).text()}, ${
                          a.correct === 'true' ? 'TRUE' : 'FALSE'
                        }</div>
                        <p>${a.feedback}</p>
                      </li>`
                      })
                      .join('')}
                  </ul>
                  <br/>
                </li>
              `)
              break
            case 'true-false-single-correct':
              $('#question-answers').append(`
                <li>
                  <p>Question ${i + 1}:</p>
                  <ul>
                    ${question.answers
                      .map(a => {
                        return `<li>
                        <div>${$(a.option).text()}, ${
                          a.correct === 'true' ? 'TRUE' : 'FALSE'
                        }</div>
                        <p>${a.feedback}</p>
                      </li>`
                      })
                      .join('')}
                  </ul>
                  <br/>
                </li>
              `)
              break
            case 'multiple-drop-down-container':
              $('#question-answers').append(`
                <li>
                  <p>Question ${i + 1}:</p>
                  <p>
                    ${question.answers[0].correct}
                  </p>  
                  ${
                    question.answers[0].feedback
                      ? `<p>
                    ${question.answers[0].feedback}
                  </p>`
                      : ''
                  }
                  
                  <br/>
                </li>
              `)
              break
            case 'fill-the-gap':
              $('#question-answers').append(`
                <li>
                  <p>Question ${i + 1}:</p>
                  <p>
                    ${question.answers[0].correct} 
                  </p>  
                  ${
                    question.answers[0].feedback
                      ? `<p>
                    ${question.answers[0].feedback}
                  </p>`
                      : ''
                  }
                  
                  <br/>
                </li>
              `)
              break
            case 'essay':
              $('#question-answers').append(`
                <li>
                  <p>Question ${i + 1}:</p>
                  <p>
                    ${question.answers[0].correct} 
                  </p>                  
                  <br/>
                </li>
              `)
              break
            case 'matching-container':
              $('#question-answers').append(`
                <li>
                  <p>Question ${i + 1}:</p>
                  <ul>
                    ${question.answers.join('')} 
                  </ul> 
                  <p>${question.feedback}</p>
                  <br/>
                </li>
              `)
              break
            case 'numerical-answer':
              $('#question-answers').append(`
                <li>
                  <p>Question ${i + 1}:</p>
                  <p>${question.answers}</p>
                  <p>${question.feedback}</p>
                  <br/>
                </li>
              `)
              break
            default:
              break
          }
        })
      }

      /* eslint-disable no-param-reassign */
      bookComponent.content = $.html('body')
      /* eslint-enable no-param-reassign */
    })
  })

  return book
}

module.exports = prepareBook
