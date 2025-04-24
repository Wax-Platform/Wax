const { uuid } = require('@coko/server')
const clearDb = require('../../scripts/helpers/_clearDB')
const { createBook } = require('../book.controller')

const {
  createExportProfile,
  updateExportProfile,
  deleteExportProfile,
  getBookExportProfiles,
  getExportProfile,
} = require('../exportProfile.controller')

const { createTemplate } = require('../template.controller')
const seedApplicationParams = require('../../scripts/seeds/applicationParameters')

describe('Export Profile Controller', () => {
  beforeEach(async () => {
    await clearDb()
    await seedApplicationParams()
  })

  it('creates an export profile when all the required attributes are provided', async () => {
    const newBook = await createBook()
    const template = await createTemplate('A Template')

    const newExportProfile = await createExportProfile({
      bookId: newBook.id,
      displayName: 'Hardcover',
      format: 'pdf',
      templateId: template.id,
      trimSize: '6x9',
    })

    expect(newExportProfile).toBeDefined()
  })

  it('throws when bookId does not exist in books table', async () => {
    const template = await createTemplate('A Template')

    await expect(
      createExportProfile({
        bookId: uuid(),
        displayName: 'Hardcover',
        format: 'pdf',
        templateId: template.id,
        trimSize: '6x9',
      }),
    ).rejects.toThrow(
      /violates foreign key constraint "export_profiles_bookid_foreign"/,
    )
  })

  it('throws when templateId does not exist in templates table', async () => {
    const newBook = await createBook()

    await expect(
      createExportProfile({
        bookId: newBook.id,
        displayName: 'Hardcover',
        format: 'pdf',
        templateId: uuid(),
        trimSize: '6x9',
      }),
    ).rejects.toThrow(
      /violates foreign key constraint "export_profiles_templateid_foreign"/,
    )
  })

  it('throws when format is not provided', async () => {
    const newBook = await createBook()
    const template = await createTemplate('A Template')

    await expect(
      createExportProfile({
        bookId: newBook.id,
        displayName: 'Hardcover',
        templateId: template.id,
        trimSize: '6x9',
      }),
    ).rejects.toThrow(/format: is a required property/)
  })

  it('throws when trimSize is not valid', async () => {
    const newBook = await createBook()
    const template = await createTemplate('A Template')

    await expect(
      createExportProfile({
        bookId: newBook.id,
        displayName: 'Hardcover',
        templateId: template.id,
        trimSize: '6x7',
        format: 'pdf',
      }),
    ).rejects.toThrow(/trimSize: should be equal to one of the allowed values/)
  })

  it('throws when trimSize is not provided for the pdf format', async () => {
    const newBook = await createBook()
    const template = await createTemplate('A Template')

    await expect(
      createExportProfile({
        bookId: newBook.id,
        displayName: 'Hardcover',
        templateId: template.id,
        format: 'pdf',
      }),
    ).rejects.toThrow(/trim size is required for PDF format/)
  })

  it('throws when trimSize is provided for the epub format', async () => {
    const newBook = await createBook()
    const template = await createTemplate('A Template')

    await expect(
      createExportProfile({
        bookId: newBook.id,
        displayName: 'Hardcover',
        templateId: template.id,
        trimSize: '6x9',
        format: 'epub',
      }),
    ).rejects.toThrow(/trim size is only valid option for PDF format/)
  })

  it('updates an export profile when correct info provided', async () => {
    const newBook = await createBook()
    const template = await createTemplate('A Template')

    const newExportProfile = await createExportProfile({
      bookId: newBook.id,
      displayName: 'Hardcover',
      format: 'pdf',
      templateId: template.id,
      trimSize: '6x9',
    })

    const updatedExportProfile = await updateExportProfile(
      newExportProfile.id,
      { trimSize: '8.5x11' },
    )

    expect(updatedExportProfile).toBeDefined()
    expect(updatedExportProfile.trimSize).toEqual('8.5x11')
  })

  it('throws when update an export profile with invalid trimSize', async () => {
    const newBook = await createBook()
    const template = await createTemplate('A Template')

    const newExportProfile = await createExportProfile({
      bookId: newBook.id,
      displayName: 'Hardcover',
      format: 'pdf',
      templateId: template.id,
      trimSize: '6x9',
    })

    await expect(
      updateExportProfile(newExportProfile.id, { trimSize: '6x7' }),
    ).rejects.toThrow(/trimSize: should be equal to one of the allowed values/)
  })

  it('throws when update sets trimSize for epub format', async () => {
    const newBook = await createBook()
    const template = await createTemplate('A Template')

    const newExportProfile = await createExportProfile({
      bookId: newBook.id,
      displayName: 'Hardcover',
      format: 'epub',
      templateId: template.id,
    })

    await expect(
      updateExportProfile(newExportProfile.id, { trimSize: '6x9' }),
    ).rejects.toThrow(/trim size is only valid option for PDF format/)
  })

  it('deletes an existing export profile', async () => {
    const newBook = await createBook()
    const template = await createTemplate('A Template')

    const newExportProfile = await createExportProfile({
      bookId: newBook.id,
      displayName: 'Hardcover',
      format: 'pdf',
      templateId: template.id,
      trimSize: '6x9',
    })

    await deleteExportProfile(newExportProfile.id)

    const { result: availableExportProfiles } = await getBookExportProfiles(
      newBook.id,
    )

    expect(availableExportProfiles).toHaveLength(0)
  })

  it('gets book export profiles', async () => {
    const newBook = await createBook()
    const template = await createTemplate('A Template')

    const newExportProfile = await createExportProfile({
      bookId: newBook.id,
      displayName: 'Hardcover',
      format: 'pdf',
      templateId: template.id,
      trimSize: '6x9',
    })

    const { result: availableExportProfiles } = await getBookExportProfiles(
      newBook.id,
    )

    expect(availableExportProfiles).toHaveLength(1)
    expect(availableExportProfiles[0].id).toEqual(newExportProfile.id)
  })

  it('gets export profile', async () => {
    const newBook = await createBook()
    const template = await createTemplate('A Template')

    const newExportProfile = await createExportProfile({
      bookId: newBook.id,
      displayName: 'Hardcover',
      format: 'pdf',
      templateId: template.id,
      trimSize: '6x9',
    })

    const availableExportProfile = await getExportProfile(newExportProfile.id)

    expect(availableExportProfile).toBeDefined()
    expect(availableExportProfile.id).toEqual(newExportProfile.id)
  })
})
