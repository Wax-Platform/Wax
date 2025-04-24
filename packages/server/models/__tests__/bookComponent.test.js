/* eslint-disable jest/no-commented-out-tests */
// const uuid = require('uuid/v4')
// const { dbCleaner } = require('./helpers')

// const {
//   Book,
//   BookCollection,
//   BookComponent,
//   Division,
// } = require('../src').models

// describe('Book Component', () => {
//   beforeEach(async () => {
//     await dbCleaner()
//   })

//   it('can add book components', async () => {
//     let book, collection, component, division

//     await new BookCollection().save().then(res => (collection = res))

//     await new Book({
//       collectionId: collection.id,
//       divisions: [uuid()],
//     })
//       .save()
//       .then(res => (book = res))

//     await new Division({
//       bookId: book.id,
//       label: 'Frontmatter',
//     })
//       .save()
//       .then(res => (division = res))

//     await new BookComponent({
//       bookId: book.id,
//       componentType: 'mytype',
//       divisionId: division.id,
//     })
//       .save()
//       .then(res => (component = res))

//     // console.log(component)
//     await component.getBook()
//     // .then(res => console.log(res))

//     await component.getDivision()
//     // .then(res => console.log(res))
//   })
// })
