const config = require('config')

const featureAIEnabled =
  (process.env.AI_ENABLED && JSON.parse(process.env.AI_ENABLED)) || false

const chatGPT = config.has('chatGPT') && config.get('chatGPT')

const integrations = config.has('integrations') && config.get('integrations')

module.exports = {
  instance: 'KETIDA_V2',
  stages: [
    {
      title: 'Upload',
      type: 'upload',
    },
    {
      title: 'File Prep',
      type: 'file_prep',
    },
    {
      title: 'Edit',
      type: 'edit',
    },
    {
      title: 'Review',
      type: 'review',
    },
    {
      title: 'Clean Up',
      type: 'clean_up',
    },
    {
      title: 'Page Check',
      type: 'page_check',
    },
    {
      title: 'Final',
      type: 'final',
    },
  ],
  divisions: [
    {
      name: 'Frontmatter',
      showNumberBeforeComponents: [],
      allowedComponentTypes: [
        {
          value: 'component',
          title: 'Component',
          predefined: true,
          visibleInHeader: true,
        },
        {
          value: 'introduction',
          title: 'Introduction',
          predefined: true,
          visibleInHeader: false,
        },
        {
          value: 'preface',
          title: 'Preface',
          predefined: true,
          visibleInHeader: false,
        },
        {
          value: 'halftitle',
          title: 'Half Title',
          predefined: true,
          visibleInHeader: false,
        },
        {
          value: 'titlepage',
          title: 'Title Page',
          predefined: true,
          visibleInHeader: false,
        },
        {
          value: 'cover',
          title: 'Cover',
          predefined: true,
          visibleInHeader: false,
        },
      ],
      defaultComponentType: 'component',
    },
    {
      name: 'Body',
      showNumberBeforeComponents: ['part', 'chapter'],
      allowedComponentTypes: [
        {
          value: 'part',
          title: 'Part',
          predefined: true,
          visibleInHeader: true,
        },
        {
          value: 'chapter',
          title: 'Chapter',
          predefined: true,
          visibleInHeader: true,
        },
        {
          value: 'unnumbered',
          title: 'Unnumbered',
          predefined: true,
          visibleInHeader: true,
        },
      ],
      defaultComponentType: 'chapter',
    },
    {
      name: 'Backmatter',
      showNumberBeforeComponents: [],
      allowedComponentTypes: [
        {
          value: 'component',
          title: 'Component',
          predefined: true,
          visibleInHeader: true,
        },
        {
          value: 'appendix',
          title: 'Appendix',
          predefined: true,
          visibleInHeader: false,
        },
        {
          value: 'endnotes',
          title: 'notes placeholder',
          visibleInHeader: true,
          predefined: true,
        },
      ],
      defaultComponentType: 'component',
    },
  ],
  lockTrackChangesWhenReviewing: false,
  aiEnabled: featureAIEnabled,
  chatGptApiKey: chatGPT?.key,
  heartbeatInterval: process.env.WS_HEARTBEAT_INTERVAL || 5000,
  integrations,
  termsAndConditions: '',
  exportsConfig: {
    pdfDownload: {
      enabled: true,
    },
    epubDownload: {
      enabled: true,
    },
    webPublish: {
      enabled: true,
    },
  },
  languages: [
    {
      code: 'en-GB',
      name: 'English',
      flagCode: 'gb',
      enabled: true,
      standardised: true,
      standard: {
        name: 'English',
        flagCode: 'gb',
      },
    },
  ],
}
