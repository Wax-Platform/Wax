const { fileStorage } = require('@coko/server')
const cheerio = require('cheerio')
const path = require('path')
const builder = require('xmlbuilder')
const fs = require('fs-extra')
const tidy = require('libtidy-updated')
const mime = require('mime-types')
const { get, isEmpty, map, filter, find, findIndex, trim } = require('lodash')

const config = require('config')

const beautify = require('js-beautify').html

const { epubDecorator, fixFontFaceUrls } = require('./converters')
const { writeFile, readFile } = require('../../utilities/filesystem')

const { fileStorageImageGatherer } = require('../../utilities/image')

const { getObjectKey } = require('../file.controller')

let images = []
let stylesheets = []
let fonts = []
let xhtmls = []

const featureBookStructureEnabled =
  config.has('featureBookStructure') &&
  ((config.get('featureBookStructure') &&
    JSON.parse(config.get('featureBookStructure'))) ||
    false)

const H2Aggregator = content => {
  const $ = cheerio.load(content)
  const result = []
  $('h2').each((i, elem) => {
    const $elem = $(elem)

    if ($elem.text() !== '') {
      const id = $elem.attr('id')
      result.push({ text: $elem.text(), id })
    }
  })
  return result
}

const createEPUBFolder = async EPUBtempFolderAssetsPath => {
  try {
    const result = {}
    await fs.ensureDir(EPUBtempFolderAssetsPath)
    result.root = EPUBtempFolderAssetsPath
    const metaPath = path.join(EPUBtempFolderAssetsPath, 'META-INF')
    await fs.ensureDir(metaPath)
    result.metaInf = metaPath
    const oebpsPath = path.join(EPUBtempFolderAssetsPath, 'OEBPS')
    await fs.ensureDir(oebpsPath)
    result.oebps = oebpsPath
    const imagesPath = path.join(oebpsPath, 'Images')
    await fs.ensureDir(imagesPath)
    result.images = imagesPath
    const fontsPath = path.join(oebpsPath, 'Fonts')
    await fs.ensureDir(fontsPath)
    result.fonts = fontsPath
    const stylesPath = path.join(oebpsPath, 'Styles')
    await fs.ensureDir(stylesPath)
    result.styles = stylesPath
    const textPath = path.join(oebpsPath, 'Text')
    await fs.ensureDir(textPath)
    result.texts = textPath

    return result
  } catch (e) {
    throw new Error(e)
  }
}

const createMimetype = async rootPath => {
  try {
    return writeFile(`${rootPath}/mimetype`, 'application/epub+zip')
  } catch (e) {
    throw new Error(e)
  }
}

const createContainer = async () => {
  try {
    const container = builder
      .create(
        {
          container: {
            '@xmlns': 'urn:oasis:names:tc:opendocument:xmlns:container',
            '@version': '1.0',
            rootfiles: {
              rootfile: {
                '@full-path': 'OEBPS/content.opf',
                '@media-type': 'application/oebps-package+xml',
              },
            },
          },
        },
        { encoding: 'UTF-8' },
      )
      .end({
        pretty: true,
      })

    return container
  } catch (e) {
    throw new Error(e)
  }
}

const gatherAssets = async (book, templateFiles, epubFolder) => {
  for (let i = 0; i < templateFiles.length; i += 1) {
    const { id: dbId, name } = templateFiles[i]
    const storedObject = templateFiles[i].getStoredObjectBasedOnType('original')
    const { key, mimetype } = storedObject
    const originalFilename = name

    if (mimetype === 'text/css') {
      const target = `${epubFolder.styles}/${originalFilename}`
      const id = `stylesheet-${dbId}-${i}`
      stylesheets.push({
        id,
        key,
        target,
        mimetype,
        originalFilename,
      })
    } else {
      const target = `${epubFolder.fonts}/${originalFilename}`
      const id = `font-${dbId}-${i}`
      fonts.push({
        id,
        key,
        target,
        mimetype,
        originalFilename,
      })
    }
  }

  if (stylesheets.length === 0) {
    throw new Error(
      'No stylesheet file exists in the selected template, export aborted',
    )
  }

  const gatheredImages = fileStorageImageGatherer(book)
  // const freshImageLinkMapper = {}
  const objectKeyMapper = {}

  await Promise.all(
    map(gatheredImages, async fileId => {
      // freshImageLinkMapper[fileId] = await getFileURL(fileId, 'medium')
      const retrievedObjectKey = await getObjectKey(fileId, 'medium')

      if (retrievedObjectKey) {
        objectKeyMapper[fileId] = retrievedObjectKey
        return
      }

      delete objectKeyMapper[fileId]
    }),
  )

  book.divisions.forEach(division => {
    division.bookComponents.forEach(bookComponent => {
      const { content, id } = bookComponent
      const $ = cheerio.load(content)

      $('img').each((index, node) => {
        const $node = $(node)
        const constructedId = `image-${id}-${index}`
        const dataFileId = $node.attr('data-fileid')

        if (dataFileId) {
          const key = objectKeyMapper[dataFileId]

          if (!key) {
            return
          }

          const mimetype = mime.lookup(key)
          const target = `${epubFolder.images}/${key}`

          if (!find(images, { key })) {
            images.push({
              id: constructedId,
              key,
              target,
              mimetype,
            })
          }

          $node.attr('src', `../Images/${key}`)
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
}

const transferAssets = async (imagesParam, stylesheetsParam, fontsParam) => {
  try {
    await Promise.all(
      map(imagesParam, async image => {
        const { key, target } = image
        return fileStorage.download(key, target)
      }),
    )
    await Promise.all(
      map(stylesheetsParam, async stylesheet => {
        const { key, target } = stylesheet
        return fileStorage.download(key, target)
      }),
    )
    await Promise.all(
      map(fontsParam, async font => {
        const { key, target } = font
        return fileStorage.download(key, target)
      }),
    )
    const stylesheetContent = await readFile(stylesheets[0].target)
    const fixedCSS = fixFontFaceUrls(stylesheetContent, fonts, '../Fonts')
    await writeFile(`${stylesheets[0].target}`, fixedCSS)
  } catch (e) {
    throw new Error(e)
  }
}

const decorateText = async (book, hasEndnotes) => {
  const backDivision = book.divisions.get('back')
  let endnotesComponent
  let id

  if (hasEndnotes) {
    endnotesComponent = backDivision.bookComponents.get('endnotes')

    if (endnotesComponent) {
      // for the case where there isn't any notes inside of the book
      id = endnotesComponent.id
    }
  }

  book.divisions.forEach(division => {
    division.bookComponents.forEach(bookComponent => {
      /* eslint-disable no-param-reassign */
      bookComponent.content = epubDecorator(
        bookComponent,
        book.title,
        stylesheets[0],
        hasEndnotes,
        id,
      )
      /* eslint-enable no-param-reassign */
    })
  })
}

const generateTOCNCX = async (book, isbnIndex = null) => {
  const navPoints = []
  const { metadata, podMetadata } = book
  const { isbn, issn, issnL } = metadata

  // Lookup for EPub unique id; if undefined, a uuid is used
  let identifier

  if (!isbn && !isEmpty(podMetadata?.isbns)) {
    if (isbnIndex !== null) {
      identifier = get(podMetadata, ['isbns', isbnIndex, 'isbn'])
    }
  } else {
    // Coerce to an array of identifiers with empty labels
    identifier = isbn || issn || issnL
  }

  let counter = 0
  book.divisions.forEach(division => {
    division.bookComponents.forEach(bookComponent => {
      const { id, title, componentType } = bookComponent

      // if (bookComponent.includeInTOC) {
      const nestedNavPoints = []

      if (featureBookStructureEnabled) {
        const res = H2Aggregator(bookComponent.content)
        res.forEach((heading, index) => {
          const { text, id: headingId } = heading
          const nestedLink = headingId.split('_')
          nestedNavPoints.push({
            '@id': `nav-${counter}.${index}`,
            navLabel: {
              text: {
                '#text': text,
              },
            },
            content: {
              '@src': `Text/${nestedLink[0]}.xhtml#${headingId}`,
            },
          })
        })
      }

      if (nestedNavPoints.length > 0) {
        navPoints.push({
          '@id': `nav-${counter}`,
          navLabel: {
            text: {
              '#text': title || componentType,
            },
          },
          content: {
            '@src': `Text/comp-number-${id}.xhtml`,
          },
          navPoint: nestedNavPoints,
        })
      } else {
        navPoints.push({
          '@id': `nav-${counter}`,
          navLabel: {
            text: {
              '#text': title || componentType,
            },
          },
          content: {
            '@src': `Text/comp-number-${id}.xhtml`,
          },
        })
      }

      counter += 1
      // }
    })
  })

  const toc = {
    ncx: {
      '@xmlns': 'http://www.daisy.org/z3986/2005/ncx/',
      '@version': '2005-1',
      head: {
        meta: [
          {
            '@content': `${
              identifier ? `urn:isbn:${identifier}` : `urn:uuid:${book.id}`
            }`,
            '@name': 'dtb:uid',
          },
          {
            '@content': '1',
            '@name': 'dtb:depth',
          },
          {
            '@content': '0',
            '@name': 'dtb:totalPageCount',
          },
          {
            '@content': '0',
            '@name': 'dtb:maxPageNumber',
          },
        ],
      },
      docTitle: {
        text: {
          '#text': book.title || 'Untitled',
        },
      },
      navMap: {
        navPoint: navPoints,
      },
    },
  }

  const output = builder.create(toc, { encoding: 'UTF-8' }).end({
    pretty: true,
  })

  return output
}

const generateContentOPF = async (book, isbnIndex = null) => {
  const { metadata, title, updated, podMetadata } = book

  const {
    isbn,
    issn,
    issnL,
    copyrightYear,
    copyrightHolder,
    copyrightStatement,
    authors,
    publicationDate,
  } = metadata

  const spineData = []
  const manifestData = []

  // Lookup for EPub unique id; if undefined, a uuid is used
  let identifiers

  if (!isbn && !isEmpty(podMetadata?.isbns)) {
    // Content of "podMetadata.isbns"
    identifiers = podMetadata.isbns.map(item => {
      return {
        // Qualify/extend identifiers names when there are multiple identifiers
        idExtension:
          podMetadata.isbns.length > 1 || isbnIndex === null
            ? `-${trim(item.label.replace(/[^A-Za-z0-9]+/g, '-'), '-')}`
            : '',
        number: item.isbn,
      }
    })
  } else if (isbn || issn || issnL) {
    // Coerce to an array of identifiers with empty labels
    identifiers = [{ idExtension: '', number: isbn || issn || issnL }]
  }

  const rights = filter(
    [copyrightYear, copyrightHolder, copyrightStatement],
    item => item && item.length > 0,
  ).join('. ')

  const metaTemp = []

  if (authors.length > 0) {
    map(authors, (author, index) => {
      metaTemp.push({
        '@scheme': 'marc:relators',
        '@property': 'role',
        '@refines': `#creator${index}`,
        '#text': author,
      })
    })
  }

  metaTemp.push({
    '@property': 'dcterms:modified',
    '#text': updated.toISOString().replace(/\.\d+Z$/, 'Z'),
  })
  metaTemp.push({
    '@property': 'schema:accessMode',
    '#text': 'textual',
  })
  metaTemp.push({
    '@property': 'schema:accessMode',
    '#text': 'visual',
  })
  metaTemp.push({
    '@property': 'schema:accessibilityFeature',
    '#text': 'alternativeText',
  })
  metaTemp.push({
    '@property': 'schema:accessibilityHazard',
    '#text': 'none',
  })
  metaTemp.push({
    '@property': 'schema:accessibilitySummary',
    '#text':
      'In order to meet accessibility standards, alternative text is provided with every image included in this book',
  })
  metaTemp.push({
    '@property': 'schema:accessModeSufficient',
    '#text': 'textual,visual',
  })

  book.divisions.forEach(division => {
    division.bookComponents.forEach(bookComponent => {
      const { id, componentType, hasMath } = bookComponent
      spineData.push({
        '@idref': `comp-number-${id}`,
      })

      const tempManifestItem = {
        '@href': `Text/comp-number-${id}.xhtml`,
        '@id': `comp-number-${id}`,
        '@media-type': 'application/xhtml+xml',
      }

      if (hasMath) {
        tempManifestItem['@properties'] = 'mathml'
      }

      if (componentType === 'toc') {
        tempManifestItem['@properties'] = 'nav'
      }

      manifestData.push(tempManifestItem)
    })
  })

  for (let i = 0; i < images.length; i += 1) {
    manifestData.push({
      '@href': `Images/${images[i].key}`,
      '@id': `${images[i].id}`,
      '@media-type': `${images[i].mimetype}`,
    })
  }

  for (let i = 0; i < fonts.length; i += 1) {
    manifestData.push({
      '@href': `Fonts/${fonts[i].originalFilename}`,
      '@id': `${fonts[i].id}`,
      '@media-type': `${fonts[i].mimetype}`,
    })
  }

  for (let i = 0; i < stylesheets.length; i += 1) {
    manifestData.push({
      '@href': `Styles/${stylesheets[i].originalFilename}`,
      '@id': `${stylesheets[i].id}`,
      '@media-type': `${stylesheets[i].mimetype}`,
    })
  }

  // manifestData.push({
  //   '@href': `toc.ncx`,
  //   '@id': 'ncx',
  //   '@media-type': 'application/x-dtbncx+xml',
  // })

  const contentOPF = {
    package: {
      '@prefix':
        'rendition: http://www.idpf.org/vocab/rendition/# schema: http://schema.org/ ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0/ a11y: http://www.idpf.org/epub/vocab/package/a11y/#',
      '@xmlns': 'http://www.idpf.org/2007/opf',
      '@version': '3.0',
      '@unique-identifier':
        isbnIndex === null || isEmpty(identifiers)
          ? 'BookId'
          : `BookId${identifiers[isbnIndex].idExtension}`,
      '@xml:lang': 'en',
      metadata: {
        '@xmlns:opf': 'http://www.idpf.org/2007/opf',
        '@xmlns:dcterms': 'http://purl.org/dc/terms/',
        '@xmlns:dc': 'http://purl.org/dc/elements/1.1/',
        '@xmlns:ibooks': 'http://apple.com/ibooks/html-extensions',
        'dc:title': { '#text': title || 'Untitled' },
        'dc:language': { '#text': 'en' },

        meta: metaTemp,
      },
      manifest: { item: manifestData },
      spine: {
        '@toc': 'ncx',
        itemref: spineData,
      },
    },
  }

  if (authors.length > 0) {
    contentOPF.package.metadata['dc:creator'] = map(
      authors,
      (author, index) => ({
        '@id': `creator${index}`,
        '#text': author,
      }),
    )
  }

  const uuidBook = {
    '@id': 'BookId',
    '#text': `urn:uuid:${book.id}`,
  }

  if (identifiers) {
    contentOPF.package.metadata['dc:identifier'] = identifiers.map(item => {
      metaTemp.push({
        '@refines': `#BookId${item.idExtension}`,
        '@property': 'identifier-type',
        '@scheme': 'onix:codelist5',
        '#text': 15,
      })
      return {
        '@id': `BookId${item.idExtension}`,
        '#text': `urn:isbn:${item.number}`,
      }
    })

    if (isbnIndex === null && !isbn) {
      // None of the isbns have been selected so use Book.uuid as the unique id
      contentOPF.package.metadata['dc:identifier'].push(uuidBook)
    }
  } else {
    contentOPF.package.metadata['dc:identifier'] = uuidBook
  }

  if (publicationDate) {
    contentOPF.package.metadata['dc:date'] = {
      '#text': publicationDate,
    }
  }

  if (rights) {
    contentOPF.package.metadata['dc:rights'] = {
      '#text': rights,
    }
  }

  if (copyrightHolder) {
    contentOPF.package.metadata['dc:publisher'] = { '#text': copyrightHolder }
  }

  const output = builder.create(contentOPF, { encoding: 'UTF-8' }).end({
    pretty: true,
  })

  return output
}

const convertToXML = async content => {
  const options = {
    doctype: 'html5',
    output_xhtml: true,
    force_output: true,
    tidy_mark: false,
    drop_empty_elements: false,
    preserve_entities: true,
  }

  return new Promise((resolve, reject) => {
    tidy.tidyBuffer(content, options, (err, result) => {
      if (err) {
        reject(err)
      } else if (!result.output) {
        reject(new Error('The document failed to parse'))
      } else {
        try {
          resolve(result.output.toString())
        } catch (e) {
          console.error(e)
          reject(new Error('There was an error loading the document'))
        }
      }
    })
  })
}

const gatherTexts = async (book, epubFolder) => {
  try {
    book.divisions.forEach(division => {
      division.bookComponents.forEach(bookComponent => {
        const { content: dbContent, id, componentType } = bookComponent
        const constructedId = `comp-number-${id}`
        const source = undefined
        const basename = `${constructedId}.xhtml`
        const filename = `${constructedId}`
        const mimetype = 'application/xhtml+xml'
        const target = `${epubFolder.texts}/${constructedId}.xhtml`
        const tempContent = cheerio.load(dbContent)
        const content = tempContent.xml()

        xhtmls.push({
          id: constructedId,
          source,
          target,
          mimetype,
          basename,
          filename,
          componentType,
          content,
        })
      })
    })
  } catch (e) {
    throw new Error(e)
  }
}

const transferTexts = async texts => {
  try {
    await Promise.all(
      map(texts, async text => {
        const { content, target } = text

        const tidyContent = await convertToXML(
          `<?xml version="1.0" encoding="utf-8"?>${content}`,
        )

        return writeFile(target, beautify(tidyContent))
      }),
    )
  } catch (e) {
    throw new Error(e)
  }
}

const cleaner = () => {
  images = []
  stylesheets = []
  fonts = []
  xhtmls = []
}

const EPUBPreparation = async (
  book,
  template,
  EPUBtempFolderAssetsPath,
  isbn,
) => {
  // If an isbn has been selected as a unique identifier, store it here
  const isbnIndex =
    findIndex(book?.podMetadata?.isbns, item => item.isbn === isbn) < 0
      ? null
      : findIndex(book?.podMetadata?.isbns, item => item.isbn === isbn)

  try {
    const templateFiles = await template.getFiles()
    const hasEndnotes = template.notes === 'endnotes'
    const epubFolder = await createEPUBFolder(EPUBtempFolderAssetsPath)

    await createMimetype(epubFolder.root)

    const container = await createContainer(epubFolder.metaInf)
    await writeFile(`${epubFolder.metaInf}/container.xml`, container)

    await gatherAssets(book, templateFiles, epubFolder)
    await transferAssets(images, stylesheets, fonts)

    await decorateText(book, hasEndnotes)
    await gatherTexts(book, epubFolder)
    await transferTexts(xhtmls)

    // const TOCNCX = await generateTOCNCX(book, isbnIndex)
    // await writeFile(`${epubFolder.oebps}/toc.ncx`, TOCNCX)

    const OPF = await generateContentOPF(book, isbnIndex)
    await writeFile(`${epubFolder.oebps}/content.opf`, OPF)

    cleaner()

    return epubFolder.root
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  EPUBPreparation,
  generateTOCNCX,
  generateContentOPF,
}
