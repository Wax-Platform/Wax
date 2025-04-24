/* eslint-disable jest/no-commented-out-tests */
// const uuid = require('uuid/v4')
// const { dbCleaner } = require('./helpers')
// const { Book, BookCollection, Division } = require('../src').models

// describe('Division', () => {
//   beforeEach(async () => {
//     await dbCleaner()
//   })

//   it('can add books', async () => {
//     let book, collection, division

//     await new BookCollection().save().then(res => (collection = res))
//     await new Book({
//       collectionId: collection.id,
//       divisions: [uuid()],
//     })
//       .save()
//       .then(res => (book = res))

//     await new Division({
//       bookId: book.id,
//       label: 'Body',
//     })
//       .save()
//       .then(res => {
//         // console.log(res)
//         division = res
//       })

//     await division.getBook()
//     // .then(res => console.log(res))
//   })
// })
