const clearDb = require('../../scripts/helpers/_clearDB')

const seedBookCollection = require('../../scripts/seeds/bookCollection')

const seedApplicationParameters = require('../../scripts/seeds/applicationParameters')

const { createBook } = require('../book.controller')

const {
  createDivision,
  getDivision,
  updateBookComponentOrder,
  updateBookComponentsOrder,
} = require('../division.controller')

const { addBookComponent } = require('../bookComponent.controller')

describe('Division Controller', () => {
  beforeEach(async () => {
    await clearDb()
  }, 30000)

  it('should create division based on division data', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'

    const newBook = await createBook({ collectionId: newCollection.id, title })

    const division = await createDivision({ bookId: newBook.id, label: 'body' })

    expect(division.bookId).toBe(newBook.id)
    expect(division.label).toBe('body')
  })

  it('should fetch division based on division Id', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'

    const newBook = await createBook({ collectionId: newCollection.id, title })

    const division = await createDivision({ bookId: newBook.id, label: 'body' })

    const fetchDivision = await getDivision(division.id)

    expect(fetchDivision.id).toBe(division.id)
    expect(fetchDivision.bookId).toBe(newBook.id)
  })

  it('should update book component order based on division id, book component id, index', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'
    const componentTypes = ['component', 'preface', 'introduction', 'titlepage']
    const index = 0

    const newBook = await createBook({ collectionId: newCollection.id, title })

    const division = await createDivision({
      bookId: newBook.id,
      label: 'Frontmatter',
    })

    const testBookComponents = await Promise.all(
      componentTypes.map(async componentType => {
        const bookComponent = await addBookComponent(
          division.id,
          newBook.id,
          componentType,
        )

        return bookComponent
      }),
    )

    const updatedBookComponentOrder = await updateBookComponentOrder(
      division.id,
      testBookComponents[3].id,
      index,
    )

    const updatedDivision = await getDivision(division.id)

    expect(updatedBookComponentOrder.id).toBe(newBook.id)
    expect(updatedDivision.bookComponents[0]).toBe(testBookComponents[3].id)
  })

  it('should update book components order based on division id, book components', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'

    const newBook = await createBook({ collectionId: newCollection.id, title })

    const division = await createDivision({
      bookId: newBook.id,
      label: 'Frontmatter',
    })

    const bookComponentOne = await addBookComponent(
      division.id,
      newBook.id,
      'component',
    )

    const bookComponentTwo = await addBookComponent(
      division.id,
      newBook.id,
      'titlePage',
    )

    const updatedBookComponentsOrder = await updateBookComponentsOrder(
      division.id,
      [bookComponentTwo.id, bookComponentOne.id],
    )

    const updatedDivision = await getDivision(division.id)

    expect(updatedBookComponentsOrder.id).toBe(newBook.id)
    expect(updatedDivision.bookComponents[0]).toBe(bookComponentTwo.id)
    expect(updatedDivision.bookComponents[1]).toBe(bookComponentOne.id)
  })
})
