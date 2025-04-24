/* eslint-disable jest/no-commented-out-tests */
// const uuid = require('uuid/v4')
// const { dbCleaner } = require('./helpers')
// const { Book, BookCollection } = require('../src').models

// describe('BookCollection', () => {
//   beforeEach(async () => {
//     await dbCleaner()
//   })

//   it('can add book collections', async () => {
//     // await new BookCollection().save()
//     const divisionId = uuid()

//     let collection, collectionId
//     await new BookCollection().save().then(res => {
//       // console.log(res)
//       collection = res
//       collectionId = res.id
//     })

//     await new Book({
//       collectionId,
//       divisions: [divisionId],
//     }).save()
//     // .then(res => console.log(res))

//     await new Book({
//       collectionId,
//       divisions: [uuid()],
//     }).save()
//     // .then(res => console.log(res))

//     // console.log(collection)

//     await collection.getBooks()
//     // .then(res => console.log(res))
//   })
// })
