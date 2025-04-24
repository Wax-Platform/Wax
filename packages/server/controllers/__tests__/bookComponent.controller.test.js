const clearDb = require('../../scripts/helpers/_clearDB')
const seedBookCollection = require('../../scripts/seeds/bookCollection')
const { createBook } = require('../book.controller')
const seedApplicationParameters = require('../../scripts/seeds/applicationParameters')
const { createDivision } = require('../division.controller')

const {
  addBookComponent,
  getBookComponent,
  deleteBookComponent,
  updateContent,
  renameBookComponent,
  updateComponentType,
  updateUploading,
  updateTrackChanges,
  updatePagination,
  getBookComponentAndAcquireLock,
  toggleIncludeInTOC,
  unlockBookComponent,
  lockBookComponent,
  updateWorkflowState,
  updateBookComponent,
} = require('../bookComponent.controller')

const seedUser = require('../../scripts/seeds/user')
const { createBookCollection } = require('../bookCollection.controller')
const Lock = require('../../models/lock/lock.model')

describe('Book Component Controller', () => {
  beforeEach(async () => {
    await clearDb()
  })

  it('should add component based on  divisionId, bookId, componentType,', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'
    const componentType = 'component'

    const newBook = await createBook({ collectionId: newCollection.id, title })

    const division = await createDivision({ bookId: newBook.id, label: 'body' })

    const bookComponent = await addBookComponent(
      division.id,
      newBook.id,
      componentType,
    )

    expect(bookComponent.divisionId).toBe(division.id)
    expect(bookComponent.bookId).toBe(newBook.id)
    expect(bookComponent.componentType).toBe(componentType)
  })

  it('should fetch book components based on book component Id', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'
    const componentType = 'component'

    const newBook = await createBook({ collectionId: newCollection.id, title })

    const division = await createDivision({ bookId: newBook.id, label: 'body' })

    const bookComponent1 = await addBookComponent(
      division.id,
      newBook.id,
      componentType,
    )

    const bookComponent2 = await getBookComponent(bookComponent1.id)

    expect(bookComponent2.id).toBe(bookComponent1.id)
  })

  it('should delete book component based on component passed', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'
    const componentType = 'component'

    const newBook = await createBook({ collectionId: newCollection.id, title })

    const division = await createDivision({ bookId: newBook.id, label: 'body' })

    const bookComponent = await addBookComponent(
      division.id,
      newBook.id,
      componentType,
    )

    const deletedBookComponent = await deleteBookComponent(bookComponent)

    expect(deletedBookComponent.deleted).toBe(true)
  })

  it('should update component type based on componentId', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'
    const initialComponentType = 'appendix'
    const updatedComponentType = 'endnotes'

    const newBook = await createBook({ collectionId: newCollection.id, title })

    const division = await createDivision({ bookId: newBook.id, label: 'body' })

    const bookComponent = await addBookComponent(
      division.id,
      newBook.id,
      initialComponentType,
    )

    const updatedBookComponent = await updateComponentType(
      bookComponent.id,
      updatedComponentType,
    )

    expect(updatedBookComponent.componentType).toBe(updatedComponentType)
    expect(updatedBookComponent.id).toBe(bookComponent.id)
  })

  it('should update content based on component id, languageIso', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'
    const componentType = 'component'
    const content = 'Test content'
    const languageIso = 'en'

    const newBook = await createBook({ collectionId: newCollection.id, title })

    const division = await createDivision({ bookId: newBook.id, label: 'body' })

    const bookComponent = await addBookComponent(
      division.id,
      newBook.id,
      componentType,
    )

    const updatedContent = await updateContent(
      bookComponent.id,
      content,
      languageIso,
    )

    expect(updatedContent.updatedContent.content).toBe(content)
    expect(updatedContent.updatedContent.bookComponentId).toBe(bookComponent.id)
  })

  it('should give correct state while uploading of book component', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'
    const componentType = 'component'
    const uploading = true

    const newBook = await createBook({ collectionId: newCollection.id, title })

    const division = await createDivision({ bookId: newBook.id, label: 'body' })

    const bookComponent = await addBookComponent(
      division.id,
      newBook.id,
      componentType,
    )

    const updateState = await updateUploading(bookComponent.id, uploading)

    expect(updateState.uploading).toBe(uploading)
    expect(bookComponent.id).toBe(updateState.bookComponentId)
  })

  it('should update trackChangesEnabled of component state', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'
    const componentType = 'component'
    const trackChangesEnabled = true

    const newBook = await createBook({ collectionId: newCollection.id, title })

    const division = await createDivision({ bookId: newBook.id, label: 'body' })

    const bookComponent = await addBookComponent(
      division.id,
      newBook.id,
      componentType,
    )

    const updateState = await updateTrackChanges(
      bookComponent.id,
      trackChangesEnabled,
    )

    expect(updateState.trackChangesEnabled).toBe(trackChangesEnabled)
    expect(bookComponent.id).toBe(updateState.bookComponentId)
  })

  it('should update pagination of book component based on component id and pagination order', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'
    const componentType = 'component'
    const pagination = { left: true, right: true }
    const newBook = await createBook({ collectionId: newCollection.id, title })

    const division = await createDivision({ bookId: newBook.id, label: 'body' })

    const bookComponent = await addBookComponent(
      division.id,
      newBook.id,
      componentType,
    )

    const updatePaginationOrder = await updatePagination(
      bookComponent.id,
      pagination,
    )

    expect(updatePaginationOrder.pagination).toEqual(pagination)
  })

  it('should getBookComponent and acquire lock', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'
    const componentType = 'component'
    const tabId = 'd3e73145-96f7-4f57-ae24-0c34a1568a95'
    const newBook = await createBook({ collectionId: newCollection.id, title })

    const user = await seedUser({
      username: 'user',
      password: 'password',
      email: 'user@example.com',
      givenNames: 'Test',
      surname: 'User',
    })

    const division = await createDivision({ bookId: newBook.id, label: 'body' })

    const bookComponent = await addBookComponent(
      division.id,
      newBook.id,
      componentType,
    )

    await getBookComponentAndAcquireLock(bookComponent.id, user.id, tabId)

    const locks = await Lock.find({
      foreignId: bookComponent.id,
    })

    expect(locks.result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          foreignId: bookComponent.id,
        }),
      ]),
    )
  })

  it('should update book component type  based on component id, patch', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'
    const componentType = 'component'

    const newBook = await createBook({ collectionId: newCollection.id, title })

    const division = await createDivision({ bookId: newBook.id, label: 'body' })

    const patch = {
      divisionId: division.id,
      componentType: 'introduction',
    }

    const bookComponent = await addBookComponent(
      division.id,
      newBook.id,
      componentType,
    )

    const updatedComponentType = await updateBookComponent(
      bookComponent.id,
      patch,
    )

    expect(updatedComponentType.componentType).toBe(patch.componentType)
  })

  it('should check change in value for includeInToc when toggleIncludeInToc is called', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'
    const componentType = 'component'

    const newBook = await createBook({ collectionId: newCollection.id, title })

    const division = await createDivision({ bookId: newBook.id, label: 'body' })

    const bookComponent = await addBookComponent(
      division.id,
      newBook.id,
      componentType,
    )

    const toc = await toggleIncludeInTOC(bookComponent.id)

    expect(toc).toHaveProperty('includeInToc')
  })

  it('should rename book component title based on bookComponentId, title, languageIso', async () => {
    await seedApplicationParameters()

    const componentType = 'component'
    const title = 'Title'
    const languageIso = 'en'
    const updatedTitle = 'Updated Title'

    const bookCollection = await createBookCollection(title, languageIso)

    const newBook = await createBook({ collectionId: bookCollection.id, title })

    const division = await createDivision({ bookId: newBook.id, label: 'body' })

    const bookComponent = await addBookComponent(
      division.id,
      newBook.id,
      componentType,
    )

    const rename = await renameBookComponent(
      bookComponent.id,
      updatedTitle,
      languageIso,
    )

    expect(rename.title).toBe(updatedTitle)
  })

  it('should unlock book component based on component id and userId', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'
    const componentType = 'chapter'
    const tabId = 'd3e73145-96f7-4f57-ae24-0c34a1568a95'
    const userAgent = 'UserAgent'

    const newBook = await createBook({ collectionId: newCollection.id, title })

    const user = await seedUser({
      username: 'user',
      password: 'password',
      email: 'user@example.com',
      givenNames: 'Test',
      surname: 'User',
    })

    const division = await createDivision({ bookId: newBook.id, label: 'body' })

    const bookComponent = await addBookComponent(
      division.id,
      newBook.id,
      componentType,
    )

    await lockBookComponent(bookComponent.id, tabId, userAgent, user.id)

    const unlockComponent = await unlockBookComponent(bookComponent.id, user.id)

    expect(unlockComponent).toBe(1)
  })

  it('should lock book component based on book component id , userAgent, userId', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'
    const componentType = 'component'
    const tabId = 'd3e73145-96f7-4f57-ae24-0c34a1568a95'
    const userAgent = 'UserAgent'

    const newBook = await createBook({ collectionId: newCollection.id, title })

    const user = await seedUser({
      username: 'user',
      password: 'password',
      email: 'user@example.com',
      givenNames: 'Test',
      surname: 'User',
    })

    const division = await createDivision({ bookId: newBook.id, label: 'body' })

    const bookComponent = await addBookComponent(
      division.id,
      newBook.id,
      componentType,
    )

    const lockComponent = await lockBookComponent(
      bookComponent.id,
      tabId,
      userAgent,
      user.id,
    )

    expect(lockComponent.userAgent).toBe(userAgent)
    expect(lockComponent.foreignId).toBe(bookComponent.id)
    expect(lockComponent.userId).toBe(user.id)
  })

  it('should update workFlow state of book component id based on workflowStages', async () => {
    const newCollection = await seedBookCollection()
    await seedApplicationParameters()
    const title = 'Test Book'
    const componentType = 'component'

    const workFlow = [
      {
        type: 'upload',
        label: 'Upload',
        value: 1,
      },
      { type: 'file_prep', label: 'File Prep', value: 1 },
      { type: 'edit', label: 'Edit', value: 1 },
      {
        type: 'review',
        label: 'Review',
        value: 0,
      },
      {
        type: 'clean_up',
        label: 'Clean Up',
        value: 1,
      },
      {
        type: 'page_check',
        label: 'Page Check',
        value: 1,
      },
      {
        type: 'final',
        label: 'Final',
        value: 1,
      },
    ]

    const newBook = await createBook({ collectionId: newCollection.id, title })

    const division = await createDivision({ bookId: newBook.id, label: 'body' })

    const bookComponent = await addBookComponent(
      division.id,
      newBook.id,
      componentType,
    )

    const updateWorkFlow = await updateWorkflowState(bookComponent.id, workFlow)

    expect(updateWorkFlow.trackChangesEnabled).toBe(true)
    expect(updateWorkFlow.bookComponentId).toBe(bookComponent.id)
  })
})
