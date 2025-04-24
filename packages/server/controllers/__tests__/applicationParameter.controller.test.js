const {
  getApplicationParameters,
  updateApplicationParameters,
} = require('../applicationParameter.controller')

const seedApplicationParameters = require('../../scripts/seeds/applicationParameters')
const clearDb = require('../../scripts/helpers/_clearDB')

describe('Application Parameter Controller', () => {
  beforeEach(async () => {
    await clearDb()
  })

  it('should fetch application parameters based on context and area for vanilla', async () => {
    await seedApplicationParameters()
    const context = 'bookBuilder'
    const area = 'divisions'
    const applicationParameter = await getApplicationParameters(context, area)

    expect(applicationParameter).toBeDefined()
    expect(applicationParameter.context).toBe(context)
    expect(applicationParameter.area).toBe(area)
  })

  it('should update application parameters based on context, area and config', async () => {
    await seedApplicationParameters()
    const context = 'bookBuilder'
    const area = 'divisions'

    const config = [
      {
        name: 'Frontmatter',
        defaultComponentType: 'component',
        allowedComponentTypes: [
          {
            title: 'Component',
            value: 'component',
            predefined: true,
            visibleInHeader: true,
          },
          {
            title: 'Introduction',
            value: 'introduction',
            predefined: true,
            visibleInHeader: false,
          },
          {
            title: 'Preface',
            value: 'preface',
            predefined: true,
            visibleInHeader: false,
          },
          {
            title: 'Half Title',
            value: 'halftitle',
            predefined: true,
            visibleInHeader: false,
          },
          {
            title: 'Title Page',
            value: 'titlepage',
            predefined: true,
            visibleInHeader: false,
          },
          {
            title: 'Cover',
            value: 'cover',
            predefined: true,
            visibleInHeader: false,
          },
        ],
        showNumberBeforeComponents: [],
      },
      {
        name: 'Body',
        defaultComponentType: 'chapter',
        allowedComponentTypes: [
          {
            title: 'Part',
            value: 'part',
            predefined: true,
            visibleInHeader: true,
          },
          {
            title: 'Chapter',
            value: 'chapter',
            predefined: true,
            visibleInHeader: true,
          },
          {
            title: 'Unnumbered',
            value: 'unnumbered',
            predefined: true,
            visibleInHeader: true,
          },
        ],
        showNumberBeforeComponents: ['part', 'chapter'],
      },
      {
        name: 'Backmatter',
        defaultComponentType: 'component',
        allowedComponentTypes: [
          {
            title: 'Component',
            value: 'component',
            predefined: true,
            visibleInHeader: true,
          },
          {
            title: 'Appendix',
            value: 'appendix',
            predefined: true,
            visibleInHeader: false,
          },
          {
            title: 'notes placeholder',
            value: 'endnotes',
            predefined: true,
            visibleInHeader: true,
          },
          {
            title: 'Index',
            value: 'index',
            predefined: true,
            visibleInHeader: true,
          },
        ],
        showNumberBeforeComponents: [],
      },
    ]

    const applicationParameter = await updateApplicationParameters(
      context,
      area,
      config,
    )

    expect(applicationParameter.config).toEqual(config)
    expect(applicationParameter.context).toBe(context)
    expect(applicationParameter.area).toBe(area)
  })
})
