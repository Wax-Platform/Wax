const { eslint } = require('@coko/lint')

eslint.settings = {
  'import/core-modules': ['ui'],
  // jest: {
  //   version: '27',
  // },
}

module.exports = eslint
