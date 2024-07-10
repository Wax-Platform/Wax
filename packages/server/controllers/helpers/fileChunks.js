const { logger, fileStorage } = require('@coko/server')
const mammoth = require('mammoth')
const fs = require('fs')
const path = require('path')
const pdf2html = require('pdf2html')
const cheerio = require('cheerio')
// const { getTokens } = require('../../api/helpers')

const getBuffer = async file => {
  const { createReadStream } = await file
  const readStream = createReadStream()
  const chunks = []

  return new Promise((resolve, reject) => {
    readStream.on('data', chunk => {
      chunks.push(chunk)
    })

    readStream.on('end', async () => {
      const buffer = Buffer.concat(chunks)
      resolve(buffer)
    })

    readStream.on('error', error => {
      reject(error)
    })
  })
}

const uploadFileFromUrl = async fileUrl => {
  try {
    const response = await fetch(fileUrl)

    if (!response.ok || response.body) {
      throw new Error('Invalid response or no body found')
    }

    const fileStream = response.body
    const filename = path.basename(fileUrl)
    const storedObjects = await fileStorage.upload(fileStream, filename, {})
    logger.info(`URL: ${storedObjects[0]?.Key || ''}`)
    return storedObjects
  } catch (error) {
    throw new Error('Failed to upload file:', error)
  }
}

const splitFileContent = async (file, extension, maxLng = 10000) => {
  const { filename } = await file
  const buffer = await getBuffer(file)
  logger.info(`Processing file: ${filename}`)

  const processors = {
    md: async () => {
      const content = buffer.toString('utf8')
      const headingPattern = /(?=^#{1,6}\s)/gm
      return generateChunksFromText(content, headingPattern, maxLng, filename)
    },
    docx: async () => {
      const result = await mammoth
        .convertToHtml({
          buffer,
        })
        .catch(err => {
          logger.error(err)
        })

      const html = result.value

      const blocks = generateChunksFromHtml(html, maxLng, filename)

      return blocks
    },
    pdf: async () => {
      const tempPdfPath = path.join(__dirname, '..', 'temp.pdf')

      try {
        fs.writeFileSync(tempPdfPath, buffer)
        logger.info('PDF content written to temp.pdf successfully.')
      } catch (err) {
        logger.error('Error writing PDF content:', err)
        return
      }

      try {
        const html = await pdf2html.html(tempPdfPath)
        logger.info('PDF converted to HTML successfully.')
        const blocks = generateChunksFromHtml(html, maxLng, filename)

        fs.unlinkSync(tempPdfPath)

        // eslint-disable-next-line consistent-return
        return blocks
      } catch (err) {
        logger.error('Error converting PDF to HTML:', err)
      }
    },
    html: async () => {
      const html = buffer.toString('utf-8')

      const blocks = generateChunksFromHtml(html, maxLng, filename)

      return blocks
    },
  }

  const sections = await processors[extension]()
  return sections
}

function generateChunksFromText(content, headingPattern, maxLng, filename) {
  const splittedByHeadings = content
    .split(headingPattern)
    .filter(section => section.trim() !== '')

  const headingMatch = content.match(headingPattern)

  const splitByMaxLength = (section, maxLength) => {
    const senetences = section.split('.')
    const splitSections = []
    let currentSection = ''

    senetences.forEach(sentence => {
      if (currentSection.length + sentence.length + 1 > maxLength) {
        splitSections.push(currentSection.trim())
        currentSection = ''
      }

      currentSection += `${sentence}. `
    })

    if (currentSection.length > 0) {
      splitSections.push(currentSection.trim())
    }

    return splitSections
  }

  const fragmentWithHeading = splittedByHeadings.flatMap((section, i) => {
    const heading = headingMatch[i]?.trim() || section.split('\n')[0]

    const splitSections = splitByMaxLength(section, maxLng)

    return splitSections.map((fragment, fragmentIndex) => ({
      fragment: `FILE NAME: "${filename}"\nSECTION: "${heading}"\nFRAGMENT INDEX: ${fragmentIndex}\nCONTENT: ${fragment}`,
      fragmentIndex,
      heading,
    }))
  })

  return fragmentWithHeading
}

function generateChunksFromHtml(htmlContent, maxLng, filename) {
  logger.info(`Processing HTML content`)

  const $ = cheerio.load(htmlContent)
  $('img').remove()
  $('a').remove()

  const blocks = []
  const headings = []

  const iterable = [...$('body')[0].childNodes]
  let currentSection = ''

  iterable.forEach(child => {
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(child.tagName)) {
      const headingText = cheerio.load(child).text().trim()
      headings.push(headingText)

      if (currentSection.trim()) {
        blocks.push({
          heading: headingText,
          content: currentSection.trim(),
        })
        currentSection = ''
      }
    }

    currentSection += cheerio.load(child).html()
  })

  if (currentSection.trim()) {
    blocks.push({
      heading: headings[headings.length - 1] || 'title-not-found',
      content: currentSection.trim(),
    })
  }

  const splitByMaxLng = blocks
    .map(({ heading, content }) => {
      const sentences = content.split('.')
      const splitSections = []
      let currentSec = ''
      // const tokens = getTokens({ input: [content] })
      // logger.info(`SECTION TOKENS: ${tokens}`)
      sentences.forEach(sentence => {
        if (currentSec.length + sentence.length + 1 > maxLng) {
          splitSections.push(currentSec.trim())
          currentSec = ''
        }

        currentSec += `${sentence}. `
      })

      if (currentSec.length > 0) {
        splitSections.push(currentSec.trim())
      }

      return splitSections.map((fragment, fragmentIndex) => ({
        fragment: `FILE NAME: "${filename}"\nSECTION: "${heading}"\nFRAGMENT INDEX: ${fragmentIndex}\nCONTENT: ${fragment}`,
        fragmentIndex,
        heading,
      }))
    })
    .flat()

  return splitByMaxLng
    .map(chunk => ({
      ...chunk,
      fragment: chunk.fragment.replace(/<[^>]*>?/gm, ''),
    }))
    .flat()
}

module.exports = {
  splitFileContent,
  getBuffer,
  uploadFileFromUrl,
}
