/* eslint-disable jest/no-commented-out-tests */
// // const uuid = require('uuid/v4')
// const { dbCleaner } = require('./helpers')

// const { Book, BookCollection, Division, ApplicationParameter } =
//   require('..').models

// const divisionConfig = [
//   {
//     name: 'Frontmatter',
//     showNumberBeforeComponents: [],
//     allowedComponentTypes: [
//       { value: 'component', title: 'Component', predefined: true },
//     ],
//     defaultComponentType: 'component',
//   },
//   {
//     name: 'Body',
//     showNumberBeforeComponents: ['chapter'],
//     allowedComponentTypes: [
//       { value: 'chapter', title: 'Chapter', predefined: true },
//       { value: 'part', title: 'Part', predefined: true },
//       { value: 'unnumbered', title: 'Unnumbered', predefined: true },
//     ],
//     defaultComponentType: 'chapter',
//   },
//   {
//     name: 'Backmatter',
//     showNumberBeforeComponents: [],
//     allowedComponentTypes: [
//       { value: 'component', title: 'Component', predefined: true },
//     ],
//     defaultComponentType: 'component',
//   },
// ]

// describe('Book', () => {
//   beforeEach(async () => {
//     await dbCleaner()
//   })
//   /* eslint-disable jest/no-commented-out-tests */
//   // it('can add books', async () => {
//   //   const divisionId = uuid()
//   //   const publicationDate = new Date().toString()

//   //   let collectionId
//   //   await new BookCollection().save().then(res => (collectionId = res.id))

//   //   // const book = await new Book({
//   //   await new Book({
//   //     // collectionId: uuid(),
//   //     collectionId,
//   //     copyrightStatement: 'lkfjslkjf',
//   //     copyrightYear: 1999,
//   //     copyrightHolder: 'djlsfjdsjlf',
//   //     divisions: [divisionId],
//   //     edition: 1,
//   //     license: 'mine it is',
//   //     publicationDate,
//   //   }).save()

//   //   // await Book.all().then(res => console.log(res))
//   //   // await BookCollection.all().then(res => console.log(res))
//   //   // await book.getCollection().then(res => console.log(res))
//   // })
//   /* eslint-enable jest/no-commented-out-tests */
//   it('creates divisions on book creation based on the config', async () => {
//     await new ApplicationParameter({
//       context: 'bookBuilder',
//       area: 'divisions',
//       config: JSON.stringify(divisionConfig),
//     }).save()

//     const collection = await new BookCollection().save()
//     const book = await new Book({ collectionId: collection.id }).save()

//     const { result: divisions } = await Division.find({ bookId: book.id })
//     expect(divisions).toHaveLength(3)
//     expect(book.divisions).toHaveLength(3)

//     const positions = {
//       front: 0,
//       body: 1,
//       back: 2,
//     }

//     divisions.forEach(division => {
//       expect(division.bookId).toBe(book.id)

//       const correctPosition = positions[division.label]
//       const actualPosition = book.divisions.indexOf(division.id)
//       expect(actualPosition).toBe(correctPosition)
//     })

//     await ApplicationParameter.query().del()
//   })

//   it('creates a default division on book creation if no config is found', async () => {
//     const collection = await new BookCollection().save()
//     const book = await new Book({ collectionId: collection.id }).save()
//     const { result: divisions } = await Division.find({ bookId: book.id })

//     expect(divisions).toHaveLength(1)
//     expect(book.divisions).toHaveLength(1)

//     const division = divisions[0]
//     expect(division.id).toBe(book.divisions[0])
//     expect(division.label).toBe('body')
//   })
// })
