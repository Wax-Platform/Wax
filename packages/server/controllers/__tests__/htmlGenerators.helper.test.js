const _ = require('lodash')
const cheerio = require('cheerio')
const { generateCopyrightsPage } = require('../helpers/htmlGenerators')

describe('Book HTML Generator', () => {
  // Default test inputs
  let bookTitle
  let bookComponent
  let podMetadata

  beforeEach(async () => {
    // Define default test inputs
    bookTitle = 'The book that never was'
    bookComponent = {
      id: 'mock-component-id',
      componentType: 'mock-component',
      division: 'mock-division',
      pagination: { left: false, right: false },
    }
    podMetadata = {
      copyrightLicense: 'CC',
      licenseTypes: false,
      publicDomainType: null,
      isbns: [
        { isbn: '978-3-16-148410-0', label: 'Hardcover' },
        { isbn: '978-3-16-148410-1', label: 'Softcover' },
      ],
      topPage: 'Top of page content',
      bottomPage: 'Bottom of page content',
      ncCopyrightHolder: 'mock-ncCopyrightHolder',
      ncCopyrightYear: '2023',
      saCopyrightHolder: 'mock-saCopyrightHolder',
      saCopyrightYear: '2023',
    }
  })

  it('renders the copyright page', async () => {
    const copyrightHtml = generateCopyrightsPage(
      bookTitle,
      bookComponent,
      podMetadata,
    )

    const $ = cheerio.load(copyrightHtml)
    const $sectionLevel1 = $('html > body > section')

    // Validate root section ($sectionLevel1) attributes
    expect($sectionLevel1.attr('id')).toEqual('comp-number-mock-component-id')
    expect(_.sortBy($sectionLevel1.attr('class').trim().split(/\s/))).toEqual([
      'component-mock-division',
      'mock-component',
    ])

    // Validate child sections ($sectionsLevel2)
    const $sectionsLevel2 = $sectionLevel1.children()
    expect($sectionsLevel2.length).toEqual(3)
    // Validate header section
    expect($sectionsLevel2[0].attribs).toEqual({ class: 'copyright-before' })
    expect($sectionsLevel2[0].children.length).toEqual(1)
    expect($sectionsLevel2[0].children[0].data).toEqual('Top of page content')

    // Validate copyrights section
    expect($sectionsLevel2[1].attribs).toEqual({ class: 'book-copyrights' })
    expect($sectionsLevel2[1].children.length).toEqual(2)
    // Copyrights section should start with isbns
    expect($sectionsLevel2[1].children[0].type).toEqual('tag')
    expect($sectionsLevel2[1].children[0].name).toEqual('p')
    expect($sectionsLevel2[1].children[0].attribs).toEqual({ class: 'isbns' })
    // Copyrights section should end with main content
    expect($sectionsLevel2[1].children[1].type).toEqual('tag')
    expect($sectionsLevel2[1].children[1].name).toEqual('p')
    expect($sectionsLevel2[1].children[1].attribs).toEqual({
      class: 'main-content',
    })

    // Validate footer section
    expect($sectionsLevel2[2].attribs).toEqual({ class: 'copyright-after' })
    expect($sectionsLevel2[2].children.length).toEqual(1)
    expect($sectionsLevel2[2].children[0].data).toEqual(
      'Bottom of page content',
    )

    // Validate isbns paragraph
    const isbns = $sectionLevel1.find('section.book-copyrights > p.isbns')[0]
      .children

    expect(isbns.length).toEqual(2)
    expect(isbns[0].type).toEqual('tag')
    expect(isbns[0].name).toEqual('span')
    expect(isbns[0].attribs).toEqual({ class: 'isbn-item' })
    // Validate first isbn
    const [label0, isbn0] = isbns[0].children
    expect(label0.type).toEqual('tag')
    expect(label0.name).toEqual('span')
    expect(label0.attribs).toEqual({ class: 'isbn-label' })
    expect(label0.children[0].data).toEqual('Hardcover')
    expect(isbn0.type).toEqual('tag')
    expect(isbn0.name).toEqual('span')
    expect(isbn0.attribs).toEqual({ class: 'isbn-number' })
    expect(isbn0.children[0].data).toEqual('978-3-16-148410-0')
    // Validate second isbn
    const [label1, isbn1] = isbns[1].children
    expect(label1.type).toEqual('tag')
    expect(label1.name).toEqual('span')
    expect(label1.attribs).toEqual({ class: 'isbn-label' })
    expect(label1.children[0].data).toEqual('Softcover')
    expect(isbn1.type).toEqual('tag')
    expect(isbn1.name).toEqual('span')
    expect(isbn1.attribs).toEqual({ class: 'isbn-number' })
    expect(isbn1.children[0].data).toEqual('978-3-16-148410-1')

    // Validate main-content paragraph
    let content = $('section.book-copyrights > p.main-content > span')
    expect(content.length).toEqual(4)
    // Validate main-content book-title
    content = $('section.book-copyrights > p.main-content > span:nth-child(1)')
    expect(content.attr()).toEqual({ class: 'book-title' })
    expect(content.text().trim()).toEqual('The book that never was')
    // Validate main-content copyrights-symbol
    content = $('section.book-copyrights > p.main-content > span:nth-child(2)')
    expect(content.attr()).toEqual({ class: 'copyrights-symbol' })
    expect(content.text().trim()).toEqual('©')
    // Validate main-content copyrights-year
    content = $('section.book-copyrights > p.main-content > span:nth-child(3)')
    expect(content.attr()).toEqual({ class: 'copyrights-year' })
    expect(content.text().trim()).toEqual('2023')
    // Validate main-content copyrights-year
    content = $('section.book-copyrights > p.main-content > span:nth-child(4)')
    expect(content.attr()).toEqual({ class: 'copyrights-holder' })
    expect(content.text().trim()).toEqual('by mock-saCopyrightHolder')
  })
})
