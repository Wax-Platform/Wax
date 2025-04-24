const featureAIEnabled =
  (process.env.AI_ENABLED && JSON.parse(process.env.AI_ENABLED)) || false

module.exports = {
  instance: 'VANILLA',
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
        {
          value: 'copyright-page',
          title: 'Copyright Page',
          predefined: true,
          visibleInHeader: false,
        },
      ],
      defaultComponentType: 'component',
    },
    {
      name: 'Body',
      showNumberBeforeComponents: ['unit', 'chapter'],
      allowedComponentTypes: [
        {
          value: 'unnumbered',
          title: 'Unnumbered',
          predefined: true,
          visibleInHeader: true,
        },
      ],
      defaultComponentType: 'component',
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
  lockTrackChangesWhenReviewing: true,
  aiEnabled: featureAIEnabled,
  heartbeatInterval: process.env.WS_HEARTBEAT_INTERVAL || 5000,
}
