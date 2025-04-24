const seedBookCollection = require('../../scripts/seeds/bookCollection')
const clearDb = require('../../scripts/helpers/_clearDB')

const {
  createBookCollection,
  getBookCollection,
  getBookCollections,
} = require('../bookCollection.controller')

const BookCollectionTranslation = require('../../models/bookCollectionTranslation/bookCollectionTranslation.model')

describe('Book Collection Controller', () => {
  beforeEach(async () => {
    await clearDb()
  })

  it('should create book collection based on title and languageIso', async () => {
    const title = 'Test Book 1'
    const languageIso = 'es'
    const bookCollection = await createBookCollection(title, languageIso)

    const bookCollectionTranslation = await BookCollectionTranslation.findOne({
      collectionId: bookCollection.id,
    })

    expect(bookCollectionTranslation.collectionId).toBe(bookCollection.id)
    expect(bookCollectionTranslation.title).toBe(title)
    expect(bookCollectionTranslation.languageIso).toBe(languageIso)
  })

  it('should fetch book based on collection id', async () => {
    const newCollection = await seedBookCollection()
    const bookCollection = await getBookCollection(newCollection.id)

    expect(bookCollection.id).toEqual(newCollection.id)
  })

  it('should fetch books based on collection', async () => {
    const title1 = 'Book Collection Test 1'
    const title2 = 'Book Collection Test 2'
    const languageIso = 'en'
    const bookCollection1 = await createBookCollection(title1, languageIso)
    const bookCollection2 = await createBookCollection(title2, languageIso)
    const options = {}
    const allBookCollection = await getBookCollections(options)

    expect(allBookCollection[0].id).toEqual(bookCollection1.id)
    expect(allBookCollection[1].id).toEqual(bookCollection2.id)
  })
})
