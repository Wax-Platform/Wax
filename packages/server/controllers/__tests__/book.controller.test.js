const { useTransaction } = require('@coko/server')
const User = require('../../models/user/user.model')
const Team = require('../../models/team/team.model')
const BookTranslation = require('../../models/bookTranslation/bookTranslation.model')
const seedAdmin = require('../../scripts/seeds/admin')
const seedUser = require('../../scripts/seeds/user')
const seedBookCollection = require('../../scripts/seeds/bookCollection')
const seedGlobalTeams = require('../../scripts/seeds/globalTeams')
const seedApplicationParams = require('../../scripts/seeds/applicationParameters')

const clearDb = require('../../scripts/helpers/_clearDB')
const { createBook, getBooks } = require('../book.controller')

describe('Book Controller', () => {
  beforeEach(async () => {
    await clearDb()
    await seedGlobalTeams()
    await seedApplicationParams()
  })

  it('creates a book by providing a collectionId', async () => {
    const newCollection = await seedBookCollection()
    const newBook = await createBook({ collectionId: newCollection.id })
    expect(newBook).toBeDefined()
    expect(newBook.collectionId).toEqual(newCollection.id)
  })

  it('creates a book by providing a collectionId and a title', async () => {
    const newCollection = await seedBookCollection()
    const title = 'Test Book'
    const newBook = await createBook({ collectionId: newCollection.id, title })

    const bookTranslation = await BookTranslation.findOne({
      bookId: newBook.id,
    })

    expect(newBook).toBeDefined()
    expect(newBook.collectionId).toEqual(newCollection.id)
    expect(bookTranslation).toBeDefined()
    expect(bookTranslation.title).toEqual(title)
  })

  it('creates a book by providing just a title', async () => {
    const title = 'Test Book'
    const newBook = await createBook({ title })

    const bookTranslation = await BookTranslation.findOne({
      bookId: newBook.id,
    })

    expect(newBook).toBeDefined()
    expect(newBook.collectionId).toEqual(undefined)
    expect(bookTranslation).toBeDefined()
    expect(bookTranslation.title).toEqual(title)
  })

  it('creates a book without collectionId nor title', async () => {
    const newBook = await createBook()

    const bookTranslation = await BookTranslation.findOne({
      bookId: newBook.id,
    })

    expect(newBook).toBeDefined()
    expect(newBook.collectionId).toEqual(undefined)
    expect(bookTranslation).toBeDefined()
    expect(bookTranslation.title).toEqual(null)
  })

  it('creates a book without collectionId nor title and adds creator to specified teams', async () => {
    const user = await seedAdmin({
      username: 'admin',
      password: 'password',
      email: 'admin@example.com',
      givenNames: 'Admin',
      surname: 'Adminius',
    })

    const newBook = await createBook({
      options: {
        addUserToBookTeams: ['productionEditor'],
        userId: user.id,
      },
    })

    const bookTranslation = await BookTranslation.findOne({
      bookId: newBook.id,
    })

    const isTeamMember = await User.hasRoleOnObject(
      user.id,
      'productionEditor',
      newBook.id,
    )

    expect(newBook).toBeDefined()
    expect(newBook.collectionId).toEqual(undefined)
    expect(bookTranslation).toBeDefined()
    expect(bookTranslation.title).toEqual(null)
    expect(isTeamMember).toEqual(true)
  })

  it('get all the available books of the system for admin', async () => {
    const newCollection = await seedBookCollection()

    const title = 'Test Book New'
    const newBook = await createBook({ collectionId: newCollection.id, title })

    const user = await seedAdmin({
      username: 'admin',
      password: 'password',
      email: 'admin@example.com',
      givenNames: 'Admin',
      surname: 'Adminius',
    })

    const options = {
      showArchived: false,
    }

    const books = await getBooks({
      collectionId: newCollection.id,
      userId: user.id,
      options,
    })

    expect(books).toBeDefined()
    expect(books.result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: newBook.id,
        }),
      ]),
    )
  })

  it('get all the available books of the system for admin for different orderBy cases', async () => {
    const newCollection = await seedBookCollection()

    const title1 = 'AA Test Book New'
    const title2 = 'BA Test Book New'

    const newBook1 = await createBook({
      collectionId: newCollection.id,
      title: title1,
    })

    const newBook2 = await createBook({
      collectionId: newCollection.id,
      title: title2,
    })

    const user = await seedAdmin({
      username: 'admin',
      password: 'password',
      email: 'admin@example.com',
      givenNames: 'Admin',
      surname: 'Adminius',
    })

    const options = {
      orderBy: { column: 'title', order: 'asc' },
      showArchived: false,
    }

    const books = await getBooks({
      collectionId: newCollection.id,
      userId: user.id,
      options,
    })

    expect(books).toBeDefined()
    expect(books.result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: newBook1.id,
        }),
        expect.objectContaining({
          id: newBook2.id,
        }),
      ]),
    )
    expect(books.result[0].title).toEqual(title1)
    expect(books.result[1].title).toEqual(title2)
  })

  it(`get all the available books of the system for admin for different page and page sizes`, async () => {
    const newCollection = await seedBookCollection()

    await useTransaction(
      async tr => {
        return Promise.all(
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(async item => {
            return createBook({
              collectionId: newCollection.id,
              title: `Book ${item}`,
              options: { trx: tr },
            })
          }),
        )
      },
      { trx: undefined },
    )

    const user = await seedAdmin({
      username: 'admin3',
      password: 'password',
      email: 'admin3@example.com',
      givenNames: 'Admin',
      surname: 'Adminius',
    })

    const options1 = {
      page: 0,
      pageSize: 5,
      orderBy: { column: 'title', order: 'asc' },
      showArchived: false,
    }

    const option2 = {
      page: 1,
      pageSize: 5,
      orderBy: { column: 'title', order: 'asc' },
      showArchived: false,
    }

    const option3 = {
      page: 2,
      pageSize: 5,
      orderBy: { column: 'title', order: 'asc' },
      showArchived: false,
    }

    const books = await getBooks({
      collectionId: newCollection.id,
      userId: user.id,
      options: options1,
    })

    const books1 = await getBooks({
      collectionId: newCollection.id,
      userId: user.id,
      options: option2,
    })

    const books2 = await getBooks({
      collectionId: newCollection.id,
      userId: user.id,
      options: option3,
    })

    expect(books).toBeDefined()
    expect(books.result).toHaveLength(5)
    expect(books1.result).toHaveLength(5)
    expect(books2.result).toHaveLength(4)
  })

  it('get all the available books of the system for team members of the global teams defined in getBooks filter', async () => {
    const newCollection = await seedBookCollection()

    const title = 'Test Book New'

    const user = await seedUser({
      username: 'user',
      password: 'password',
      email: 'user@example.com',
      givenNames: 'User',
      surname: 'Global P',
    })

    const newBook = await createBook({
      collectionId: newCollection.id,
      title,
    })

    // global production editor
    await Team.addMemberToGlobalTeam(user.id, 'productionEditor')

    const options = {
      showArchived: false,
    }

    const books = await getBooks({
      collectionId: newCollection.id,
      userId: user.id,
      options,
    })

    expect(books).toBeDefined()
    expect(books.result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: newBook.id,
        }),
      ]),
    )
  })

  it(`get user's available books based on team memberships`, async () => {
    const newCollection = await seedBookCollection()
    const title = 'Test Book New'

    const user = await seedUser({
      username: 'user',
      password: 'password',
      email: 'user@example.com',
      givenNames: 'User',
      surname: 'Example',
    })

    const newBook = await createBook({
      options: {
        addUserToBookTeams: ['productionEditor'],
        userId: user.id,
      },
      collectionId: newCollection.id,
      title,
    })

    const isTeamMember = await User.hasRoleOnObject(
      user.id,
      'productionEditor',
      newBook.id,
    )

    const options = {
      showArchived: false,
    }

    const books = await getBooks({
      collectionId: newCollection.id,
      userId: user.id,
      options,
    })

    expect(books).toBeDefined()
    expect(books.result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: newBook.id,
        }),
      ]),
    )
    expect(isTeamMember).toEqual(true)
  })

  it(`returns no duplicate books for a user who exists in more than one team of the same book`, async () => {
    const title = 'Test Duplicate Books'

    const user = await seedUser({
      username: 'user',
      password: 'password',
      email: 'user@example.com',
      givenNames: 'User',
      surname: 'Example',
    })

    const newBook = await createBook({
      options: {
        addUserToBookTeams: ['productionEditor', 'author'],
        userId: user.id,
      },
      title,
    })

    const isTeamMember1 = await User.hasRoleOnObject(
      user.id,
      'productionEditor',
      newBook.id,
    )

    const isTeamMember2 = await User.hasRoleOnObject(
      user.id,
      'author',
      newBook.id,
    )

    const options = {
      showArchived: false,
    }

    const books = await getBooks({
      userId: user.id,
      options,
    })

    const titleCount = books.result.filter(book => book.title === title).length

    expect(books).toBeDefined()
    expect(titleCount).toBe(1)
    expect(isTeamMember1).toEqual(true)
    expect(isTeamMember2).toEqual(true)
  })
})
