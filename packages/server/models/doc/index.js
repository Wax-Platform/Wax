const loaders = require('@coko/server/src/models/user/user.loaders')

const model = require('./doc.model')

module.exports = {
  model,
  modelName: 'Doc',
  modelLoaders: loaders,
}
