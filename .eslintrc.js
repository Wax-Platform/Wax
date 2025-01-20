const { eslint } = require('@coko/lint')

eslint.settings = {
  'import/core-modules': ['ui'],
  // jest: {
  //   version: '27',
  // },
}
eslint.rules = {
  ...eslint.rules,
  'no-unused-vars': 'error', // Enable no-unused-vars rule
}

module.exports = eslint
