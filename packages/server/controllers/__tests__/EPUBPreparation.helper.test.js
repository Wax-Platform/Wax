const cheerio = require('cheerio')

const {
  generateTOCNCX,
  generateContentOPF,
} = require('../helpers/EPUBPreparation')

describe('Book HTML Generator', () => {
  // Default test inputs
  let book
  let divisions
  let metadata
  let podMetadata

  beforeEach(async () => {
    // Define default test inputs
    divisions = [
      {
        bookComponents: [
          {
            id: 'mock-component-id-1',
            componentType: 'toc',
            hasMath: false,
          },
        ],
      },
      {
        bookComponents: [
          {
            id: 'mock-component-id-2',
            componentType: 'mock-component',
            hasMath: true,
          },
        ],
      },
    ]
    metadata = {
      isbn: '978-3-16-148410-0',
      issn: '123456',
      issnL: '123456789',
      copyrightYear: '2023',
      copyrightHolder: 'mock-copyrightHolder',
      copyrightStatement: 'mock-copyrightStatement',
      authors: ['mock author'],
      publicationDate: '2023-10-31',
    }
    podMetadata = {
      isbns: [
        { isbn: '978-3-16-148410-1', label: 'Hardcover' },
        { isbn: '978-3-16-148410-2', label: 'Softcover' },
      ],
    }

    book = {
      id: 'fake-book-uuid',
      title: 'The book that never was',
      updated: new Date(),
      divisions,
      metadata,
      podMetadata,
    }
  })

  it('renders the TOC', async () => {
    const $ = cheerio.load(await generateTOCNCX(book, false), { xmlMode: true })

    // Validate meta data
    let meta = $('ncx > head > meta')
    expect(meta.length).toEqual(4)
    meta = $('ncx > head > meta[name="dtb:uid"]')
    expect(meta.attr('content')).toEqual('urn:isbn:978-3-16-148410-0')
    meta = $('ncx > head > meta[name="dtb:depth"]')
    expect(meta.attr('content')).toEqual('1')
    meta = $('ncx > head > meta[name="dtb:totalPageCount"]')
    expect(meta.attr('content')).toEqual('0')
    meta = $('ncx > head > meta[name="dtb:maxPageNumber"]')
    expect(meta.attr('content')).toEqual('0')
  })

  it('renders the TOC using the podMetadata isbns', async () => {
    book.metadata.isbn = null
    const isbnIndex = 1 // 978-3-16-148410-2

    const $ = cheerio.load(await generateTOCNCX(book, false, isbnIndex), {
      xmlMode: true,
    })

    // Validate meta data
    let meta = $('ncx > head > meta')
    expect(meta.length).toEqual(4)
    // uid should be the first isbn in podMetadata.isbns
    meta = $('ncx > head > meta[name="dtb:uid"]')
    expect(meta.attr('content')).toEqual('urn:isbn:978-3-16-148410-2')
    meta = $('ncx > head > meta[name="dtb:depth"]')
    expect(meta.attr('content')).toEqual('1')
    meta = $('ncx > head > meta[name="dtb:totalPageCount"]')
    expect(meta.attr('content')).toEqual('0')
    meta = $('ncx > head > meta[name="dtb:maxPageNumber"]')
    expect(meta.attr('content')).toEqual('0')
  })

  it("renders the OPF using the book's isbn", async () => {
    const $ = cheerio.load(await generateContentOPF(book, false), {
      xmlMode: true,
    })

    // "BookId" is the unique identifier when there is 1 ISBN
    expect($('package').attr('unique-identifier')).toEqual('BookId')

    // package.metadata, package.manifest, package.spine
    expect($('package').children().length).toEqual(3)

    // hasMath === false
    let manifestItem = $(
      'package > manifest > item[id="comp-number-mock-component-id-1"]',
    )
    expect(manifestItem.attr('properties')).toEqual('nav')
    // hasMath === false
    manifestItem = $(
      'package > manifest > item[id="comp-number-mock-component-id-2"]',
    )
    expect(manifestItem.attr('properties')).toEqual('mathml')

    // 2 book components
    expect($('package > spine > itemref').length).toEqual(2)

    // 1 Creator
    const creator = $('package > metadata > dc\\:creator')
    expect(creator.length).toEqual(1)
    expect(creator.attr('id')).toEqual('creator0')
    expect(creator.text()).toEqual('mock author')

    // Book Title
    expect($('package > metadata > dc\\:title').text()).toEqual(
      'The book that never was',
    )

    // Book date
    expect($('package > metadata > dc\\:date').text()).toEqual('2023-10-31')

    // Book rights
    expect($('package > metadata > dc\\:rights').text()).toEqual(
      '2023. mock-copyrightHolder. mock-copyrightStatement',
    )

    // Book publisher
    expect($('package > metadata > dc\\:publisher').text()).toEqual(
      'mock-copyrightHolder',
    )

    // 1 ISBN identifier
    const identifier = $('package > metadata > dc\\:identifier')
    expect(identifier.length).toEqual(2)
    expect(identifier.text()).toEqual(
      'urn:isbn:978-3-16-148410-0urn:uuid:fake-book-uuid',
    )
    expect(identifier.attr('id')).toEqual('BookId')

    const identifierMeta = $(
      'package > metadata > meta[property="identifier-type"]',
    )

    expect(identifierMeta.length).toEqual(1)
    expect(identifierMeta.text()).toEqual('15')
    expect(identifierMeta.attr('scheme')).toEqual('onix:codelist5')
    expect(identifierMeta.attr('refines')).toEqual('#BookId')
  })

  it('renders the OPF using the podMetadata isbns', async () => {
    book.metadata.isbn = null
    const isbnIndex = 1 // Softcover, 978-3-16-148410-2

    const $ = cheerio.load(await generateContentOPF(book, false, isbnIndex), {
      xmlMode: true,
    })

    // "BookId-Hardcover" is the unique identifier; this is the first ISBN
    expect($('package').attr('unique-identifier')).toEqual('BookId-Softcover')

    // package.metadata, package.manifest, package.spine
    expect($('package').children().length).toEqual(3)

    // hasMath === false
    let manifestItem = $(
      'package > manifest > item[id="comp-number-mock-component-id-1"]',
    )
    expect(manifestItem.attr('properties')).toEqual('nav')
    // hasMath === false
    manifestItem = $(
      'package > manifest > item[id="comp-number-mock-component-id-2"]',
    )
    expect(manifestItem.attr('properties')).toEqual('mathml')

    // 2 book components
    expect($('package > spine > itemref').length).toEqual(2)

    // 1 Creator
    const creator = $('package > metadata > dc\\:creator')
    expect(creator.length).toEqual(1)
    expect(creator.attr('id')).toEqual('creator0')
    expect(creator.text()).toEqual('mock author')

    // Book Title
    expect($('package > metadata > dc\\:title').text()).toEqual(
      'The book that never was',
    )

    // Book date
    expect($('package > metadata > dc\\:date').text()).toEqual('2023-10-31')

    // Book rights
    expect($('package > metadata > dc\\:rights').text()).toEqual(
      '2023. mock-copyrightHolder. mock-copyrightStatement',
    )

    // Book publisher
    expect($('package > metadata > dc\\:publisher').text()).toEqual(
      'mock-copyrightHolder',
    )

    // 2 ISBN identifiers
    let identifier = $('package > metadata > dc\\:identifier')
    expect(identifier.length).toEqual(2)
    let identifierMeta = $(
      'package > metadata > meta[property="identifier-type"]',
    )
    expect(identifierMeta.length).toEqual(2)

    // The first ISBN will be the uid
    identifier = $(
      'package > metadata > dc\\:identifier[id="BookId-Hardcover"]',
    )
    expect(identifier.text()).toEqual('urn:isbn:978-3-16-148410-1')
    identifierMeta = $('package > metadata > meta[refines="#BookId-Hardcover"]')
    expect(identifierMeta.text()).toEqual('15')
    expect(identifierMeta.attr('scheme')).toEqual('onix:codelist5')

    // The second ISBN will also be listed
    identifier = $(
      'package > metadata > dc\\:identifier[id="BookId-Softcover"]',
    )
    expect(identifier.text()).toEqual('urn:isbn:978-3-16-148410-2')
    identifierMeta = $('package > metadata > meta[refines="#BookId-Softcover"]')
    expect(identifierMeta.text()).toEqual('15')
    expect(identifierMeta.attr('scheme')).toEqual('onix:codelist5')
  })
})
