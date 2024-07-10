const loaders = require('@coko/server/src/models/user/user.loaders')

const model = require('./user.model')

module.exports = {
  model,
  modelName: 'User',
  modelLoaders: loaders,
}
