/* eslint-disable jest/no-commented-out-tests */
// const uuid = require('uuid/v4')
// const { dbCleaner } = require('./helpers')

// const {
//   Book,
//   BookCollection,
//   BookComponent,
//   BookComponentState,
//   Division,
// } = require('../src').models

// describe('Book Component Translation', () => {
//   beforeEach(async () => {
//     await dbCleaner()
//   })

//   it('can create book component translations', async () => {
//     let book, collection, component, division, state

//     await new BookCollection().save().then(res => (collection = res))
//     await new Book({
//       collectionId: collection.id,
//       divisions: [uuid()],
//     })
//       .save()
//       .then(res => (book = res))

//     await new Division({
//       label: 'front',
//       bookId: book.id,
//     })
//       .save()
//       .then(res => (division = res))

//     await new BookComponent({
//       bookId: book.id,
//       componentType: 'my type',
//       divisionId: division.id,
//     })
//       .save()
//       .then(res => (component = res))

//     await new BookComponentState({
//       bookComponentId: component.id,
//     })
//       .save()
//       .then(res => (state = res))

//     // console.log(state)

//     await state.getBookComponent()
//     // .then(res => console.log(res))
//   })
// })
