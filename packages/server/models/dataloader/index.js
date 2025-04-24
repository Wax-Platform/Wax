const userLoaderModel = require('./loaders/userLoader')
const bookComponentStateLoaderModel = require('./loaders/bookComponentStateLoader')
const divisionLoaderModel = require('./loaders/divisionLoader')

module.exports = {
  models: [
    { modelName: 'UserLoader', model: userLoaderModel },
    {
      modelName: 'BookComponentStateLoader',
      model: bookComponentStateLoaderModel,
    },
    {
      modelName: 'DivisionLoader',
      model: divisionLoaderModel,
    },
  ],
}
