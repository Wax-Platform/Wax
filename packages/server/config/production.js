module.exports = {
  templates: [
    // {
    //   label: "atla",
    //   url: "https://gitlab.coko.foundation/ketty-templates/atla",
    //   assetsRoot: "dist",
    //   supportedNoteTypes: ["footnotes"],
    // },
    {
      label: 'lategrey',
      url: 'https://gitlab.coko.foundation/ketty-templates/lategrey',
      assetsRoot: 'dist',
      supportedNoteTypes: ['chapterEnd'],
    },
    {
      label: 'significa',
      url: 'https://gitlab.coko.foundation/ketty-templates/significa',
      assetsRoot: 'dist',
      supportedNoteTypes: ['chapterEnd'],
    },
    {
      label: 'bikini',
      url: 'https://gitlab.coko.foundation/ketty-templates/bikini',
      assetsRoot: 'dist',
      supportedNoteTypes: ['chapterEnd'],
    },
    {
      label: 'vanilla',
      url: 'https://gitlab.coko.foundation/ketty-templates/vanilla',
      assetsRoot: 'dist',
      default: true,
      supportedNoteTypes: ['chapterEnd'],
    },
    {
      label: 'atosh',
      url: 'https://gitlab.coko.foundation/ketty-templates/atosh.git',
      assetsRoot: 'dist',
      supportedNoteTypes: ['chapterEnd'],
    },
    {
      label: 'eclypse',
      url: 'https://gitlab.coko.foundation/ketty-templates/eclypse.git',
      assetsRoot: 'dist',
      supportedNoteTypes: ['chapterEnd'],
    },
    {
      label: 'logical',
      url: 'https://gitlab.coko.foundation/ketty-templates/logical.git',
      assetsRoot: 'dist',
      supportedNoteTypes: ['chapterEnd'],
    },
    {
      label: 'tenberg',
      url: 'https://gitlab.coko.foundation/ketty-templates/tenberg.git',
      assetsRoot: 'dist',
      supportedNoteTypes: ['chapterEnd'],
    },
  ],
  mailer: {
    transport: {
      secure: true,
    },
  },
}
