const {
  addCustomTag,
  getCustomTags,
  updateCustomTag,
} = require('../customTags.controller')

const clearDb = require('../../scripts/helpers/_clearDB')

describe('Custom Tag Controller', () => {
  beforeEach(async () => {
    await clearDb()
  })

  it('should add custom tags based on tagType, label', async () => {
    const label = 'Test Label'
    const tagType = 'Test Tag Type'

    const customTag = await addCustomTag(label, tagType)

    expect(customTag.label).toBe(label)
    expect(customTag.tagType).toBe(tagType)
  })

  it('should fetch all custom tags', async () => {
    const labelOne = 'Test Label One'
    const labelTwo = 'Test Label Two'
    const tagTypeOne = 'Test TagType One'
    const tagTypeTwo = 'Test TagType Two'

    const options = {}

    await addCustomTag(labelOne, tagTypeOne)
    await addCustomTag(labelTwo, tagTypeTwo)

    const allCustomTags = await getCustomTags(options)

    expect(allCustomTags).toHaveLength(2)
    expect(allCustomTags[0].label).toBe(labelOne)
    expect(allCustomTags[1].label).toBe(labelTwo)
  })

  it('should update custom tags based custom tag id', async () => {
    const initialLabel = 'Initial Label'
    const tagType = 'Test Tag Type'
    const updatedLabel = 'Updated Label'

    const customTag = await addCustomTag(initialLabel, tagType)

    const tag = [
      {
        id: customTag.id,
        deleted: customTag.deleted,
        tagType: customTag.tagType,
        label: updatedLabel,
      },
    ]

    const updateCustomTags = await updateCustomTag(tag)

    expect(updateCustomTags[0].id).toBe(customTag.id)
    expect(updateCustomTags[0].label).toBe(updatedLabel)
  })
})
