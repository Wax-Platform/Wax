const clearDb = require('../../scripts/helpers/_clearDB')

const {
  createBookSettings,
  getBookSettings,
  updateBookSettings,
} = require('../bookSettings.controller')

const { createBook } = require('../book.controller')
const seedApplicationParameters = require('../../scripts/seeds/applicationParameters')

describe('Book Settings Controller', () => {
  beforeEach(async () => {
    await clearDb()
    await seedApplicationParameters()
  })

  it('should create book settings given a book id', async () => {
    const newBook = await createBook()
    const bookSetting = await createBookSettings({ bookId: newBook.id })

    expect(bookSetting).toBeDefined()
    expect(bookSetting.bookId).toEqual(newBook.id)
  })

  it('should fetch book settings given a book id', async () => {
    const newBook = await createBook()
    await createBookSettings({ bookId: newBook.id })

    const bookSetting = await getBookSettings(newBook.id)

    expect(bookSetting).toBeDefined()
    expect(bookSetting.bookId).toEqual(newBook.id)
  })

  it('should update book settings given a book id', async () => {
    const newBook = await createBook()
    await createBookSettings({ bookId: newBook.id })

    const updatedBookSetting = await updateBookSettings(newBook.id, {
      aiOn: true,
    })

    expect(updatedBookSetting.bookId).toEqual(newBook.id)
    expect(updatedBookSetting.aiOn).toBeTruthy()
  })

  it('fails to update book settings if book does not exist', async () => {
    await expect(
      updateBookSettings('f58f838f-57a2-494a-95c0-67ee01c63d8b', {}),
    ).rejects.toThrow('No book setting found')
  })

  it('fails fetch book settings if book does not exist', async () => {
    await expect(
      getBookSettings('f58f838f-57a2-494a-95c0-67ee01c63d8b'),
    ).resolves.toEqual(undefined)
  })
})
