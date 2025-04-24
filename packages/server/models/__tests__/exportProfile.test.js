const { uuid } = require('@coko/server')

const Book = require('../book/book.model')
const Template = require('../template/template.model')
const ExportProfile = require('../exportProfile/exportProfile.model')
const clearDb = require('../../scripts/helpers/_clearDB')

describe('Export Profile model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = ExportProfile.knex()
    knex.destroy()
  })

  it('creates export profile', async () => {
    const template = await Template.insert({ name: 'test' })

    const book = await Book.insert({})

    const exportProfile = await ExportProfile.insert({
      displayName: 'Test',
      format: 'pdf',
      trimSize: '6x9',
      templateId: template.id,
      bookId: book.id,
    })

    expect(exportProfile).toBeDefined()
  })

  it('creates export profile with provider info', async () => {
    const template = await Template.insert({ name: 'test' })
    const book = await Book.insert({})

    const exportProfile = await ExportProfile.insert({
      displayName: 'Test',
      format: 'pdf',
      trimSize: '6x9',
      templateId: template.id,
      bookId: book.id,
      providerInfo: [
        {
          id: uuid(),
          externalProjectId: uuid(),
          bookMetadataHash: uuid(),
          bookContentHash: uuid(),
          templateHash: uuid(),
          lastSync: new Date().getTime(),
        },
      ],
    })

    expect(exportProfile).toBeDefined()
  })

  it('creates export profile for EPUB', async () => {
    const template = await Template.insert({ name: 'test' })
    const book = await Book.insert({})

    const exportProfile = await ExportProfile.insert({
      displayName: 'Test',
      format: 'epub',
      templateId: template.id,
      bookId: book.id,
    })

    expect(exportProfile).toBeDefined()
  })

  it('throws when invalid format is PDF and no trim size is provided', async () => {
    const template = await Template.insert({ name: 'test' })
    const book = await Book.insert({})
    await expect(
      ExportProfile.insert({
        displayName: 'Test',
        format: 'pdf',
        templateId: template.id,
        bookId: book.id,
      }),
    ).rejects.toThrow('trim size is required for PDF format')
  })

  it('throws when invalid format provided', async () => {
    const template = await Template.insert({ name: 'test' })
    const book = await Book.insert({})
    await expect(
      ExportProfile.insert({
        displayName: 'Test',
        format: 'invalid',
        templateId: template.id,
        bookId: book.id,
      }),
    ).rejects.toThrow('format: should be equal to one of the allowed values')
  })

  it('throws when invalid trim size provided', async () => {
    const template = await Template.insert({ name: 'test' })
    const book = await Book.insert({})
    await expect(
      ExportProfile.insert({
        displayName: 'Test',
        format: 'pdf',
        trimSize: '0x7',
        templateId: template.id,
        bookId: book.id,
      }),
    ).rejects.toThrow('trimSize: should be equal to one of the allowed values')
  })

  it('throws when format is EPUB and trim size is provided', async () => {
    const template = await Template.insert({ name: 'test' })
    const book = await Book.insert({})
    await expect(
      ExportProfile.insert({
        displayName: 'Test',
        format: 'epub',
        trimSize: '6x9',
        templateId: template.id,
        bookId: book.id,
      }),
    ).rejects.toThrow('trim size is only valid option for PDF format')
  })

  it('associated records get deleted when book is deleted', async () => {
    const template = await Template.insert({ name: 'test' })

    const book = await Book.insert({})

    await ExportProfile.insert({
      displayName: 'Test',
      format: 'pdf',
      trimSize: '6x9',
      templateId: template.id,
      bookId: book.id,
    })

    await ExportProfile.insert({
      displayName: 'Test',
      format: 'pdf',
      trimSize: '6x9',
      templateId: template.id,
      bookId: book.id,
    })

    await Book.deleteById(book.id)

    const { result: exportProfiles } = await ExportProfile.find({
      bookId: book.id,
    })

    expect(exportProfiles).toHaveLength(0)
  })
})
