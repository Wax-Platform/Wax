const { commitizen } = require('@coko/lint')

commitizen.scopes = ['client', 'server', 'api', 'models', '*']

module.exports = commitizen
