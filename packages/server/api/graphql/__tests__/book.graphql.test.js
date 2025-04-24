/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable jest/no-disabled-tests */
const _ = require('lodash')
const BookTranslation = require('../../../models/bookTranslation/bookTranslation.model')
const BookSettings = require('../../../models/bookSettings/bookSettings.model')
const seedAdmin = require('../../../scripts/seeds/admin')
const seedGlobalTeams = require('../../../scripts/seeds/globalTeams')
const seedApplicationParams = require('../../../scripts/seeds/applicationParameters')
const clearDb = require('../../../scripts/helpers/_clearDB')
const testGraphQLServer = require('../../../scripts/helpers/testGraphQLServer')

const createBookGraphQL = async (
  testServer,
  { input = { title: 'A book with just a title' }, resStructure = '{id}' },
) => {
  return testServer.executeOperation({
    query: `mutation($input: CreateBookInput!){createBook(input: $input) ${resStructure}}`,
    variables: { input },
  })
}

const deleteBookGraphQL = async (
  testServer,
  { id = '', resStructure = '{id}' },
) => {
  return testServer.executeOperation({
    query: `mutation($id: ID!){deleteBook(id: $id) ${resStructure}}`,
    variables: { id },
  })
}

describe('Book GraphQL Query', () => {
  let user
  let testServer

  beforeEach(async () => {
    await clearDb()
    await seedGlobalTeams()
    await seedApplicationParams()
    user = await seedAdmin({
      username: 'admin',
      password: 'password',
      email: 'admin@example.com',
      givenNames: 'Admin',
      surname: 'Adminius',
    })
    testServer = await testGraphQLServer(user.id)
  })

  it('creates a book with just a title', async () => {
    const res = await createBookGraphQL(testServer, {
      resStructure: `{
    id
    authors{id}
    archived
    bookStructure{id}
    collectionId
    copyrightStatement
    copyrightYear
    copyrightHolder
    divisions{id}
    edition
    isPublished
    isbn
    issn
    issnL
    license
    productionEditors
    publicationDate
    subtitle
    podMetadata{isbns{isbn, label}}
    status
    title
    thumbnailId
    thumbnailURL}`,
    })

    const bookData = res.data.createBook
    expect(res.errors).toBe(undefined)
    expect(_.sortBy(Object.keys(bookData))).toEqual([
      'archived',
      'authors',
      'bookStructure',
      'collectionId',
      'copyrightHolder',
      'copyrightStatement',
      'copyrightYear',
      'divisions',
      'edition',
      'id',
      'isPublished',
      'isbn',
      'issn',
      'issnL',
      'license',
      'podMetadata',
      'productionEditors',
      'publicationDate',
      'status',
      'subtitle',
      'thumbnailId',
      'thumbnailURL',
      'title',
    ])
    // Book was created without an author
    expect(bookData.authors).toEqual([])
    expect(bookData.podMetadata).toBe(null)
    expect(bookData.title).toEqual('A book with just a title')

    // There should be exactly on Book and therefore, one BookTranslation
    const bookTranslations = await BookTranslation.query()
    expect(bookTranslations.length).toEqual(1)
    expect(bookTranslations[0].bookId).toEqual(bookData.id)
    expect(bookTranslations[0].title).toEqual(bookData.title)
  })

  it('creates and then updates its podMetadata', async () => {
    let res = await createBookGraphQL(testServer, {})
    const bookData = res.data.createBook
    expect(res.errors).toBe(undefined)
    expect(_.sortBy(Object.keys(bookData))).toEqual(['id'])

    // Update the book
    res = await testServer.executeOperation({
      query: `mutation($bookId: ID!, $metadata: PODMetadataInput!){
  updatePODMetadata(bookId: $bookId, metadata: $metadata) {
    id
    podMetadata{
      authors
      bottomPage
      copyrightLicense
      isbns{isbn, label}
      licenseTypes{NC, SA, ND}
      ncCopyrightHolder
      ncCopyrightYear
      publicDomainType
      saCopyrightHolder
      saCopyrightYear
      topPage
    }
  }}`,
      variables: {
        bookId: bookData.id,
        metadata: {
          /* authors
          bottomPage
          copyrightLicense */
          isbns: [{ isbn: '978-3-16-148410-0', label: 'hardcover' }],
          /* licenseTypes
          ncCopyrightHolder
          ncCopyrightYear
          publicDomainType
          saCopyrightHolder
          saCopyrightYear
          topPage */
        },
      },
    })

    const bookUpdated = res.data.updatePODMetadata
    expect(res.errors).toBe(undefined)
    expect(_.sortBy(Object.keys(bookUpdated))).toEqual(['id', 'podMetadata'])
    expect(_.sortBy(Object.keys(bookUpdated.podMetadata))).toEqual([
      'authors',
      'bottomPage',
      'copyrightLicense',
      'isbns',
      'licenseTypes',
      'ncCopyrightHolder',
      'ncCopyrightYear',
      'publicDomainType',
      'saCopyrightHolder',
      'saCopyrightYear',
      'topPage',
    ])

    // Book was created without an author
    expect(bookUpdated.podMetadata.isbns).toEqual([
      { isbn: '978-3-16-148410-0', label: 'hardcover' },
    ])
  })

  it('Fails to update book with duplicate ISBN numbers', async () => {
    // Prepare the book
    let res = await createBookGraphQL(testServer, {})
    const bookId = res.data.createBook.id
    res = await testServer.executeOperation({
      query: `mutation($bookId: ID!, $metadata: PODMetadataInput!){
  updatePODMetadata(bookId: $bookId, metadata: $metadata) {id}}`,
      variables: {
        bookId,
        metadata: {
          isbns: [
            { isbn: '978-3-16-148410-0', label: 'hardcover' },
            { isbn: '978-3-16-148410-0', label: 'softcover' },
          ],
        },
      },
    })
    expect(res.data).toBe(null)
    expect(res.errors.length).toEqual(1)
    expect(res.errors[0].constructor.name).toEqual('GraphQLError')
    expect(res.errors[0].message).toEqual(
      'ValidationError: ISBN list should not contain duplicate labels or values',
    )
  })

  it('Fails to update book with duplicate ISBN labels', async () => {
    // Prepare the book
    let res = await createBookGraphQL(testServer, {})
    const bookId = res.data.createBook.id
    res = await testServer.executeOperation({
      query: `mutation($bookId: ID!, $metadata: PODMetadataInput!){
  updatePODMetadata(bookId: $bookId, metadata: $metadata) {id}}`,
      variables: {
        bookId,
        metadata: {
          isbns: [
            { isbn: '978-3-16-148410-0', label: 'hardcover' },
            { isbn: '978-3-16-148410-1', label: 'hardcover' },
          ],
        },
      },
    })
    expect(res.data).toBe(null)
    expect(res.errors.length).toEqual(1)
    expect(res.errors[0].constructor.name).toEqual('GraphQLError')
    expect(res.errors[0].message).toEqual(
      'ValidationError: ISBN list should not contain duplicate labels or values',
    )
  })

  it('Fails to update book with missing ISBN number', async () => {
    // Prepare the book
    let res = await createBookGraphQL(testServer, {})
    const bookId = res.data.createBook.id
    res = await testServer.executeOperation({
      query: `mutation($bookId: ID!, $metadata: PODMetadataInput!){
  updatePODMetadata(bookId: $bookId, metadata: $metadata) {id}}`,
      variables: {
        bookId,
        metadata: {
          isbns: [{ label: 'hardcover' }],
        },
      },
    })
    expect(res.data).toBe(undefined)
    expect(res.errors.length).toEqual(1)
    expect(res.errors[0].constructor.name).toEqual('UserInputError')
  })

  it('Fails to update book with missing ISBN label', async () => {
    // Prepare the book
    let res = await createBookGraphQL(testServer, {})
    const bookId = res.data.createBook.id
    res = await testServer.executeOperation({
      query: `mutation($bookId: ID!, $metadata: PODMetadataInput!){
  updatePODMetadata(bookId: $bookId, metadata: $metadata) {id}}`,
      variables: {
        bookId,
        metadata: {
          isbns: [{ isbn: '978-3-16-148410-0' }],
        },
      },
    })
    expect(res.data).toBe(undefined)
    expect(res.errors.length).toEqual(1)
    expect(res.errors[0].constructor.name).toEqual('UserInputError')
  })

  it('gets a book', async () => {
    // Prepare the book
    let res = await createBookGraphQL(testServer, {})
    const bookId = res.data.createBook.id
    await testServer.executeOperation({
      query: `mutation($bookId: ID!, $metadata: PODMetadataInput!){
  updatePODMetadata(bookId: $bookId, metadata: $metadata) {id}}`,
      variables: {
        bookId,
        metadata: {
          isbns: [
            { isbn: '978-3-16-148410-0', label: 'hardcover' },
            { isbn: '978-3-16-148410-1', label: 'softcover' },
          ],
        },
      },
    })

    res = await testServer.executeOperation({
      query: `query($id: ID!){
  getBook(id: $id) {
    id
    authors{id}
    archived
    bookStructure{id}
    collectionId
    copyrightStatement
    copyrightYear
    copyrightHolder
    divisions{id}
    edition
    isPublished
    isbn
    issn
    issnL
    license
    productionEditors
    publicationDate
    subtitle
    podMetadata{isbns{isbn, label}}
    status
    title
    thumbnailId
    thumbnailURL}}`,
      variables: { id: bookId },
    })

    const bookData = res.data.getBook
    expect(res.errors).toBe(undefined)
    expect(bookData.id).toEqual(bookId)
    expect(_.sortBy(Object.keys(bookData))).toEqual([
      'archived',
      'authors',
      'bookStructure',
      'collectionId',
      'copyrightHolder',
      'copyrightStatement',
      'copyrightYear',
      'divisions',
      'edition',
      'id',
      'isPublished',
      'isbn',
      'issn',
      'issnL',
      'license',
      'podMetadata',
      'productionEditors',
      'publicationDate',
      'status',
      'subtitle',
      'thumbnailId',
      'thumbnailURL',
      'title',
    ])
    expect(bookData.podMetadata.isbns).toEqual([
      { isbn: '978-3-16-148410-0', label: 'hardcover' },
      { isbn: '978-3-16-148410-1', label: 'softcover' },
    ])
  })

  it('creates a corresponding book settings when a book is created', async () => {
    const res = await createBookGraphQL(testServer, {
      resStructure: '{id}',
    })

    const bookData = res.data.createBook

    const bookSettings = await BookSettings.query().where('bookId', bookData.id)
    expect(bookSettings.length).toEqual(1)
    expect(bookSettings[0].bookId).toEqual(bookData.id)
  })

  it('deletes the corresponding book settings when a book is deleted', async () => {
    const creationRes = await createBookGraphQL(testServer, {
      resStructure: '{id}',
    })

    const bookData = creationRes.data.createBook

    await deleteBookGraphQL(testServer, {
      resStructure: '{id}',
      id: bookData.id,
    })

    const bookSettings = await BookSettings.query().where('bookId', bookData.id)
    expect(bookSettings.length).toEqual(1)
    expect(bookSettings[0].deleted).toBeTruthy()
  })
})
