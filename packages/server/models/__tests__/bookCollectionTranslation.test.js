/* eslint-disable jest/no-commented-out-tests */
// const { dbCleaner } = require('./helpers')

// const { BookCollection, BookCollectionTranslation } = require('../src').models

// describe('Book Collection Translation', () => {
//   beforeEach(async () => {
//     await dbCleaner()
//   })

//   it('can add book collection translations', async () => {
//     let collection, translation

//     await new BookCollection().save().then(res => (collection = res))

//     await new BookCollectionTranslation({
//       collectionId: collection.id,
//       languageIso: 'en',
//       title: 'mine',
//     })
//       .save()
//       .then(res => (translation = res))

//     // console.log(translation)

//     await new BookCollectionTranslation({
//       collectionId: collection.id,
//       languageIso: 'el',
//       title: 'mine',
//     }).save()
//     // .then(res => console.log(res))

//     await translation.getCollection()
//     // .then(res => console.log(res))
//   })
// })
